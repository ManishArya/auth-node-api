import IUserSchema from './interfaces/user-schema';

export default class UserInfo {
  public readonly _id: string = '';
  public readonly username: string = '';
  public readonly isAdmin: boolean = false;
  public perms: readonly number[] = [];

  constructor(data: IUserSchema) {
    if (data) {
      this._id = data._id;
      this.username = data.username;
      this.isAdmin = data.isAdmin;
      const roles = data.roles;
      if (roles.length > 0) {
        this.perms = [...new Set(roles.flatMap((r) => r.perms.map((r) => r.value)))];
      }
    }
  }
}
