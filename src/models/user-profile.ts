import UserInfo from './user-info';
export default class UserProfile extends UserInfo {
  _id: string;
  avatar: string;
  constructor(data: any) {
    super(data);
    this._id = data._id;
    this.avatar = data.avatar;
  }
}
