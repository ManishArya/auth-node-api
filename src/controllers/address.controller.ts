import { Request, Response } from 'express';
import ApiResponse from '../models/api-response';
import IAddressSchema from '../models/interfaces/address-schema';
import AddressService from '../services/address.service';
import logger from '../utils/logger';
import BaseController from './base.controller';

export default class AddressController extends BaseController {
  private readonly _addressService: AddressService;

  constructor(addressService: AddressService) {
    super();
    this._addressService = addressService;
  }

  public getAllAddress = async (req: Request, res: Response) => {
    logger.info(`Address.getAllAddress beginning ${req.path}`);

    const addresses = await this._addressService.getAllAddress();

    logger.info(`Address.getAllAddress returning`);
    return this.sendResponse(res, new ApiResponse(addresses.sort((x, y) => (x.default ? -1 : 0))));
  };

  public saveAddress = async (req: Request, res: Response) => {
    logger.info(`Address.saveAddress beginning ${req.path}`);
    const address = req.body as IAddressSchema;

    await this._addressService.saveAddress(address);

    logger.info(`Address.saveAddress returning`);
    return this.sendResponse(res, new ApiResponse('Update successfully'));
  };

  public deleteAddress = async (req: Request, res: Response) => {
    logger.info(`Address.deleteAddress beginning ${req.path}`);
    const id = req.query.id as string;

    await this._addressService.deleteAddress(id);
    logger.info(`Address.deleteAddress returning`);
    return this.sendResponse(res, new ApiResponse('Deleted successfully'));
  };
}
