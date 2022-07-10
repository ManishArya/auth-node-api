import { AddressType } from '../../enums/address-type';
import BaseSchema from './base-schema';

export default interface IAddressSchema extends BaseSchema {
  username: string;
  name: string;
  mobileNumber: string;
  city: string;
  state: string;
  pincode: string;
  area: string;
  street: string;
  landmark?: string;
  default: boolean;
  addressType: AddressType;
}
