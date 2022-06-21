import bcrypt from 'bcrypt';
import { StatusCodes } from 'http-status-codes';
import { __ } from 'i18n';
import QueryDAL from '../data-access/query.dal';
import ApiResponse from '../models/api-response';
import AuthResponse from '../models/auth-response';
import IPasswordHistorySchema from '../models/interfaces/password-history-schema';
import IUserSchema from '../models/interfaces/user-schema';
import { InvalidOperationException } from '../models/Invalid-operation-exception';
import JwtHelper from '../utils/jwt-helper';
import MailService from './mail.service';
import UserService from './user.service';

export default class AuthService {
  private readonly _userService: UserService;
  private readonly _userDAL: QueryDAL<IUserSchema>;
  private readonly _mailService: MailService;
  private readonly _passwordHistoryDAL: QueryDAL<IPasswordHistorySchema>;

  constructor(
    userDAL: QueryDAL<IUserSchema>,
    passwordHistoryDAL: QueryDAL<IPasswordHistorySchema>,
    mailService: MailService,
    userService: UserService
  ) {
    this._userDAL = userDAL;
    this._passwordHistoryDAL = passwordHistoryDAL;
    this._mailService = mailService;
    this._userService = userService;
  }

  public async validateUser(
    filter: any,
    password: string,
    errorMessage = 'Credential is wrong !!!'
  ): Promise<AuthResponse> {
    return await this._userService.validateUser(filter, password, errorMessage);
  }

  public async generateToken(username: string) {
    const userInfo = await this._userService.getUserPermissions(username);
    const token = JwtHelper.generateToken(userInfo);
    return new ApiResponse({ token });
  }

  public async sendPasswordResetLink(usernameOrEmail: string) {
    const user = await this._userDAL.getFilterLeanRecord({
      $or: [{ username: usernameOrEmail }, { email: usernameOrEmail }]
    });

    if (user) {
      await this.sendEmail('Reset Password Link', user.email);
      return new ApiResponse(__('forgotPasswordInstruction'), StatusCodes.OK);
    }

    return new ApiResponse(__('userExistFailure'), StatusCodes.BAD_REQUEST);
  }

  public async changePassword(user: IUserSchema, password: string) {
    const isValid = await this.validateNewPassword(user, password);

    if (isValid) {
      await this.updatePassword(user, password);
      await this.sendEmail(`Your, ${user.name}, Password has changed successfully`, user.email);
      return new ApiResponse('Password Changed Successfully', StatusCodes.OK);
    }

    throw new InvalidOperationException(
      'This password may not be  one of recent changed password',
      'recentPasswordChange'
    );
  }

  private async sendEmail(subject: string, email: string): Promise<void> {
    this._mailService.subject = subject;
    this._mailService.to = email;
    await this._mailService.send();
  }

  private async updatePassword(user: IUserSchema, password: string) {
    await this._passwordHistoryDAL.saveRecord({
      password: user.password,
      username: user.username
    } as IPasswordHistorySchema);

    user.password = password;

    await (user as any).save();
  }

  private async validateNewPassword(user: IUserSchema, password: string) {
    const hasMatch = await user.isOldPasswordAndCurrentPasswordMatch(password);

    if (!hasMatch) {
      const isExists = await this.checkPasswordHistory(user.username, password);
      return !isExists;
    }

    throw new InvalidOperationException('Current password can not be same as old password', 'currentOldPassword');
  }

  private async checkPasswordHistory(username: string, password: string): Promise<boolean> {
    const passwordHistory: any[] = await this._passwordHistoryDAL.getNFilterLeanRecords(5, { username });
    const passwords = passwordHistory.map((p) => p.password);

    for (let i = 0; i < passwords.length; i++) {
      const isPasswordValid = await this.isPasswordValid(password, passwords[i]);

      if (isPasswordValid) {
        return Promise.resolve(true);
      }
    }

    return Promise.resolve(false);
  }

  private isPasswordValid(password: string, hashPassword: string): Promise<boolean> {
    if (password) {
      return bcrypt.compare(password, hashPassword);
    }
    return Promise.resolve(false);
  }
}
