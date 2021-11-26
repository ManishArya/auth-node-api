import bcrypt from 'bcrypt';
import config from 'config';
import { STATUS_CODE_BAD_REQUEST, STATUS_CODE_NOT_FOUND, STATUS_CODE_SUCCESS } from '../constants/status-code.const';
import UserDal from '../data-access/user.dal';
import ApiDataResponse from '../models/api-data-response';
import ApiResponse from '../models/api-response';
import UserInfo from '../models/user-info';
import JwtHelper from '../utils/jwt-helper';
import { Mail } from '../utils/mail';

export default class AuthService {
  public static currentUser: UserInfo;

  public static async validateUser(username: string, email: string, password: string) {
    const user = await UserDal.getUser({ $or: [{ username }, { email }] });
    if (user) {
      const isUserLocked = this.isUserLocked(user);

      if (isUserLocked) {
        return new ApiResponse(STATUS_CODE_BAD_REQUEST, 'User is locked. Please try after some time later');
      }

      const isValid = await this.isValidPassword(password, user.password);
      await this.updateUserLockedInformation(user, isValid);

      if (isValid) {
        const token = JwtHelper.generateToken(user.username, user.isAdmin);
        return new ApiDataResponse({ token });
      }
    }
    return new ApiResponse(STATUS_CODE_BAD_REQUEST, 'Credential is wrong !!!');
  }

  public static async sendResetPasswordLink(username: string, email: string) {
    const user = await UserDal.getUser({ $or: [{ username }, { email }] });
    if (user) {
      const mail = new Mail({
        subject: 'Reset Password Link',
        to: user.email,
        text: ''
      });
      await mail.send();
      return new ApiResponse(STATUS_CODE_SUCCESS, 'Please check email for further instruction !!!');
    }
    return new ApiResponse(STATUS_CODE_NOT_FOUND, 'User does not exists !!!');
  }

  public static async changePassword(password: string, confirmPassword: string, oldPassword: string) {
    if (password?.localeCompare(confirmPassword) !== 0) {
      return new ApiResponse(STATUS_CODE_BAD_REQUEST, 'password and confirm password does not match !!!');
    }
    const { username } = this.currentUser;
    const user = await UserDal.getUser({ username });
    if (!user) {
      return new ApiResponse(STATUS_CODE_NOT_FOUND, 'User not found');
    }

    const isValidOldPassword = await this.isValidPassword(oldPassword, user.password);

    if (isValidOldPassword) {
      user.password = password;
      await user.save();
      const mail = new Mail({
        subject: `Your, ${user.name}, Password has changed successfully`,
        to: user.email,
        text: ''
      });
      await mail.send();
      return new ApiResponse(STATUS_CODE_SUCCESS, 'Password Changed Successfully');
    }
    return new ApiResponse(STATUS_CODE_BAD_REQUEST, 'Old password is wrong');
  }

  private static async isValidPassword(password: string, dbPassword: string): Promise<boolean> {
    if (password) {
      return await bcrypt.compare(password, dbPassword);
    }
    return Promise.resolve(false);
  }

  private static isUserLocked(user: any): boolean {
    const failureAttempt = user.failureAttempt;
    const loginAttemptBeforeLocked = config.get('loginAttemptBeforeLockedOut') as number;
    const lockedAt = user.lockedAt;
    const lockedTimeout = config.get('lockedTimeout');
    if (failureAttempt < loginAttemptBeforeLocked) {
      return false;
    }
    return true;
  }

  public static async updateUserLockedInformation(user: any, isPasswordValid: boolean) {
    let count = user.failureAttempt;
    user.failureAttempt = isPasswordValid ? 0 : count + 1;
    user.lockedAt = isPasswordValid ? null : new Date();
    await user.save({ validateBeforeSave: false });
  }
}
