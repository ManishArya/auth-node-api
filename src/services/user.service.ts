import { STATUS_CODE_NOT_FOUND } from '../constants/status-code.const';
import UserDal from '../data-access/user.dal';
import ApiDataResponse from '../models/api-data-response';
import ApiResponse from '../models/api-response';

export default class UserService {
  static currentUser: any;
  static async editProfile(userData: any) {
    const { username } = this.currentUser;
    userData.lastUpdatedBy = username?.toLowerCase();
    const user = await UserDal.updateUser({ username }, userData);
    if (user) {
      return new ApiDataResponse(user.toObject());
    }
    return new ApiResponse(STATUS_CODE_NOT_FOUND, 'No User found');
  }

  static async updatePhoto(photo: Buffer) {
    const { username } = this.currentUser;
    const user = await UserDal.updateUser({ username }, { photo, lastUpdatedBy: username?.toLowerCase() });

    if (user) {
      return new ApiDataResponse(user.toObject());
    }
    return new ApiResponse(STATUS_CODE_NOT_FOUND, 'No User found');
  }

  static async removePhoto() {
    const { username } = this.currentUser;
    const user = await UserDal.updateUser({ username }, { photo: undefined, lastUpdatedBy: username?.toLowerCase() });

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
