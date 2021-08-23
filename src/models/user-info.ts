export default class UserInfo {
  name: string;
  email: string;
  mobile: string;
  username: string;
  constructor(data: any) {
    this.name = data.name;
    this.email = data.email;
    this.mobile = data.mobile;
    this.username = data.username;
  }
}
