import PreferencesDAL from '../data-access/preferences.dal';
import { IPreferenceManager } from './IPreferenceManager';
import IPreferences from './IPreferences';
import IPrefrencesSchema from './IPreferences-schema';

class SectionName {
  public readonly _preferences = 'preferences';
}

class SectionKey {
  public readonly _darkTheme = 'darkTheme';
  public readonly _locale = 'locale';
}

type ValueOf<T> = T[keyof T];

export default class PreferencesManager implements IPreferenceManager {
  private readonly _systemPreferences: Map<string, Map<string, string>> = new Map();
  private readonly _userPreferences: Map<string, Map<string, string>> = new Map();
  private username: string = '';

  constructor(username: string) {
    this.username = username;
  }

  public async getUserPreferencesBySection<T>(section: ValueOf<SectionName>): Promise<T> {
    switch (section) {
      case 'preferences':
        return {
          enableDarkTheme: await this.getDarkTheme(),
          locale: await this.getUserLocale()
        } as IPreferences as unknown as T;
      default:
        return {} as T;
    }
  }

  public async getDarkTheme() {
    return await this.getUserPreferences<boolean>('preferences', 'darkTheme', false);
  }

  public async getUserLocale() {
    return await this.getUserPreferences<string>('preferences', 'locale', 'en');
  }

  private async getUserPreferences<T>(
    section: ValueOf<SectionName>,
    key: ValueOf<SectionKey>,
    defaultValue: T
  ): Promise<T> {
    return await this.getPreferences<T>(section, key, defaultValue, this.username);
  }

  public setUserPreferences<T>(section: ValueOf<SectionName>, key: ValueOf<SectionKey>, value: T) {
    this.setPreferences<T>(section.valueOf(), key.valueOf(), value, this.username);
  }

  public getSystemPreferences<T>(section: string, key: string, defaultValue: T) {
    return this.getPreferences<T>(section, key, defaultValue, '');
  }

  public async update() {
    await this.updateUserPreferences();
    await this.updateSystemPreferences();
  }

  private async updateUserPreferences() {
    if (this._userPreferences.size) {
      await this.updatePreferences(this._userPreferences, false);
    }
  }

  private async updateSystemPreferences() {
    if (this._systemPreferences.size) {
      await this.updatePreferences(this._systemPreferences, true);
    }
  }

  private async updatePreferences(preferences: Map<string, Map<string, string>>, systemPreference: boolean) {
    const sections = Array.from(preferences.entries()).flat();
    const sectionName = sections[0] as string;
    const keyValuePair = sections[1] as Map<string, string>;

    if (keyValuePair) {
      const entries = keyValuePair.entries();
      const value = Array.from(entries)
        .flatMap((x) => x.join('='))
        .join(' ');

      const username = systemPreference ? '' : this.username;

      const filter = {
        sectionName,
        username
      };

      const isExists = await PreferencesDAL.checkPreferenceExists(filter);

      const preference = {
        sectionName,
        username,
        value
      } as IPrefrencesSchema;

      if (isExists) {
        await PreferencesDAL.updatePreference(filter, preference);
      } else {
        await PreferencesDAL.createPreference(preference);
      }
    }
  }

  private async getLeanPreference(sectionName: string, username: string): Promise<IPrefrencesSchema> {
    return await PreferencesDAL.getLeanPreference(username, sectionName);
  }

  private async getPreferences<T>(section: string, key: string, defaultValue: T, username: string): Promise<T> {
    const _preferences = username ? this._userPreferences : this._systemPreferences;

    if (!_preferences.has(section)) {
      const preference = await this.getLeanPreference(section, username);

      if (!preference) {
        return defaultValue;
      }

      this.setPreferencesMap(section, preference.value, username);
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

  private setPreferencesMap(section: string, value: string, username: string): void {
    const _preferences = username ? this._userPreferences : this._systemPreferences;

    if (value) {
      const keyValuePair = new Map<string, string>();
      const lines = value.split(' ').filter((x) => !!x);

      lines.forEach((v) => {
        const parts = v.split('=', 2).filter((x) => !!x);
        if (parts.length === 2) {
          keyValuePair.set(parts[0], parts[1]);
        }
      });

      _preferences.set(section, keyValuePair);
    }
  }

  private setPreferences<T>(section: string, key: string, value: T, username: string): void {
    const _preferences = username ? this._userPreferences : this._systemPreferences;
    if (!_preferences.has(section)) {
      _preferences.set(section, new Map<string, string>([[key, value as unknown as string]]));
    } else {
      const keyValuePair = _preferences.get(section);
      if (keyValuePair) {
        _preferences.set(section, keyValuePair.set(key, value as unknown as string));
      }
    }
  }
}
