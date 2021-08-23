import ApiDataResponse from '../models/api-data-response';
import ApiResponse from '../models/api-response';
import sendEmail from '../utils/sendEmail';
import UserDal from '../data-access/user.dal';
import bcrypt from 'bcrypt';
import { STATUS_CODE_BAD_REQUEST, STATUS_CODE_SUCCESS } from '../constants/status-code.const';
import MailOptions from '../models/mail-options';

export default class ManageUserService {
  static async saveUser(userData: any) {
    const hashPassword = await convertPasswordIntoHash(userData.password);
    if (hashPassword) {
      userData.password = hashPassword;
      userData.createdBy = userData.username?.toLowerCase();
      const user = await UserDal.saveUser(userData);
      const mailOptions = new MailOptions({
        subject: `Your, ${user.name}, account has created successfully `,
        email: user.email
      });
      await sendEmail(mailOptions);
      return new ApiDataResponse(user.toObject());
    }
    return new ApiResponse(STATUS_CODE_BAD_REQUEST, 'password error');
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
    return await bcrypt.hash(password, 10);
  }
  return null;
}
