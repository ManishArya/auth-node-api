import QueryDAL from '../data-access/query.dal';
import IAddressSchema from '../models/interfaces/address-schema';
import { NotFoundException } from '../models/Invalid-operation-exception';

export default class AddressService {
  private readonly _userId: string;
  private readonly _addressDAL: QueryDAL<IAddressSchema>;

  constructor(userId: string, addressDAL: QueryDAL<IAddressSchema>) {
    this._userId = userId;
    this._addressDAL = addressDAL;
  }

  public async getAllAddressAsync() {
    return await this._addressDAL.getSortedFilterLeanRecordsAsync({ userId: this._userId }, { createdAt: -1 });
  }

  public async saveAddressAsync(updatingAddress: IAddressSchema): Promise<any> {
    if (!updatingAddress?._id) {
      return await this.addAddressAsync(updatingAddress);
    } else {
      return await this.updateAddressAsync(updatingAddress);
    }
  }

  public async deleteAddressAsync(id: string) {
    const address = await this._addressDAL.getFilterLeanRecordAsync({ _id: id });

    if (!address) {
      throw new NotFoundException('', '');
    }

    await this._addressDAL.deleteRecordAsync({ _id: id });

    if (address.default) {
      const defaultAddress = await this._addressDAL.getFilterRecordAsync({ userId: this._userId });
      if (defaultAddress) {
        defaultAddress.default = true;
        await defaultAddress.save();
      }
    }
  }

  private async addAddressAsync(newAddress: IAddressSchema) {
    const defaultValue = newAddress.default;
    const defultOldAddress = await this._addressDAL.getFilterRecordAsync({ userId: this._userId, default: true });

    if (defultOldAddress && defaultValue) {
      defultOldAddress.default = !defaultValue;
      newAddress.default = defaultValue;
    } else {
      newAddress.default = defaultValue || !defultOldAddress;
    }

    newAddress.userId = this._userId;
    await this._addressDAL.saveRecordAsync(newAddress);
    await defultOldAddress?.save();
  }

  private async updateAddressAsync(updatingAddress: IAddressSchema) {
    const address = await this._addressDAL.getFilterLeanRecordAsync({ _id: updatingAddress._id });

    if (!address) {
      throw new NotFoundException('', '');
    }

    let filterQuery = null;
    const defaultValue = updatingAddress.default;
    const count = await this._addressDAL.getRecordCountAsync();
    if (count > 1) {
      if (address.default && !defaultValue) {
        filterQuery = {
          userId: this._userId,
          _id: { $ne: address._id }
        };
      } else if (!address.default && defaultValue) {
        filterQuery = {
          userId: this._userId,
          default: true
        };
      }
    } else {
      updatingAddress.default = true;
    }

    updatingAddress.userId = this._userId;
    await this._addressDAL.updateRecordAsync({ _id: address._id }, updatingAddress);

    if (filterQuery) {
      const defaultAddress = await this._addressDAL.getFilterRecordAsync(filterQuery);
      if (defaultAddress) {
        defaultAddress.default = !defaultValue;
        await defaultAddress.save();
      }
    }
  }
}
