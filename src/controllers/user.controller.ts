import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import ApiResponse from '../models/api-response';
import { InvalidOperationException } from '../models/Invalid-operation-exception';
import AuthService from '../services/auth.service';
import UserService from '../services/user.service';
import logger from '../utils/logger';
import MagicNumberUtility from '../utils/magic-number/magic-number-utility';
import BaseController from './base.controller';

export default class UserController extends BaseController {
  private readonly _authService: AuthService;
  private readonly _userService: UserService;

  constructor(authService: AuthService, userService: UserService) {
    super();
    this._authService = authService;
    this._userService = userService;
  }

  public SaveUser = async (req: Request, res: Response) => {
    const { username, name, email, password } = req.body;
    logger.info(`User.Newuser beginning ${req.path}`);
    const result = await this._userService.saveUser({ username, name, email, password });
    logger.info(`User.NewUser returning`);
    return this.SendResponse(res, result);
  };

  public EditProfile = async (req: Request, res: Response) => {
    const { username, name, email, mobile } = req.body;
    logger.info(`User.Edit beginning ${req.path}`);
    const result = await this._userService.editProfile({ username, name, email, mobile });
    logger.info(`User.Edit returning`);
    return this.SendResponse(res, result);
  };

  public UpdateEmailAddress = async (req: Request, res: Response) => {
    const { password, email } = req.body;

    logger.info(`User.updateEmailAddress beginning ${req.path}`);

    let result: ApiResponse;
    const filter = { username: req.currentUsername };
    result = await this._authService.validateUser(filter, password, req.__('passwordWrong'));

    if (!result.isSuccess) {
      return this.SendResponse(res, new ApiResponse({ password: result.content }, result.statusCode));
    }

    result = await this._userService.updateEmailAddress(email);

    logger.info(`User.updateEmailAddress returning`);

    return this.SendResponse(res, result);
  };

  public UploadAvatar = async (req: Request, res: Response) => {
    const avatar = req.file as Express.Multer.File;
    const fileBytes = avatar?.buffer;

    if (!fileBytes) {
      throw new InvalidOperationException('poster have no content', 'posterContentValidation');
    }

    logger.info(`User.UploadAvatar beginning ${req.path}`);

    const m = new MagicNumberUtility(fileBytes, avatar.mimetype);

    if (!m.isImageType) {
      throw new InvalidOperationException(
        'Poster contents don’t match the file extension.',
        'posterContentCheckValidation'
      );
    }

    const result = await this._userService.updateAvatar(fileBytes);
    logger.info(`User.UploadAvatar returning`);
    return this.SendResponse(res, result);
  };

  public RemoveAvatar = async (req: Request, res: Response) => {
    logger.info(`User.RemoveAvatar beginning ${req.path}`);
    const result = await this._userService.updateAvatar();
    logger.info(`User.RemoveAvatar returning`);
    return this.SendResponse(res, result);
  };

  public GetProfile = async (req: Request, res: Response) => {
    logger.info(`User.GetProfile beginning ${req.path}`);
    const profile = await this._userService.getProfile();
    logger.info(`User.GetProfile returning`);
    return this.SendResponse(res, profile);
  };

  public GetAllUsers = async (req: Request, res: Response) => {
    logger.info(`GetAllUsers.All beginning ${req.path}`);
    const response = await this._userService.getUsers();
    logger.info(`ManageUser.All returning`);
    return this.SendResponse(res, response);
  };

  public DeleteUser = async (req: Request, res: Response) => {
    const username = req.params.username ?? req.currentUsername;
    logger.info(`ManageUser.Delete beginning ${req.path} ${req.route}`);
    const result = await this._userService.deleteUser(username);
    logger.info(`ManageUser.Delete returning`);
    return this.SendResponse(res, result);
  };

  public DeleteUserAccount = async (req: Request, res: Response) => {
    const password = req.body.password;
    const username = req.currentUsername;
    logger.info(`ManageUser.DeleteUserAccount beginning ${req.path}`);

    let result: ApiResponse;
    const filter = { username };
    result = await this._authService.validateUser(filter, password, req.__('passwordWrong'));

    if (result.statusCode === StatusCodes.OK) {
      result = await this._userService.deleteUser(username);
    }

    logger.info(`ManageUser.DeleteUserAccount returning`);
    return this.SendResponse(res, result);
  };
}
