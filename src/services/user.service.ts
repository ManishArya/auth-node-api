import { StatusCodes } from 'http-status-codes';
import { __ as translate } from 'i18n';
import QueryDAL from '../data-access/query.dal';
import { LoginCode } from '../enums/login-response-code.enum';
import ApiResponse from '../models/api-response';
import AuthResponse from '../models/auth-response';
import IUserSchema from '../models/interfaces/user-schema';
import { NotFoundException } from '../models/Invalid-operation-exception';
import UserInfo from '../models/user-info';
import UserProfile from '../models/user-profile';
import JwtHelper from '../utils/jwt-helper';
import MailService from './mail.service';

export default class UserService {
  private readonly currentUserId: string;
  private readonly _userDAL: QueryDAL<IUserSchema>;
  private readonly _mailService: MailService;

  constructor(userDAL: QueryDAL<IUserSchema>, mailService: MailService, userId: string = '') {
    this._userDAL = userDAL;
    this._mailService = mailService;
    this.currentUserId = userId;
  }

  public async validateUserAsync(
    filter: any,
    password: string,
    errorMessage = 'Credential is wrong !!!'
  ): Promise<AuthResponse> {
    const user = await this._userDAL.getFilterRecordAsync(filter);

    if (!user) {
      errorMessage = translate('userNotFound');
      return new AuthResponse(errorMessage, StatusCodes.NOT_FOUND, LoginCode.NoUser);
    }

    if (user.isUserLocked) {
      return new AuthResponse(translate('userLocked'), StatusCodes.BAD_REQUEST, LoginCode.locked);
    }

    const isPasswordValid = await user.isPasswordValidAsync(password);

    await user.updateUserLockedInformationAsync(isPasswordValid);

    if (isPasswordValid) {
      return new AuthResponse(user, StatusCodes.OK, LoginCode.successful);
    }

    return new AuthResponse(errorMessage, StatusCodes.BAD_REQUEST, LoginCode.unsuccessful);
  }

  public async saveUserAsync(userData: Partial<IUserSchema>) {
    const user = await this._userDAL.saveRecordAsync(userData);
    const userInfo = await this.getUserPermissionsAsync(user._id);
    const token = JwtHelper.generateToken(userInfo);
    this._mailService.subject = `Your, ${user.name}, account has created successfully `;
    this._mailService.to = user.email;
    await this._mailService.sendAsync();
    return new ApiResponse({ token });
  }

  public async editProfileAsync(userData: Partial<IUserSchema>) {
    return await this.UpdateUserAsync(userData);
  }

  public async updateAvatarAsync(fileBytes?: Buffer) {
    return await this.UpdateUserAsync({ avatar: fileBytes });
  }

  public async updateEmailAddressAsync(email: string) {
    return await this.UpdateUserAsync({ email });
  }

  public async getProfileAsync() {
    const user = await this._userDAL.getFilterLeanRecordAsync({ _id: this.currentUserId });

    if (!user) {
      throw new NotFoundException('', '');
    }

    return new ApiResponse(new UserProfile(user));
  }

  public async getUserPermissionsAsync(currentUserId?: string) {
    const user = await this._userDAL.getFilterRecordWithOptionsAsync(
      { _id: this.currentUserId || currentUserId },
      { path: 'roles', populate: { path: 'perms' } }
    );

    if (!user) {
      throw new NotFoundException('', '');
    }

    return new UserInfo(user);
  }

  public async getAllUsersAsync() {
    let users = await this._userDAL.getRecordsAsync();
    users = users.map((u: any) => u.toObject());
    return new ApiResponse(users);
  }

  public async deleteUserAsync(userId: string) {
    await this._userDAL.findAndDeleteRecordAsync({ _id: userId });
    return new ApiResponse('User Deleted Successfully', StatusCodes.NO_CONTENT);
  }

  private async UpdateUserAsync(data: Partial<IUserSchema>) {
    const userId = this.currentUserId;
    data.lastUpdatedBy = userId?.toLowerCase();

    const user = await this._userDAL.findAndUpdateLeanRecordAsync({ _id: userId }, data);

    if (user) {
      return new ApiResponse(new UserProfile(user));
    }
    return new ApiResponse('No User found', StatusCodes.NOT_FOUND);
  }
}
