import bcrypt from 'bcrypt';
import { __ } from 'i18n';
import { STATUS_CODE_BAD_REQUEST, STATUS_CODE_NOT_FOUND, STATUS_CODE_SUCCESS } from '../constants/status-code.const';
import PasswordHistoryDAL from '../data-access/password-history.dal';
import UserDal from '../data-access/user.dal';
import { LoginResponseCode } from '../enums/login-response-code.enum';
import ApiResponse from '../models/api-response';
import AuthResponse from '../models/auth-response';
import { InvalidOperationException } from '../models/Invalid-operation-exception';
import IUser from '../models/IUser';
import UserInfo from '../models/user-info';
import JwtHelper from '../utils/jwt-helper';
import { Mail } from '../utils/mail';

export default class AuthService {
  public static currentUser: UserInfo;

  public static async validateUser(
    filter: any,
    password: string,
    errorMessage = 'Credential is wrong !!!'
  ): Promise<AuthResponse> {
    const user = await UserDal.getUser(filter);

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

  public static async generateToken(user: IUser) {
    const token = JwtHelper.generateToken(user.username, user.isAdmin);
    return new ApiResponse({ token });
  }

  public static async sendPasswordResetLink(usernameOrEmail: string) {
    const user = await UserDal.getLeanUser({ $or: [{ username: usernameOrEmail }, { email: usernameOrEmail }] });
    if (user) {
      const mail = new Mail({
        subject: 'Reset Password Link',
        to: user.email,
        text: ''
      });
      await mail.send();
      return new ApiResponse(__('forgotPasswordInstruction'), STATUS_CODE_SUCCESS);
    }
    return new ApiResponse(__('userExistFailure'), STATUS_CODE_NOT_FOUND);
  }

  public static async changePassword(user: IUser, password: string) {
    const isValid = await this.validateNewPassword(user, password);
    if (isValid) {
      await this.updatePassword(user, password);
      const mail = new Mail({
        subject: `Your, ${user.name}, Password has changed successfully`,
        to: user.email,
        text: ''
      });
      await mail.send();
      return new ApiResponse('Password Changed Successfully', STATUS_CODE_SUCCESS);
    }
    throw new InvalidOperationException(
      'This password may not be  one of recent changed password',
      'recentPasswordChange'
    );
  }

  private static async updatePassword(user: IUser, password: string) {
    await PasswordHistoryDAL.savePassword(user.password, user.username);
    user.password = password;
    await (user as any).save();
  }

  private static async validateNewPassword(user: IUser, password: string) {
    const hasMatch = await user.isOldPasswordAndCurrentPasswordMatch(password);

    if (!hasMatch) {
      const isExists = await this.checkPasswordHistory(user.username, password);

      return !isExists;
    }

    throw new InvalidOperationException('Current password can not be same as old password', 'currentOldPassword');
  }

  private static async checkPasswordHistory(username: string, password: string): Promise<boolean> {
    const passwordHistory: any[] = await PasswordHistoryDAL.getPasswords(username);
    const passwords = passwordHistory.map((p) => p.password);
    for (let i = 0; i < passwords.length; i++) {
      const isPasswordValid = await this.isPasswordValid(password, passwords[i]);
      if (isPasswordValid) {
        return Promise.resolve(true);
      }
    }
    return Promise.resolve(false);
  }

  private static async isPasswordValid(password: string, hashPassword: string): Promise<boolean> {
    if (password) {
      return await bcrypt.compare(password, hashPassword);
    }
    return Promise.resolve(false);
  }
}
