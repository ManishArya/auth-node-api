import { Role } from '../enums/role';
import UserProfile from './user-profile';

export default class UserInfo extends UserProfile {
  roles: string[];
  isAdmin: boolean;
  constructor(data: any) {
    super(data);
    this.roles = data.roles.map((r: any) => r.name);
    this.isAdmin = this.roles.some((r) => r === Role.admin);
  }
}
