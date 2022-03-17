import IPrefrencesSchema from '../models/IPreferences-schema';
import { default as preferencesSchema, default as PreferencesSchema } from '../models/preferences-schema';

export default class PreferencesDAL {
  public static async getPreferences(username: string): Promise<IPrefrencesSchema[]> {
    return await PreferencesSchema.find({ $or: [{ username }, { username: '' }] }).lean();
  }

  public static async getPreference(username: string, sectionName: string) {
    return preferencesSchema.findOne({ username, sectionName });
  }

  public static async getLeanPreference(username: string, sectionName: string): Promise<IPrefrencesSchema> {
    return preferencesSchema.findOne({ username, sectionName }).lean();
  }

  public static async createPreference(preferenceSchema: IPrefrencesSchema) {
    preferencesSchema.create(preferenceSchema);
  }

  public static async setPreferences() {}
}
