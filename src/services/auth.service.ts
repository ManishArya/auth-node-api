import bcrypt from 'bcrypt';
import { StatusCodes } from 'http-status-codes';
import { __ as translate } from 'i18n';
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

  public async validateUserAsync(
    filter: any,
    password: string,
    errorMessage = 'Credential is wrong !!!'
  ): Promise<AuthResponse> {
    return await this._userService.validateUserAsync(filter, password, errorMessage);
  }

  public async generateTokenAsync(userId: string) {
    const userInfo = await this._userService.getUserPermissionsAsync(userId);
    const token = JwtHelper.generateToken(userInfo);
    return new ApiResponse({ token });
  }

  public async sendPasswordResetLinkAsync(email: string) {
    const user = await this._userDAL.getFilterLeanRecordAsync({ email });

    if (user) {
      await this.sendEmailAsync('Reset Password Link', user.email);
      return new ApiResponse(translate('forgotPasswordInstruction'), StatusCodes.OK);
    }

    return new ApiResponse(translate('userExistFailure'), StatusCodes.BAD_REQUEST);
  }

  public async changePasswordAsync(user: IUserSchema, password: string) {
    const isValid = await this.validateNewPasswordAsync(user, password);

    if (isValid) {
      await this.updatePasswordAsync(user, password);
      await this.sendEmailAsync(`Your, ${user.name}, Password has changed successfully`, user.email);
      return new ApiResponse('Password Changed Successfully', StatusCodes.OK);
    }

    throw new InvalidOperationException(
      'This password may not be  one of recent changed password',
      'recentPasswordChange'
    );
  }

  private async sendEmailAsync(subject: string, email: string): Promise<void> {
    this._mailService.subject = subject;
    this._mailService.to = email;
    await this._mailService.sendAsync();
  }

  private async updatePasswordAsync(user: IUserSchema, password: string) {
    await this._passwordHistoryDAL.saveRecordAsync({
      password: user.password,
      userId: user._id
    } as IPasswordHistorySchema);

    user.password = password;

    await (user as any).save();
  }

  private async validateNewPasswordAsync(user: IUserSchema, password: string) {
    const hasMatch = await user.isOldAndCurrentPasswordSameAsync(password);

    if (!hasMatch) {
      const isExists = await this.checkPasswordHistoryAsync(user._id, password);
      return !isExists;
    }

    throw new InvalidOperationException('Current password can not be same as old password', 'currentOldPassword');
  }

  private async checkPasswordHistoryAsync(userId: string, password: string): Promise<boolean> {
    const passwordHistory: any[] = await this._passwordHistoryDAL.getFilterNLeanRecordsAsync(5, { _id: userId });
    const passwords = passwordHistory.map((p) => p.password);

    for (let i = 0; i < passwords.length; i++) {
      const isPasswordValid = await this.isPasswordValidAsync(password, passwords[i]);

      if (isPasswordValid) {
        return Promise.resolve(true);
      }
    }

    return Promise.resolve(false);
  }

  private isPasswordValidAsync(password: string, hashPassword: string): Promise<boolean> {
    if (password) {
      return bcrypt.compare(password, hashPassword);
    }
    return Promise.resolve(false);
  }
}
