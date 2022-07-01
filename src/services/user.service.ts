import { StatusCodes } from 'http-status-codes';
import { __ as translate } from 'i18n';
import QueryDAL from '../data-access/query.dal';
import { LoginResponseCode } from '../enums/login-response-code.enum';
import ApiResponse from '../models/api-response';
import AuthResponse from '../models/auth-response';
import IUserSchema from '../models/interfaces/user-schema';
import { NotFoundException } from '../models/Invalid-operation-exception';
import UserInfo from '../models/user-info';
import UserProfile from '../models/user-profile';
import JwtHelper from '../utils/jwt-helper';
import MailService from './mail.service';

export default class UserService {
  private readonly currentUsername: string;
  private readonly _userDAL: QueryDAL<IUserSchema>;
  private readonly _mailService: MailService;

  constructor(userDAL: QueryDAL<IUserSchema>, mailService: MailService, username: string = '') {
    this._userDAL = userDAL;
    this._mailService = mailService;
    this.currentUsername = username;
  }

  public async validateUser(
    filter: any,
    password: string,
    errorMessage = 'Credential is wrong !!!'
  ): Promise<AuthResponse> {
    const user = await this._userDAL.getFilterRecord(filter);

    if (!user) {
      errorMessage = translate('userNotFound');
      return new AuthResponse(errorMessage, StatusCodes.NOT_FOUND, LoginResponseCode.NoUser);
    }

    if (user.isUserLocked) {
      return new AuthResponse(translate('userLocked'), StatusCodes.BAD_REQUEST, LoginResponseCode.locked);
    }

    const isPasswordValid = await user.isPasswordValid(password);

    await user.updateUserLockedInformation(isPasswordValid);

    if (isPasswordValid) {
      return new AuthResponse(user, StatusCodes.OK, LoginResponseCode.successful);
    }

    return new AuthResponse(errorMessage, StatusCodes.BAD_REQUEST, LoginResponseCode.unsuccessful);
  }

  public async saveUser(userData: Partial<IUserSchema>) {
    const user = await this._userDAL.saveRecord(userData);
    const userInfo = await this.getUserPermissions(user.username);
    const token = JwtHelper.generateToken(userInfo);
    this._mailService.subject = `Your, ${user.name}, account has created successfully `;
    this._mailService.to = user.email;
    await this._mailService.send();
    return new ApiResponse({ token });
  }

  public async editProfile(userData: Partial<IUserSchema>) {
    return await this.UpdateUser(userData);
  }

  public async updateAvatar(fileBytes?: Buffer) {
    return await this.UpdateUser({ avatar: fileBytes });
  }

  public async updateEmailAddress(email: string) {
    return await this.UpdateUser({ email });
  }

  public async getProfile() {
    const user = await this._userDAL.getFilterLeanRecord({ username: this.currentUsername });

    if (!user) {
      throw new NotFoundException('', '');
    }

    return new ApiResponse(new UserProfile(user));
  }

  public async getUserPermissions(username?: string) {
    const user = await this._userDAL.getFilterRecordWithAllRefs(
      { username: this.currentUsername || username },
      { path: 'roles', populate: { path: 'perms' } }
    );

    if (!user) {
      throw new NotFoundException('', '');
    }

    return new UserInfo(user);
  }

  public async getAllUsers() {
    let users = await this._userDAL.getRecords();
    users = users.map((u: any) => u.toObject());
    return new ApiResponse(users);
  }

  public async deleteUser(username: string) {
    await this._userDAL.findAndDeleteRecord({ username });
    return new ApiResponse('User Deleted Successfully', StatusCodes.NO_CONTENT);
  }

  private async UpdateUser(data: Partial<IUserSchema>) {
    const username = this.currentUsername;
    data.lastUpdatedBy = username?.toLowerCase();

    const user = await this._userDAL.findAndUpdateLeanRecord({ username }, data);

    if (user) {
      return new ApiResponse(new UserProfile(user));
    }
    return new ApiResponse('No User found', StatusCodes.NOT_FOUND);
  }
}
