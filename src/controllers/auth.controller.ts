import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import ApiResponse from '../models/api-response';
import AuthResponse from '../models/auth-response';
import Login from '../models/interfaces/login';
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

  public token = async (req: Request, res: Response) => {
    const { email, password } = req.body as Login;
    logger.info(`Auth.token beginning ${req.path}`);
    let result: ApiResponse;
    const filter = { email };
    result = await this._authService.validateUserAsync(filter, password);
    if (result.statusCode === StatusCodes.OK) {
      result = await this._authService.generateTokenAsync(result.content._id);
    }

    logger.info(`Auth.token returning`);
    return this.sendResponse(res, result, (result as AuthResponse).code);
  };

  public forgotPassword = async (req: Request, res: Response) => {
    const { email } = req.body;
    logger.info(`Auth.forgotPassword beginning ${req.path}`);
    const result = await this._authService.sendPasswordResetLinkAsync(email);
    logger.info(`Auth.forgotPassword returning`);
    return this.sendResponse(res, result);
  };

  public changePassword = async (req: Request, res: Response) => {
    logger.info(`Auth.changePassword beginning ${req.path}`);

    const { password, confirmPassword, oldPassword } = req.body;

    if (password?.localeCompare(confirmPassword) !== 0) {
      throw new InvalidOperationException('password and confirm password does not match !!!', 'passwordMismatch');
    }

    let result: ApiResponse;
    const filter = { _id: req.currentUserId };
    result = await this._authService.validateUserAsync(filter, oldPassword, req.translate('oldPasswordWrong'));

    if (result.statusCode === StatusCodes.OK) {
      result = await this._authService.changePasswordAsync(result.content, password);
    }

    logger.info(`Auth.changePassword returning`);
    return this.sendResponse(res, result);
  };
}
