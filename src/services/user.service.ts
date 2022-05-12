import { STATUS_CODE_NOCONTENT, STATUS_CODE_NOT_FOUND } from '../constants/status-code.const';
import UserDal from '../data-access/user.dal';
import ApiResponse from '../models/api-response';
import JwtHelper from '../utils/jwt-helper';
import { Mail } from '../utils/mail';

export default class UserService {
  public currentUsername: string = '';
  private readonly _userDAL: UserDal;

  constructor(private userDAL: UserDal) {
    this._userDAL = userDAL;
  }

  public async saveUser(userData: any) {
    const user = await this._userDAL.saveUser(userData);
    const token = JwtHelper.generateToken(user.username, user.isAdmin);
    const mail = new Mail({
      subject: `Your, ${user.name}, account has created successfully `,
      to: user.email
    });
    await mail.send();
    return new ApiResponse({ token });
  }

  public async editProfile(userData: any) {
    return await this.updateUser(userData);
  }

  public async updateAvatar(fileBytes?: Buffer) {
    return await this.updateUser({ avatar: fileBytes });
  }

  public async updateEmailAddress(email: string) {
    return await this.updateUser({ email });
  }

  public async getProfile() {
    const username = this.currentUsername;
    const user = await this._userDAL.getUserByUsername(username);
    return new ApiResponse(user?.toObject());
  }

  public async getUsers() {
    let users = await this._userDAL.getUsers();
    users = users.map((u: any) => u.toObject());
    return new ApiResponse(users);
  }

  public async deleteUser(username: string) {
    await this._userDAL.deleteUser(username);
    return new ApiResponse('User Deleted Successfully', STATUS_CODE_NOCONTENT);
  }

  private async updateUser(data: any) {
    const username = this.currentUsername;
    data.lastUpdatedBy = username?.toLowerCase();

    const user = await this._userDAL.updateUser({ username }, data);

    if (user) {
      return new ApiResponse(user.toObject());
    }
    return new ApiResponse('No User found', STATUS_CODE_NOT_FOUND);
  }
}
