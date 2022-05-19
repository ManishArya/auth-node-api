import { StatusCodes } from 'http-status-codes';
import QueryDAL from '../data-access/query.dal';
import ApiResponse from '../models/api-response';
import IUser from '../models/IUser';
import JwtHelper from '../utils/jwt-helper';
import MailService from './mail.service';

export default class UserService {
  private readonly currentUsername: string;
  private readonly _userDAL: QueryDAL<IUser>;
  private readonly _mailService: MailService;

  constructor(private userDAL: QueryDAL<IUser>, private mailService: MailService, private username: string) {
    this._userDAL = userDAL;
    this._mailService = mailService;
    this.currentUsername = username;
  }

  public async saveUser(userData: any) {
    const user = await this._userDAL.Save(userData);
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
    await this._userDAL.Delete({ username });
    return new ApiResponse('User Deleted Successfully', StatusCodes.NO_CONTENT);
  }

  private async updateUser(data: any) {
    const username = this.currentUsername;
    data.lastUpdatedBy = username?.toLowerCase();

    const user = await this._userDAL.FindAndUpdate({ username }, data);

    if (user) {
      return new ApiResponse(user.toObject());
    }
    return new ApiResponse('No User found', StatusCodes.NOT_FOUND);
  }
}
