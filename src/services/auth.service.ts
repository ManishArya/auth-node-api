import bcrypt from 'bcrypt';
import { STATUS_CODE_BAD_REQUEST, STATUS_CODE_NOT_FOUND, STATUS_CODE_SUCCESS } from '../constants/status-code.const';
import UserDal from '../data-access/user.dal';
import { LoginResponseCode } from '../enums/login-response-code.enum';
import ApiResponse from '../models/api-response';
import AuthResponse from '../models/auth-response';
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

    const isPasswordValid = await this.isValidPassword(password, user.password);

    await this.updateUserLockedInformation(user, isPasswordValid);

    if (isPasswordValid) {
      return new AuthResponse(user, STATUS_CODE_SUCCESS, LoginResponseCode.successful);
    }

    return new AuthResponse(errorMessage, STATUS_CODE_BAD_REQUEST, LoginResponseCode.unsuccessful);
  }

  public static async generateToken(user: any) {
    const token = JwtHelper.generateToken(user.username, user.isAdmin);
    return new ApiResponse({ token });
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
      return new ApiResponse('Please check email for further instruction !!!', STATUS_CODE_SUCCESS);
    }
    return new ApiResponse('User does not exists !!!', STATUS_CODE_NOT_FOUND);
  }

  public static async changePassword(user: any, password: string) {
    user.password = password;
    await user.save();
    const mail = new Mail({
      subject: `Your, ${user.name}, Password has changed successfully`,
      to: user.email,
      text: ''
    });
    await mail.send();
    return new ApiResponse('Password Changed Successfully', STATUS_CODE_SUCCESS);
  }

  private static async isValidPassword(password: string, dbPassword: string): Promise<boolean> {
    if (password) {
      return await bcrypt.compare(password, dbPassword);
    }
    return Promise.resolve(false);
  }

  private static async updateUserLockedInformation(user: any, isPasswordValid: boolean) {
    let count = user.failureAttempt;
    user.failureAttempt = isPasswordValid ? 0 : count + 1;
    user.lockedAt = isPasswordValid ? null : new Date();
    await user.save({ validateBeforeSave: false });
  }
}
