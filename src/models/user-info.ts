import { Role } from '../enums/role';

export default class UserInfo {
  name: string;
  email: string;
  mobile: string;
  username: string;
  roles: string[];
  isAdmin: boolean;
  constructor(data: any) {
    this.name = data.name;
    this.email = data.email;
    this.mobile = data.mobile;
    this.username = data.username;
    this.roles = data.roles.map((r: any) => r.name);
    this.isAdmin = this.roles.some((r) => r === Role.admin);
  }
}
