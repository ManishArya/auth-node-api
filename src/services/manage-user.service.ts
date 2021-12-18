import { STATUS_CODE_NOCONTENT } from '../constants/status-code.const';
import UserDal from '../data-access/user.dal';
import ApiResponse from '../models/api-response';

export default class ManageUserService {
  public static async getUsers() {
    let users = await UserDal.getUsers();
    users = users.map((u: any) => u.toObject());
    return new ApiResponse(users);
  }

  public static async deleteUser(username: string) {
    await UserDal.deleteUser(username);
    return new ApiResponse('User Deleted Successfully', STATUS_CODE_NOCONTENT);
  }
}
