import bcrypt from 'bcrypt';
import { STATUS_CODE_SUCCESS } from '../constants/status-code.const';
import UserDal from '../data-access/user.dal';
import ApiDataResponse from '../models/api-data-response';
import ApiResponse from '../models/api-response';

export default class ManageUserService {
  public static async getUsers() {
    let users = await UserDal.getUsers();
    users = users.map((u: any) => u.toObject());
    return new ApiDataResponse(users);
  }

  public static async deleteUser(username: string) {
    await UserDal.deleteUser(username);
    return new ApiResponse(STATUS_CODE_SUCCESS, 'User Deleted Successfully');
  }

  private static async isValidPassword(password: string, user: any): Promise<boolean> {
    if (user && password) {
      return await bcrypt.compare(password, user.password);
    }
    return Promise.resolve(false);
  }
}
