import QueryDAL from '../data-access/query.dal';
import GeneralPreferences from '../models/interfaces/general-preferences';
import IPrefrencesSchema from '../models/interfaces/preferences-schema';
import { IPreferenceManager, SectionKey, SectionName, ValueOf } from './IPreferences-manager';

export default class PreferencesManager implements IPreferenceManager {
  private readonly _systemPreferencesMap: Map<string, Record<string, any>> = new Map();
  private readonly _userPreferencesMap: Map<string, Record<string, any>> = new Map();
  private readonly _userId: string = '';
  private readonly _preferencesDAL: QueryDAL<IPrefrencesSchema>;

  private get PreferencesMap() {
    return this._userId ? this._userPreferencesMap : this._systemPreferencesMap;
  }

  public constructor(userId: string, preferencesDAL: QueryDAL<IPrefrencesSchema>) {
    this._userId = userId;
    this._preferencesDAL = preferencesDAL;
  }

  public async getUserPreferencesBySectionAsync<TModel>(section: ValueOf<SectionName>): Promise<TModel> {
    switch (section) {
      case 'general-preferences':
        return {
          enableDarkTheme: await this.getDarkThemeAsync(),
          locale: await this.getUserLocaleAsync()
        } as GeneralPreferences as unknown as TModel;
      default:
        return {} as TModel;
    }
  }

  public async getDarkThemeAsync() {
    return await this.getUserPreferencesAsync<boolean>('general-preferences', 'darkTheme', false);
  }

  public async setDarkThemeAsync(value: boolean) {
    await this.setUserPreferencesAsync<boolean>('general-preferences', 'darkTheme', value);
  }

  public async getUserLocaleAsync() {
    return await this.getUserPreferencesAsync<string>('general-preferences', 'locale', 'en');
  }

  public async setUserLocaleAsync(locale: string) {
    await this.setUserPreferencesAsync<string>('general-preferences', 'locale', locale);
  }

  public async updateAsync() {
    await this.updateUserPreferencesAsync();
    await this.updateSystemPreferencesAsync();
  }

  private async getUserPreferencesAsync<TValue>(
    section: ValueOf<SectionName>,
    key: ValueOf<SectionKey>,
    defaultValue: TValue
  ): Promise<TValue> {
    return await this.getPreferencesAsync<TValue>(section, key, defaultValue, this._userId);
  }

  private async setUserPreferencesAsync<TValue>(
    section: ValueOf<SectionName>,
    key: ValueOf<SectionKey>,
    value: TValue
  ) {
    await this.setPreferencesAsync<TValue>(section, key, value, this._userId);
  }

  private async updateUserPreferencesAsync() {
    if (this._userPreferencesMap.size) {
      await this.updatePreferencesAsync(this._userPreferencesMap, false);
    }
  }

  private async updateSystemPreferencesAsync() {
    if (this._systemPreferencesMap.size) {
      await this.updatePreferencesAsync(this._systemPreferencesMap, true);
    }
  }

  private async updatePreferencesAsync(preferencesMap: Map<string, Record<string, any>>, systemPreference: boolean) {
    const sections = Array.from(preferencesMap.entries()).flat();
    const sectionName = sections[0] as string;
    const sectionPreferences = sections[1] as any;

    if (sectionPreferences) {
      const userId = systemPreference ? '' : this._userId;

      const filter = {
        sectionName,
        userId
      };

      const preference = {
        sectionName,
        userId,
        sectionPreferences
      } as IPrefrencesSchema;

      await this._preferencesDAL.updateRecordAsync(filter, preference, true);
    }
  }

  private async getLeanPreferencesAsync(sectionName: string, userId: string): Promise<IPrefrencesSchema> {
    return await this._preferencesDAL.getFilterLeanRecordAsync({ userId, sectionName });
  }

  private async getPreferencesAsync<TValue>(
    section: string,
    key: string,
    defaultValue: TValue,
    userId: string
  ): Promise<TValue> {
    if (!this.PreferencesMap.has(section)) {
      await this.writePreferencesMapAsync(section, userId);
    }

    const sectionPreferences = this.PreferencesMap.get(section);

    const value = sectionPreferences?.[key];

    if (!value) {
      return defaultValue;
    }

    return value as unknown as TValue;
  }

  private async writePreferencesMapAsync(section: string, userId: string): Promise<void> {
    const preferences = await this.getLeanPreferencesAsync(section, userId);
    const sectionPreferences = preferences?.sectionPreferences;

    if (sectionPreferences) {
      this.PreferencesMap.set(section, sectionPreferences);
    }
  }

  private async setPreferencesAsync<TValue>(
    section: string,
    key: string,
    value: TValue,
    userId: string
  ): Promise<void> {
    const _preferencesMap = this.PreferencesMap;

    if (!_preferencesMap.has(section)) {
      await this.writePreferencesMapAsync(section, userId);
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
