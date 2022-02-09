import bcrypt from 'bcrypt';
import { STATUS_CODE_BAD_REQUEST, STATUS_CODE_NOT_FOUND, STATUS_CODE_SUCCESS } from '../constants/status-code.const';
import PasswordHistoryDAL from '../data-access/password-history.dal';
import UserDal from '../data-access/user.dal';
import { LoginResponseCode } from '../enums/login-response-code.enum';
import ApiResponse from '../models/api-response';
import AuthResponse from '../models/auth-response';
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
      return new AuthResponse('User not found', STATUS_CODE_NOT_FOUND, LoginResponseCode.NoUser);
    }

    if (user.isUserLocked) {
      return new AuthResponse(
        'User is locked. Please try after some time later',
        STATUS_CODE_BAD_REQUEST,
        LoginResponseCode.locked
      );
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

  public static async sendResetPasswordLink(usernameOrEmail: string) {
    const user = await UserDal.getUser({ $or: [{ username: usernameOrEmail }, { email: usernameOrEmail }] });
    if (user) {
      const mail = new Mail({
        subject: 'Reset Password Link',
        to: user.email,
        text: ''
      });
      await mail.send();
      return new ApiResponse('Please check email for further instruction !!!', STATUS_CODE_SUCCESS);
    }
    return new ApiResponse('User does not exists !!!', STATUS_CODE_NOT_FOUND);
  }

  public static async changePassword(user: IUser, password: string) {
    const isSame = await user.isOldPasswordSameAsCurrentPassword(password);
    if (!isSame) {
      const isExists = await this.checkPasswordIsInHistory(user.username, password);
      if (!isExists) {
        await PasswordHistoryDAL.savePassword(user.password, user.username);
        user.password = password;
        await (user as any).save();
        const mail = new Mail({
          subject: `Your, ${user.name}, Password has changed successfully`,
          to: user.email,
          text: ''
        });
        await mail.send();
        return new ApiResponse('Password Changed Successfully', STATUS_CODE_SUCCESS);
      }
      return new ApiResponse('This password is one of recent changed password', STATUS_CODE_BAD_REQUEST);
    }
    return new ApiResponse('Current password can not be same as old password', STATUS_CODE_BAD_REQUEST);
  }

  private static async checkPasswordIsInHistory(username: string, password: string): Promise<boolean> {
    const passwordHistory: any[] = await PasswordHistoryDAL.getPasswords(username);
    const passwords = passwordHistory.map((p) => p.password);
    for (let i = 0; i < passwords.length; i++) {
      const isValidPassword = await this.isValidPassword(password, passwords[i]);
      if (isValidPassword) {
        return Promise.resolve(true);
      }
    }
    return Promise.resolve(false);
  }

  private static async isValidPassword(password: string, hashPassword: string): Promise<boolean> {
    if (password) {
      return await bcrypt.compare(password, hashPassword);
    }
    return Promise.resolve(false);
  }
}
