import IUserSchema from './interfaces/user-schema';

export default class UserProfile {
  public readonly _id: string;
  public readonly avatar: string;
  public readonly name: string;
  public readonly email: string;
  public readonly mobile: string;
  public readonly username: string;

  constructor(data: IUserSchema) {
    this.name = data.name;
    this.email = data.email;
    this.mobile = data.mobile;
    this.username = data.username;
    this._id = data._id;
    this.avatar = data.avatar?.toString();
  }
}
