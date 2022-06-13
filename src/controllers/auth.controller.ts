import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import ApiResponse from '../models/api-response';
import AuthResponse from '../models/auth-response';
import ILogin from '../models/ILogin';
import { InvalidOperationException } from '../models/Invalid-operation-exception';
import AuthService from '../services/auth.service';
import logger from '../utils/logger';
import BaseController from './base.controller';
export default class AuthController extends BaseController {
  private readonly _authService: AuthService;

  constructor(authService: AuthService) {
    super();
    this._authService = authService;
  }

  public Token = async (req: Request, res: Response) => {
    const { usernameOrEmail, password } = req.body as ILogin;
    logger.info(`Auth.Token beginning ${req.path}`);
    let result: ApiResponse;
    const filter = { $or: [{ username: usernameOrEmail }, { email: usernameOrEmail }] };
    result = await this._authService.ValidateUser(filter, password, '', 'roles');
    if (result.statusCode === StatusCodes.OK) {
      const user = result.content;
      result = await this._authService.GenerateToken(user.toObject());
    }

    logger.info(`Auth.Token returning`);
    return this.SendResponse(res, result, (result as AuthResponse).code);
  };

  public ForgotPassword = async (req: Request, res: Response) => {
    const { usernameOrEmail } = req.body;
    logger.info(`Auth.SendPasswordResetLink beginning ${req.path}`);
    const result = await this._authService.SendPasswordResetLink(usernameOrEmail);
    logger.info(`Auth.SendPasswordResetLink returning`);
    return this.SendResponse(res, result);
  };

  public ChangePassword = async (req: Request, res: Response) => {
    logger.info(`Auth.ChangePassword beginning ${req.path}`);

    const { password, confirmPassword, oldPassword } = req.body;

    if (password?.localeCompare(confirmPassword) !== 0) {
      throw new InvalidOperationException('password and confirm password does not match !!!', 'passwordMismatch');
    }

    let result: ApiResponse;
    const filter = { username: req.currentUsername };
    result = await this._authService.ValidateUser(filter, oldPassword, req.__('oldPasswordWrong'));

    if (result.statusCode === StatusCodes.OK) {
      result = await this._authService.ChangePassword(result.content, password);
    }

    logger.info(`Auth.ChangePassword returning`);
    return this.SendResponse(res, result);
  };
}
