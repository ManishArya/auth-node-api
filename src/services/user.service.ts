import { StatusCodes } from 'http-status-codes';
import QueryDAL from '../data-access/query.dal';
import ApiResponse from '../models/api-response';
import IUser from '../models/IUser';
import UserProfile from '../models/user-profile';
import JwtHelper from '../utils/jwt-helper';
import MailService from './mail.service';

export default class UserService {
  private readonly currentUsername: string;
  private readonly _userDAL: QueryDAL<IUser>;
  private readonly _mailService: MailService;

  constructor(userDAL: QueryDAL<IUser>, mailService: MailService, username: string = '') {
    this._userDAL = userDAL;
    this._mailService = mailService;
    this.currentUsername = username;
  }

  public async SaveUser(userData: any) {
    userData.roles = [];
    userData.roles.push({ name: 'user', _id: '62a0a21fb12ff26ed28e6874' });
    const user = await this._userDAL.SaveRecord(userData);
    const token = JwtHelper.generateToken(user.username, ['user']);
    this._mailService.subject = `Your, ${user.name}, account has created successfully `;
    this._mailService.to = user.email;
    await this._mailService.send();
    return new ApiResponse({ token });
  }

  public async EditProfile(userData: any) {
    return await this.UpdateUser(userData);
  }

  public async UpdateAvatar(fileBytes?: Buffer) {
    return await this.UpdateUser({ avatar: fileBytes });
  }

  public async UpdateEmailAddress(email: string) {
    return await this.UpdateUser({ email });
  }

  public async GetProfile() {
    const username = this.currentUsername;
    const user = await this._userDAL.GetFilterRecordWithChild({ username }, 'roles');
    return new ApiResponse(user?.toObject());
  }

  public async GetUsers() {
    let users = await this._userDAL.GetRecords();
    users = users.map((u: any) => u.toObject());
    return new ApiResponse(users);
  }

  public async DeleteUser(username: string) {
    await this._userDAL.DeleteRecord({ username });
    return new ApiResponse('User Deleted Successfully', StatusCodes.NO_CONTENT);
  }

  private async UpdateUser(data: any) {
    const username = this.currentUsername;
    data.lastUpdatedBy = username?.toLowerCase();

    const user = await this._userDAL.FindAndUpdateRecord({ username }, data);

    if (user) {
      return new ApiResponse(new UserProfile(user));
    }
    return new ApiResponse('No User found', StatusCodes.NOT_FOUND);
  }
}
