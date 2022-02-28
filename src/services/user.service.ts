import { STATUS_CODE_NOT_FOUND } from '../constants/status-code.const';
import UserDal from '../data-access/user.dal';
import ApiResponse from '../models/api-response';
import JwtHelper from '../utils/jwt-helper';
import { Mail } from '../utils/mail';

export default class UserService {
  public static currentUser: any;

  public static async saveUser(userData: any) {
    const user = await UserDal.saveUser(userData);
    const token = JwtHelper.generateToken(user.username, user.isAdmin);
    const mail = new Mail({
      subject: `Your, ${user.name}, account has created successfully `,
      to: user.email
    });
    await mail.send();
    return new ApiResponse({ token });
  }

  public static async editProfile(userData: any) {
    return await this.updateUser(userData);
  }

  public static async updateAvatar(avatar?: Buffer) {
    return await this.updateUser({ avatar });
  }

  public static async updateEmailAddress(email: string) {
    return await this.updateUser({ email });
  }

  public static async getProfile() {
    const username = this.currentUser.username;
    const user = await UserDal.getUserByUsername(username);
    return new ApiResponse(user?.toObject());
  }

  private static async updateUser(data: any) {
    const { username } = this.currentUser;
    data.lastUpdatedBy = username?.toLowerCase();

    const user = await UserDal.updateUser({ username }, data);

    if (user) {
      return new ApiResponse(user.toObject());
    }
    return new ApiResponse('No User found', STATUS_CODE_NOT_FOUND);
  }
}
