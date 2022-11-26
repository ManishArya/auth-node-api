import QueryDAL from '../data-access/query.dal';
import IAddressSchema from '../models/interfaces/address-schema';
import { NotFoundException } from '../models/Invalid-operation-exception';

export default class AddressService {
  private readonly _username: string;
  private readonly _addressDAL: QueryDAL<IAddressSchema>;

  constructor(username: string, addressDAL: QueryDAL<IAddressSchema>) {
    this._username = username;
    this._addressDAL = addressDAL;
  }

  public async getAllAddress() {
    return await this._addressDAL.getSortedFilterLeanRecords({ username: this._username }, { createdAt: -1 });
  }

  public async saveAddress(updatingAddress: IAddressSchema): Promise<any> {
    if (!updatingAddress?._id) {
      return await this.addAddress(updatingAddress);
    } else {
      return await this.updateAddress(updatingAddress);
    }
  }

  public async deleteAddress(id: string) {
    const address = await this._addressDAL.getFilterLeanRecord({ _id: id });

    if (!address) {
      throw new NotFoundException('', '');
    }

    await this._addressDAL.deleteRecord({ _id: id });

    if (address.default) {
      const defaultAddress = await this._addressDAL.getFilterRecord({ username: this._username });
      if (defaultAddress) {
        defaultAddress.default = true;
        await defaultAddress.save();
      }
    }
  }

  private async addAddress(newAddress: IAddressSchema) {
    const defaultValue = newAddress.default;
    const defultOldAddress = await this._addressDAL.getFilterRecord({ username: this._username, default: true });

    if (defultOldAddress && defaultValue) {
      defultOldAddress.default = !defaultValue;
      newAddress.default = defaultValue;
    } else {
      newAddress.default = defaultValue || !defultOldAddress;
    }

    newAddress.username = this._username;
    await this._addressDAL.saveRecord(newAddress);
    await defultOldAddress?.save();
  }

  private async updateAddress(updatingAddress: IAddressSchema) {
    const address = await this._addressDAL.getFilterLeanRecord({ _id: updatingAddress._id });

    if (!address) {
      throw new NotFoundException('', '');
    }

    let filterQuery = null;
    const defaultValue = updatingAddress.default;
    const count = await this._addressDAL.getRecordCount();
    if (count > 1) {
      if (address.default && !defaultValue) {
        filterQuery = {
          username: this._username,
          _id: { $ne: address._id }
        };
      } else if (!address.default && defaultValue) {
        filterQuery = {
          username: this._username,
          default: true
        };
      }
    } else {
      updatingAddress.default = true;
    }

    updatingAddress.username = this._username;
    await this._addressDAL.updateRecord({ _id: address._id }, updatingAddress);

    if (filterQuery) {
      const defaultAddress = await this._addressDAL.getFilterRecord(filterQuery);
      if (defaultAddress) {
        defaultAddress.default = !defaultValue;
        await defaultAddress.save();
      }
    }
  }
}
