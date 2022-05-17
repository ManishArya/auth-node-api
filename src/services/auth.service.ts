import bcrypt from 'bcrypt';
import { __ } from 'i18n';
import { STATUS_CODE_BAD_REQUEST, STATUS_CODE_NOT_FOUND, STATUS_CODE_SUCCESS } from '../constants/status-code.const';
import PasswordHistoryDAL from '../data-access/password-history.dal';
import UserDal from '../data-access/user.dal';
import { LoginResponseCode } from '../enums/login-response-code.enum';
import ApiResponse from '../models/api-response';
import AuthResponse from '../models/auth-response';
import { InvalidOperationException } from '../models/Invalid-operation-exception';
import IPasswordHistorySchema from '../models/IPasswordHistorySchema';
import IUser from '../models/IUser';
import UserInfo from '../models/user-info';
import JwtHelper from '../utils/jwt-helper';
import MailService from './mail.service';

export default class AuthService {
  public currentUser: UserInfo = {} as UserInfo;
  private readonly _userDAL: UserDal;
  private readonly _mailService: MailService;
  private readonly _passwordHistoryDAL: PasswordHistoryDAL;

  constructor(
    private userDAL: UserDal,
    private passwordHistoryDAL: PasswordHistoryDAL,
    private mailService: MailService
  ) {
    this._userDAL = userDAL;
    this._passwordHistoryDAL = passwordHistoryDAL;
    this._mailService = mailService;
  }

  public async validateUser(
    filter: any,
    password: string,
    errorMessage = 'Credential is wrong !!!'
  ): Promise<AuthResponse> {
    const user = await this._userDAL.GetSingleRecord(filter);

    if (!user) {
      errorMessage = __('userNotFound');
      return new AuthResponse(errorMessage, STATUS_CODE_NOT_FOUND, LoginResponseCode.NoUser);
    }

    if (user.isUserLocked) {
      return new AuthResponse(__('userLocked'), STATUS_CODE_BAD_REQUEST, LoginResponseCode.locked);
    }

    const isPasswordValid = await user.isPasswordValid(password);

    await user.updateUserLockedInformation(isPasswordValid);

    if (isPasswordValid) {
      return new AuthResponse(user, STATUS_CODE_SUCCESS, LoginResponseCode.successful);
    }

    return new AuthResponse(errorMessage, STATUS_CODE_BAD_REQUEST, LoginResponseCode.unsuccessful);
  }

  public async generateToken(user: IUser) {
    const token = JwtHelper.generateToken(user.username, user.isAdmin);
    return new ApiResponse({ token });
  }

  public async sendPasswordResetLink(usernameOrEmail: string) {
    const user = await this._userDAL.GetLeanSingleRecord({
      $or: [{ username: usernameOrEmail }, { email: usernameOrEmail }]
    });
    if (user) {
      await this.sendEmail('Reset Password Link', user.email);
      return new ApiResponse(__('forgotPasswordInstruction'), STATUS_CODE_SUCCESS);
    }
    return new ApiResponse(__('userExistFailure'), STATUS_CODE_NOT_FOUND);
  }

  public async changePassword(user: IUser, password: string) {
    const isValid = await this.validateNewPassword(user, password);
    if (isValid) {
      await this.updatePassword(user, password);
      await this.sendEmail(`Your, ${user.name}, Password has changed successfully`, user.email);
      return new ApiResponse('Password Changed Successfully', STATUS_CODE_SUCCESS);
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

  private async updatePassword(user: IUser, password: string) {
    await this._passwordHistoryDAL.Save({ password: user.password, username: user.username } as IPasswordHistorySchema);
    user.password = password;
    await (user as any).save();
  }

  private async validateNewPassword(user: IUser, password: string) {
    const hasMatch = await user.isOldPasswordAndCurrentPasswordMatch(password);

    if (!hasMatch) {
      const isExists = await this.checkPasswordHistory(user.username, password);

      return !isExists;
    }

    throw new InvalidOperationException('Current password can not be same as old password', 'currentOldPassword');
  }

  private async checkPasswordHistory(username: string, password: string): Promise<boolean> {
    const passwordHistory: any[] = await this._passwordHistoryDAL.GetNRecords(5, { username });
    const passwords = passwordHistory.map((p) => p.password);
    for (let i = 0; i < passwords.length; i++) {
      const isPasswordValid = await this.isPasswordValid(password, passwords[i]);
      if (isPasswordValid) {
        return Promise.resolve(true);
      }
    }
    return Promise.resolve(false);
  }

  private async isPasswordValid(password: string, hashPassword: string): Promise<boolean> {
    if (password) {
      return await bcrypt.compare(password, hashPassword);
    }
    return Promise.resolve(false);
  }
}
