import { FilterQuery } from 'mongoose';
import IUser from '../models/IUser';
import User from '../models/user';

export default class UserDal {
  public static async getUserByUsername(username: string) {
    return await this.getUser({ username });
  }

  public static async getUser(filterQuery: FilterQuery<IUser>) {
    return await User.findOne(filterQuery);
  }

  public static async saveUser(userData: any) {
    const user = new User(userData);
    return await user.save();
  }

  public static async updateUser(filter: any, update: any) {
    return await User.findOneAndUpdate(filter, update, {
      returnOriginal: false,
      runValidators: true
    });
  }

  public static async getUsers() {
    return await User.find();
  }

  public static async deleteUser(username: any) {
    return await User.findOneAndDelete({ username });
  }

  public static async checkUserExists(filter: any): Promise<boolean> {
    return await User.exists(filter);
  }
}
