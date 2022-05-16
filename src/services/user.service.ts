import { STATUS_CODE_NOCONTENT, STATUS_CODE_NOT_FOUND } from '../constants/status-code.const';
import UserDal from '../data-access/user.dal';
import ApiResponse from '../models/api-response';
import JwtHelper from '../utils/jwt-helper';
import MailService from './mail.service';

export default class UserService {
  public currentUsername: string = '';
  private readonly _userDAL: UserDal;
  private readonly _mailService: MailService;

  constructor(private userDAL: UserDal, private mailService: MailService) {
    this._userDAL = userDAL;
    this._mailService = mailService;
  }

  public async saveUser(userData: any) {
    const user = await this._userDAL.SaveRecord(userData);
    const token = JwtHelper.generateToken(user.username, user.isAdmin);
    this._mailService.subject = `Your, ${user.name}, account has created successfully `;
    this._mailService.to = user.email;
    await this._mailService.send();
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
    const user = await this._userDAL.GetSingleRecord({ username });
    return new ApiResponse(user?.toObject());
  }

  public async getUsers() {
    let users = await this._userDAL.GetAllRecords();
    users = users.map((u: any) => u.toObject());
    return new ApiResponse(users);
  }

  public async deleteUser(username: string) {
    await this._userDAL.DeleteRecord({ username });
    return new ApiResponse('User Deleted Successfully', STATUS_CODE_NOCONTENT);
  }

  private async updateUser(data: any) {
    const username = this.currentUsername;
    data.lastUpdatedBy = username?.toLowerCase();

    const user = await this._userDAL.UpdateRecord({ username }, data);

    if (user) {
      return new ApiResponse(user.toObject());
    }
    return new ApiResponse('No User found', STATUS_CODE_NOT_FOUND);
  }
}
