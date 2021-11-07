export default class UserInfo {
  name: string;
  email: string;
  mobile: string;
  username: string;
  isAdmin: boolean;
  constructor(data: any) {
    this.name = data.name;
    this.email = data.email;
    this.mobile = data.mobile;
    this.username = data.username;
    this.isAdmin = data.isAdmin;
  }
}
