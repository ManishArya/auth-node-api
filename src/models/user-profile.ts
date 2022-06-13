export default class UserProfile {
  _id: string;
  avatar: string;
  name: string;
  email: string;
  mobile: string;
  username: string;
  constructor(data: any) {
    this.name = data.name;
    this.email = data.email;
    this.mobile = data.mobile;
    this.username = data.username;
    this._id = data._id;
    this.avatar = data.avatar;
  }
}
