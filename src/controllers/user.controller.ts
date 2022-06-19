import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import ApiResponse from '../models/api-response';
import { InvalidOperationException } from '../models/Invalid-operation-exception';
import UserService from '../services/user.service';
import logger from '../utils/logger';
import MagicNumberUtility from '../utils/magic-number/magic-number-utility';
import BaseController from './base.controller';

export default class UserController extends BaseController {
  private readonly _userService: UserService;

  constructor(userService: UserService) {
    super();
    this._userService = userService;
  }

  public saveUser = async (req: Request, res: Response) => {
    const { username, name, email, password } = req.body;
    logger.info(`User.saveUser beginning ${req.path}`);
    const result = await this._userService.saveUser({ username, name, email, password });
    logger.info(`User.saveUser returning`);
    return this.sendResponse(res, result);
  };

  public editProfile = async (req: Request, res: Response) => {
    const { username, name, email, mobile } = req.body;
    logger.info(`User.editProfile beginning ${req.path}`);
    const result = await this._userService.editProfile({ username, name, email, mobile });
    logger.info(`User.editProfile returning`);
    return this.sendResponse(res, result);
  };

  public updateEmailAddress = async (req: Request, res: Response) => {
    const { password, email } = req.body;

    logger.info(`User.updateEmailAddress beginning ${req.path}`);

    let result: ApiResponse;
    const filter = { username: req.currentUsername };
    result = await this._userService.validateUser(filter, password, req.__('passwordWrong'));

    if (!result.isSuccess) {
      return this.sendResponse(res, new ApiResponse({ password: result.content }, result.statusCode));
    }

    result = await this._userService.updateEmailAddress(email);

    logger.info(`User.updateEmailAddress returning`);

    return this.sendResponse(res, result);
  };

  public uploadAvatar = async (req: Request, res: Response) => {
    const avatar = req.file as Express.Multer.File;
    const fileBytes = avatar?.buffer;

    if (!fileBytes) {
      throw new InvalidOperationException('poster have no content', 'posterContentValidation');
    }

    logger.info(`User.uploadAvatar beginning ${req.path}`);

    const m = new MagicNumberUtility(fileBytes, avatar.mimetype);

    if (!m.isImageType) {
      throw new InvalidOperationException(
        'Poster contents don’t match the file extension.',
        'posterContentCheckValidation'
      );
    }

    const result = await this._userService.updateAvatar(fileBytes);
    logger.info(`User.uploadAvatar returning`);
    return this.sendResponse(res, result);
  };

  public removeAvatar = async (req: Request, res: Response) => {
    logger.info(`User.removeAvatar beginning ${req.path}`);
    const result = await this._userService.updateAvatar();
    logger.info(`User.removeAvatar returning`);
    return this.sendResponse(res, result);
  };

  public getProfile = async (req: Request, res: Response) => {
    logger.info(`User.getProfile beginning ${req.path}`);
    const profile = await this._userService.getProfile();
    logger.info(`User.getProfile returning`);
    return this.sendResponse(res, profile);
  };

  public getAllUsers = async (req: Request, res: Response) => {
    logger.info(`User.getAllUsers beginning ${req.path}`);
    const response = await this._userService.getAllUsers();
    logger.info(`User.getAllUsers returning`);
    return this.sendResponse(res, response);
  };

  public deleteUser = async (req: Request, res: Response) => {
    const username = req.params.username ?? req.currentUsername;
    logger.info(`User.delete beginning ${req.path} ${req.route}`);
    const result = await this._userService.deleteUser(username);
    logger.info(`User.delete returning`);
    return this.sendResponse(res, result);
  };

  public deleteUserAccount = async (req: Request, res: Response) => {
    const password = req.body.password;
    const username = req.currentUsername;
    logger.info(`User.deleteUserAccount beginning ${req.path}`);

    let result: ApiResponse;
    const filter = { username };
    result = await this._userService.validateUser(filter, password, req.__('passwordWrong'));

    if (result.statusCode === StatusCodes.OK) {
      result = await this._userService.deleteUser(username);
    }

    logger.info(`User.deleteUserAccount returning`);
    return this.sendResponse(res, result);
  };

  public getUserPermissions = async (req: Request, res: Response) => {
    logger.info(`User.getUserPermissions beginning ${req.path}`);
    const results = await this._userService.getUserPermissions();
    logger.info(`User.getUserPermissions returning`);
    return this.sendResponse(res, new ApiResponse(results));
  };
}
