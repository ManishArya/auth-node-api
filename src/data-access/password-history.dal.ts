import PasswordHistory from '../models/password-history';

export default class PasswordHistoryDAL {
  public async getPasswords(username: string) {
    return await PasswordHistory.find({ username }).limit(5).lean();
  }

  public async savePassword(hashPassword: string, username: string): Promise<void> {
    const passwordHistory = new PasswordHistory({ password: hashPassword, username });
    await passwordHistory.save();
  }
}
