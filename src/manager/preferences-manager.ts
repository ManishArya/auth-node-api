import QueryDAL from '../data-access/query.dal';
import IPreferences from '../models/IPreferences';
import IPrefrencesSchema from '../models/IPreferences-schema';
import { IPreferenceManager, SectionKey, SectionName, ValueOf } from './IPreferences-manager';

export default class PreferencesManager implements IPreferenceManager {
  private readonly _systemPreferences: Map<string, Map<string, string>> = new Map();
  private readonly _userPreferences: Map<string, Map<string, string>> = new Map();
  private readonly username: string = '';
  private readonly _preferencesDAL: QueryDAL<IPrefrencesSchema>;

  public constructor(username: string, preferencesDAL: QueryDAL<IPrefrencesSchema>) {
    this.username = username;
    this._preferencesDAL = preferencesDAL;
  }

  public async GetUserPreferencesBySection<T>(section: ValueOf<SectionName>): Promise<T> {
    switch (section) {
      case 'preferences':
        return {
          enableDarkTheme: await this.GetDarkTheme(),
          locale: await this.GetUserLocale()
        } as IPreferences as unknown as T;
      default:
        return {} as T;
    }
  }

  public async GetDarkTheme() {
    return await this.GetUserPreferences<boolean>('preferences', 'darkTheme', false);
  }

  public async SetDarkTheme(value: boolean) {
    await this.SetUserPreferences<boolean>('preferences', 'darkTheme', value);
  }

  public async GetUserLocale() {
    return await this.GetUserPreferences<string>('preferences', 'locale', 'en');
  }

  public async SetUserLocale(locale: string) {
    await this.SetUserPreferences<string>('preferences', 'locale', locale);
  }

  public async Update() {
    await this.UpdateUserPreferences();
    await this.UpdateSystemPreferences();
  }

  private async GetUserPreferences<T>(
    section: ValueOf<SectionName>,
    key: ValueOf<SectionKey>,
    defaultValue: T
  ): Promise<T> {
    return await this.GetPreferences<T>(section, key, defaultValue, this.username);
  }

  private async SetUserPreferences<T>(section: ValueOf<SectionName>, key: ValueOf<SectionKey>, value: T) {
    await this.SetPreferences<T>(section, key, value, this.username);
  }

  private async UpdateUserPreferences() {
    if (this._userPreferences.size) {
      await this.UpdatePreferences(this._userPreferences, false);
    }
  }

  private async UpdateSystemPreferences() {
    if (this._systemPreferences.size) {
      await this.UpdatePreferences(this._systemPreferences, true);
    }
  }

  private async UpdatePreferences(preferences: Map<string, Map<string, string>>, systemPreference: boolean) {
    const sections = Array.from(preferences.entries()).flat();
    const sectionName = sections[0] as string;
    const keyValuePair = sections[1] as Map<string, string>;

    if (keyValuePair) {
      const entries = keyValuePair.entries();
      const value = Array.from(entries)
        .flatMap((x) => x.join('='))
        .join('\r\n');

      const username = systemPreference ? '' : this.username;

      const filter = {
        sectionName,
        username
      };

      const isExists = await this._preferencesDAL.IsRecordExists(filter);

      const preference = {
        sectionName,
        username,
        value
      } as IPrefrencesSchema;

      if (isExists) {
        await this._preferencesDAL.UpdateRecord(filter, preference);
      } else {
        await this._preferencesDAL.CreateNewRecord(preference);
      }
    }
  }

  private async GetLeanPreference(sectionName: string, username: string): Promise<IPrefrencesSchema> {
    return await this._preferencesDAL.GetLeanSingleRecord({ username, sectionName });
  }

  private async GetPreferences<T>(section: string, key: string, defaultValue: T, username: string): Promise<T> {
    const _preferences = username ? this._userPreferences : this._systemPreferences;

    if (!_preferences.has(section)) {
      await this.WritePreferencesMap(section, username);
    }

    const keyValuePair = _preferences.get(section);

    if (!keyValuePair?.has(key)) {
      return defaultValue;
    }

    const value = keyValuePair.get(key);

    if (!value) {
      return defaultValue;
    }

    if (typeof defaultValue === 'string') {
      return value as unknown as T;
    }

    return JSON.parse(value as string) as T;
  }

  private async WritePreferencesMap(section: string, username: string): Promise<Map<string, Map<string, string>>> {
    const _preferences = username ? this._userPreferences : this._systemPreferences;
    const preference = await this.GetLeanPreference(section, username);
    const value = preference?.value;

    if (value) {
      const keyValuePair = new Map<string, string>();
      const lines = value.split('\r\n').filter((x) => !!x);

      lines.forEach((v) => {
        const parts = v.split('=', 2).filter((x) => !!x);
        if (parts.length === 2) {
          keyValuePair.set(parts[0], parts[1]);
        }
      });
      _preferences.set(section, keyValuePair);
    }

    return _preferences;
  }

  private async SetPreferences<T>(section: string, key: string, value: T, username: string): Promise<void> {
    const _preferences = username ? this._userPreferences : this._systemPreferences;
    if (!_preferences.has(section)) {
      await this.WritePreferencesMap(section, username);
    }
    const keyValuePair = _preferences.get(section);
    if (keyValuePair) {
      _preferences.set(section, keyValuePair.set(key, value as unknown as string));
    } else {
      _preferences.set(section, new Map<string, string>([[key, value as unknown as string]]));
    }
  }
}
