import QueryDAL from '../data-access/query.dal';
import GeneralPreferences from '../models/interfaces/general-preferences';
import IPrefrencesSchema from '../models/interfaces/preferences-schema';
import { IPreferenceManager, SectionKey, SectionName, ValueOf } from './IPreferences-manager';

export default class PreferencesManager implements IPreferenceManager {
  private readonly _systemPreferencesMap: Map<string, Record<string, any>> = new Map();
  private readonly _userPreferencesMap: Map<string, Record<string, any>> = new Map();
  private readonly _username: string = '';
  private readonly _preferencesDAL: QueryDAL<IPrefrencesSchema>;

  private get PreferencesMap() {
    return this._username ? this._userPreferencesMap : this._systemPreferencesMap;
  }

  public constructor(username: string, preferencesDAL: QueryDAL<IPrefrencesSchema>) {
    this._username = username;
    this._preferencesDAL = preferencesDAL;
  }

  public async getUserPreferencesBySection<TModel>(section: ValueOf<SectionName>): Promise<TModel> {
    switch (section) {
      case 'general-preferences':
        return {
          enableDarkTheme: await this.getDarkTheme(),
          locale: await this.getUserLocale()
        } as GeneralPreferences as unknown as TModel;
      default:
        return {} as TModel;
    }
  }

  public async getDarkTheme() {
    return await this.getUserPreferences<boolean>('general-preferences', 'darkTheme', false);
  }

  public async setDarkTheme(value: boolean) {
    await this.setUserPreferences<boolean>('general-preferences', 'darkTheme', value);
  }

  public async getUserLocale() {
    return await this.getUserPreferences<string>('general-preferences', 'locale', 'en');
  }

  public async setUserLocale(locale: string) {
    await this.setUserPreferences<string>('general-preferences', 'locale', locale);
  }

  public async update() {
    await this.updateUserPreferences();
    await this.updateSystemPreferences();
  }

  private async getUserPreferences<TValue>(
    section: ValueOf<SectionName>,
    key: ValueOf<SectionKey>,
    defaultValue: TValue
  ): Promise<TValue> {
    return await this.getPreferences<TValue>(section, key, defaultValue, this._username);
  }

  private async setUserPreferences<TValue>(section: ValueOf<SectionName>, key: ValueOf<SectionKey>, value: TValue) {
    await this.setPreferences<TValue>(section, key, value, this._username);
  }

  private async updateUserPreferences() {
    if (this._userPreferencesMap.size) {
      await this.updatePreferences(this._userPreferencesMap, false);
    }
  }

  private async updateSystemPreferences() {
    if (this._systemPreferencesMap.size) {
      await this.updatePreferences(this._systemPreferencesMap, true);
    }
  }

  private async updatePreferences(preferencesMap: Map<string, Record<string, any>>, systemPreference: boolean) {
    const sections = Array.from(preferencesMap.entries()).flat();
    const sectionName = sections[0] as string;
    const sectionPreferences = sections[1] as any;

    if (sectionPreferences) {
      const username = systemPreference ? '' : this._username;

      const filter = {
        sectionName,
        username
      };

      const preference = {
        sectionName,
        username,
        sectionPreferences
      } as IPrefrencesSchema;

      await this._preferencesDAL.updateRecord(filter, preference, true);
    }
  }

  private async getLeanPreferences(sectionName: string, username: string): Promise<IPrefrencesSchema> {
    return await this._preferencesDAL.getFilterLeanRecord({ username, sectionName });
  }

  private async getPreferences<TValue>(
    section: string,
    key: string,
    defaultValue: TValue,
    username: string
  ): Promise<TValue> {
    if (!this.PreferencesMap.has(section)) {
      await this.writePreferencesMap(section, username);
    }

    const sectionPreferences = this.PreferencesMap.get(section);

    const value = sectionPreferences?.[key];

    if (!value) {
      return defaultValue;
    }

    return value as unknown as TValue;
  }

  private async writePreferencesMap(section: string, username: string): Promise<void> {
    const preferences = await this.getLeanPreferences(section, username);
    const sectionPreferences = preferences?.sectionPreferences;

    if (sectionPreferences) {
      this.PreferencesMap.set(section, sectionPreferences);
    }
  }

  private async setPreferences<TValue>(section: string, key: string, value: TValue, username: string): Promise<void> {
    const _preferencesMap = this.PreferencesMap;

    if (!_preferencesMap.has(section)) {
      await this.writePreferencesMap(section, username);
    }
    const sectionWisePreferences = _preferencesMap.get(section);

    if (sectionWisePreferences) {
      sectionWisePreferences[key] = value;
      _preferencesMap.set(section, sectionWisePreferences);
    } else {
      _preferencesMap.set(section, { [key]: value });
    }
  }
}
