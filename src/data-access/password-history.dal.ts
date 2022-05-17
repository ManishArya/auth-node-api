import { Model } from 'mongoose';
import IPasswordHistorySchema from '../models/IPasswordHistorySchema';
import PasswordHistorySchema from '../models/password-history';
import { QueryDAL } from './query.dal';

export default class PasswordHistoryDAL extends QueryDAL<IPasswordHistorySchema> {
  protected DBSchema: Model<IPasswordHistorySchema, {}, {}> = PasswordHistorySchema;

  // public async getPasswords(username: string) {
  //   return await PasswordHistorySchema.find({ username }).limit(5).lean();
  // }

  // public async savePassword(hashPassword: string, username: string): Promise<void> {
  //   const passwordHistory = new PasswordHistorySchema({ password: hashPassword, username });
  //   await passwordHistory.save();
  // }
}
