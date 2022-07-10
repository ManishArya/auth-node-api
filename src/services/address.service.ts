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
    return await this._addressDAL.getFilterLeanRecords({ username: this._username });
  }

  public async addNewAddress(newAddress: IAddressSchema) {
    const defaultValue = newAddress.default;
    const defultOldAddress = await this._addressDAL.getFilterRecord({ username: this._username, default: true });

    if (defultOldAddress && defaultValue) {
      defultOldAddress.default = false;
      newAddress.default = true;
    } else {
      newAddress.default = defaultValue || !defultOldAddress;
    }

    newAddress.username = this._username;
    await this._addressDAL.saveRecord(newAddress);
    await defultOldAddress?.save();
  }

  public async updateAddress(updatingAddress: IAddressSchema) {
    const address = await this._addressDAL.getFilterLeanRecord({ _id: updatingAddress._id });

    if (!address) {
      throw new NotFoundException('', '');
    }

    const defaultValue = updatingAddress.default;
    let filterQuery = null;
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
}
