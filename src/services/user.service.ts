import { STATUS_CODE_NOT_FOUND } from '../constants/status-code.const';
import UserDal from '../data-access/user.dal';
import ApiDataResponse from '../models/api-data-response';
import ApiResponse from '../models/api-response';
import JwtHelper from '../utils/jwt-helper';
import { Mail } from '../utils/mail';

export default class UserService {
  public static currentUser: any;

  public static async saveUser(userData: any) {
    const user = await UserDal.saveUser(userData);
    const token = JwtHelper.generateToken(user.username);
    const mail = new Mail({
      subject: `Your, ${user.name}, account has created successfully `,
      to: user.email
    });
    await mail.send();
    return new ApiDataResponse({ token });
  }

  public static async editProfile(userData: any) {
    return await this.updateUser(userData);
  }

  public static async updatePhoto(photo?: Buffer) {
    return await this.updateUser({ photo });
  }

  public static async getProfile() {
    const username = this.currentUser.username;
    const user = await UserDal.getUserByUsername(username);
    return new ApiDataResponse(user.toObject());
  }

  private static async updateUser(data: any) {
    const { username } = this.currentUser;
    data.lastUpdatedBy = username?.toLowerCase();

    const user = await UserDal.updateUser({ username }, data);

    if (user) {
      return new ApiDataResponse(user.toObject());
    }
    return new ApiResponse(STATUS_CODE_NOT_FOUND, 'No User found');
  }
}
