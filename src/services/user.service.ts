import ApiDataResponse from '../models/api-data-response';
import ApiResponse from '../models/api-response';
import { STATUS_CODE_NOT_FOUND } from '../constants/status-code.const';
import UserDal from '../data-access/user.dal';

export default class UserService {
  static currentUser: any;
  static async editProfile(userData: any) {
    const { _id, username } = this.currentUser;
    userData.lastUpdatedBy = username?.toLowerCase();
    const user = await UserDal.updateUser({ _id }, userData);
    if (user) {
      return new ApiDataResponse(user.toObject());
    }
    return new ApiResponse(STATUS_CODE_NOT_FOUND, 'No User found');
  }

  static async getProfile() {
    const username = this.currentUser.username;
    const user = await UserDal.getUserByUsername(username);
    return new ApiDataResponse(user.toObject());
  }
}
