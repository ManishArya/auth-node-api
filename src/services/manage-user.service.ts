import bcrypt from 'bcrypt';
import { STATUS_CODE_BAD_REQUEST, STATUS_CODE_SUCCESS } from '../constants/status-code.const';
import UserDal from '../data-access/user.dal';
import ApiDataResponse from '../models/api-data-response';
import ApiResponse from '../models/api-response';
import MailOptions from '../models/mail-options';
import JwtHelper from '../utils/jwt-helper';
import sendEmail from '../utils/sendEmail';
const SALT_ROUNDS = 10;
export default class ManageUserService {
  static async saveUser(userData: any) {
    const hashPassword = await convertPasswordIntoHash(userData.password);
    if (hashPassword) {
      userData.password = hashPassword;
      userData.createdBy = userData.username?.toLowerCase();
      const user = await UserDal.saveUser(userData);
      const token = JwtHelper.generateToken(user.username);
      const mailOptions = new MailOptions({
        subject: `Your, ${user.name}, account has created successfully `,
        email: user.email
      });
      try {
        await sendEmail(mailOptions);
      } catch {}
      return new ApiDataResponse({ token });
    }
    return new ApiResponse(STATUS_CODE_BAD_REQUEST, 'password does not meet policy criteria');
  }

  static async getUsers() {
    let users = await UserDal.getUsers();
    users = users.map((u: any) => u.toObject());
    return new ApiDataResponse(users);
  }

  static async deleteUser(username: string) {
    await UserDal.deleteUser(username);
    return new ApiResponse(STATUS_CODE_SUCCESS, 'User Deleted Successfully');
  }
}

async function convertPasswordIntoHash(password: string) {
  if (/^(?=.*\d)(?=.*[A-Z])(?=.*[a-z])(?=.*[!@#$%^&*-+]).{6,15}$/.test(password)) {
    return await bcrypt.hash(password, SALT_ROUNDS);
  }
  return null;
}
