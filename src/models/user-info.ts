import { RolePermission } from '../enums/role-permission';
import IUserSchema from './interfaces/user-schema';

export default class UserInfo {
  public readonly _id: string = '';
  public readonly isAdmin: boolean = false;
  public perms: readonly string[] = [];

  constructor(data: IUserSchema) {
    if (data) {
      this._id = data._id;
      this.isAdmin = data.isAdmin;
      const roles = data.roles;
      if (roles.length > 0) {
        this.perms = [...new Set(roles.flatMap((r: any) => r.perms.map((r: any) => RolePermission[r.value])))];
      }
    }
  }
}
