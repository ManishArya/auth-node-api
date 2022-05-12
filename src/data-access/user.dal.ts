import { FilterQuery } from 'mongoose';
import IUser from '../models/IUser';
import User from '../models/user';

export default class UserDal {
  public async getUserByUsername(username: string) {
    return await this.getUser({ username });
  }

  public async getUser(filterQuery: FilterQuery<IUser>) {
    return await User.findOne(filterQuery);
  }

  public async getLeanUser(filterQuery: FilterQuery<IUser>) {
    return await User.findOne(filterQuery).lean();
  }

  public async saveUser(userData: any) {
    const user = new User(userData);
    return await user.save();
  }

  public async updateUser(filter: any, update: any) {
    return await User.findOneAndUpdate(filter, update, {
      returnOriginal: false,
      runValidators: true
    });
  }

  public async getUsers() {
    return await User.find();
  }

  public async deleteUser(username: any) {
    return await User.findOneAndDelete({ username });
  }

  public async checkUserExists(filter: any): Promise<boolean> {
    return await User.exists(filter);
  }
}
