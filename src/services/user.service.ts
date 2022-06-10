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

  constructor(userDAL: QueryDAL<IUser>, mailService: MailService, username: string = '') {
    this._userDAL = userDAL;
    this._mailService = mailService;
    this.currentUsername = username;
  }

  public async SaveUser(userData: any) {
    userData.roles = [];
    userData.roles.push({ name: 'user', _id: '62a0a21fb12ff26ed28e6874' });
    const user = await this._userDAL.Save(userData);
    console.log(user);
    const token = JwtHelper.generateToken(user.username, user.roles);
    this._mailService.subject = `Your, ${user.name}, account has created successfully `;
    this._mailService.to = user.email;
    await this._mailService.send();
    return new ApiResponse({ token });
  }

  public async EditProfile(userData: any) {
    return await this.updateUser(userData);
  }

  public async UpdateAvatar(fileBytes?: Buffer) {
    return await this.updateUser({ avatar: fileBytes });
  }

  public async UpdateEmailAddress(email: string) {
    return await this.updateUser({ email });
  }

  public async GetProfile() {
    const username = this.currentUsername;
    const user = await this._userDAL.GetSingleRecord({ username });
    return new ApiResponse(user?.toObject());
  }

  public async GetUsers() {
    let users = await this._userDAL.GetAllRecords();
    users = users.map((u: any) => u.toObject());
    return new ApiResponse(users);
  }

  public async DeleteUser(username: string) {
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
