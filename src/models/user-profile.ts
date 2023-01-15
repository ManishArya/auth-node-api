import IUserSchema from './interfaces/user-schema';

export default class UserProfile {
  public readonly _id: string;
  public readonly avatar: string;
  public readonly name: string;
  public readonly email: string;
  public readonly mobile: string;

  constructor(data: IUserSchema) {
    this.name = data.name;
    this.email = data.email;
    this.mobile = data.mobile;
    this._id = data._id;
    this.avatar = this.convertBufferToBase64String(data.avatar);
  }

  private convertBufferToBase64String(avatar: Buffer): string {
    if (avatar) {
      return `data:image/jpg;base64,${avatar.toString('base64')}`;
    }
    return '';
  }
}
