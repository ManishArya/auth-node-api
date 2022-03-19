import IPrefrencesSchema from '../models/IPreferences-schema';
import { default as preferencesSchema, default as PreferencesSchema } from '../models/preferences-schema';

export default class PreferencesDAL {
  public static async getPreferences(username: string): Promise<IPrefrencesSchema[]> {
    return await PreferencesSchema.find({ $or: [{ username }, { username: '' }] }).lean();
  }

  public static async getPreference(username: string, sectionName: string) {
    return await preferencesSchema.findOne({ username, sectionName });
  }

  public static async getLeanPreference(username: string, sectionName: string): Promise<IPrefrencesSchema> {
    return await preferencesSchema.findOne({ username, sectionName }).lean();
  }

  public static async createPreference(preferenceSchema: IPrefrencesSchema) {
    await preferencesSchema.create(preferenceSchema);
  }

  public static async checkPreferenceExists(filter: any) {
    return await preferencesSchema.exists(filter);
  }

  public static async updatePreference(filter: any, update: IPrefrencesSchema) {
    await preferencesSchema.updateOne(filter, update);
  }
}
