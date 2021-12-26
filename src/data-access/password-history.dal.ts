import PasswordHistory from '../models/password-history';

export default class PasswordHistoryDAL {
  public static async getPasswords(username: string) {
    return await PasswordHistory.find({ username }).limit(5).lean();
  }

  public static async savePassword(hashPassword: string, username: string): Promise<void> {
    const passwordHistory = new PasswordHistory({ password: hashPassword, username });
    await passwordHistory.save();
  }
}
