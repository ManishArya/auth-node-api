import bcrypt from 'bcrypt';
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
    const isValid = await this.isValidPassword(password, user);

    if (isValid) {
      const token = JwtHelper.generateToken(user.username);
      return new ApiDataResponse({ token });
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

    const isValidOldPassword = await this.isValidPassword(oldPassword, user);

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

  private static async isValidPassword(password: string, user: any): Promise<boolean> {
    if (user && password) {
      return await bcrypt.compare(password, user.password);
    }
    return Promise.resolve(false);
  }
}
