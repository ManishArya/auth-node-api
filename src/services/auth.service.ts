import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { STATUS_CODE_BAD_REQUEST, STATUS_CODE_NOT_FOUND, STATUS_CODE_SUCCESS } from '../constants/status-code.const';
import UserDal from '../data-access/user.dal';
import ApiDataResponse from '../models/api-data-response';
import ApiResponse from '../models/api-response';
import MailOptions from '../models/mail-options';
import UserInfo from '../models/user-info';
import sendEmail from '../utils/sendEmail';
const SALT_ROUNDS = 10;

export default class AuthService {
  public static currentUser: UserInfo;
  static async validateUser(username: string, email: string, password: string) {
    const user = await UserDal.getUser({ $or: [{ username }, { email }] });
    const isValid = await this.isValidPassword(password, user);
    if (isValid) {
      const token = this.generateJwtToken(user);
      return new ApiDataResponse({ token });
    }
    return new ApiResponse(STATUS_CODE_BAD_REQUEST, 'Credential is wrong !!!');
  }

  private static async isValidPassword(password: string, user: any): Promise<boolean> {
    if (user && password) {
      return await bcrypt.compare(password, user.password);
    }
    return Promise.resolve(false);
  }

  private static generateJwtToken(user: any): string {
    const secretKey = process.env.jwt_secret_key as jwt.Secret;
    return jwt.sign(JSON.stringify(new UserInfo(user)), secretKey);
  }

  static async sendResetPasswordLink(username: string, email: string) {
    const user = await UserDal.getUser({ $or: [{ username }, { email }] });
    if (user) {
      const mailOptions = new MailOptions({
        subject: 'Reset Password Link',
        to: user.email,
        text: ''
      });
      await sendEmail(mailOptions);
      return new ApiResponse(STATUS_CODE_SUCCESS, 'Please check email for further instruction !!!');
    }
    return new ApiResponse(STATUS_CODE_NOT_FOUND, 'User does not exists !!!');
  }

  static async changePassword(password: string, confirmPassword: string) {
    if (password.localeCompare(confirmPassword) !== 0) {
      return new ApiResponse(STATUS_CODE_BAD_REQUEST, 'password and confirm password does not match !!!');
    }
    if (/^(?=.*\d)(?=.*[A-Z])(?=.*[a-z])(?=.*[!@#$%^&*-+]).{6,15}$/.test(password)) {
      const hash = await bcrypt.hash(password, SALT_ROUNDS);
      const user = await UserDal.updateUser({ username: '' }, { password: hash });
      const mailOptions = new MailOptions({
        subject: `Your, ${user.name}, Password has changed successfully`,
        to: user.email,
        text: ''
      });
      await sendEmail(mailOptions);
      return new ApiResponse(STATUS_CODE_SUCCESS, 'Password Changed Successfully');
    }
    return new ApiResponse(
      STATUS_CODE_BAD_REQUEST,
      'Password should have at least 1 digit 1 upper case 1 lower case and 1 special characters and length should between 6 to 15'
    );
  }
}
