import { Request, Response } from 'express';
import ApiResponse from '../models/api-response';
import IAddressSchema from '../models/interfaces/address-schema';
import AddressService from '../services/address.service';
import BaseController from './base.controller';

export default class AddressController extends BaseController {
  private readonly _addressService: AddressService;

  constructor(addressService: AddressService) {
    super();
    this._addressService = addressService;
  }

  public getAllAddress = async (req: Request, res: Response) => {
    const addresses = await this._addressService.getAllAddress();

    return this.sendResponse(res, new ApiResponse(addresses));
  };

  public addNewAddress = async (req: Request, res: Response) => {
    const address = req.body as IAddressSchema;

    await this._addressService.addNewAddress(address);

    return this.sendResponse(res, new ApiResponse('Saved successfully'));
  };

  public updateAddress = async (req: Request, res: Response) => {
    const address = req.body as IAddressSchema;

    await this._addressService.updateAddress(address);

    return this.sendResponse(res, new ApiResponse('Update successfully'));
  };

  public deleteAddress = async (req: Request, res: Response) => {
    const id = req.query.id as string;

    await this._addressService.deleteAddress(id);

    return this.sendResponse(res, new ApiResponse('Deleted successfully'));
  };
}
