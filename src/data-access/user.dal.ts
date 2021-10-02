import User from '../models/user';

export default class UserDal {
  static async getUserByUsername(username: any) {
    return await this.getUser({ username });
  }

  static async getUser(filterQuery: any) {
    return await User.findOne(filterQuery);
  }

  static async saveUser(userData: any) {
    const user = new User(userData);
    return await user.save();
  }

  static async updateUser(filter: any, update: any) {
    return await User.findOneAndUpdate(filter, update, {
      returnOriginal: false,
      runValidators: true
    });
  }

  static async getUsers() {
    return await User.find();
  }

  static async deleteUser(username: any) {
    return await User.findOneAndDelete({ username });
  }

  static async checkUserExists(filterQuery: any) {
    return await User.exists(filterQuery);
  }
}
