import PreferencesDAL from '../data-access/preferences.dal';
import IPreferences from '../models/IPreferences';
import IPrefrencesSchema from './IPreferences-schema';

class SectionName {
  public static readonly _preferences = 'preferences';
}

class SectionKey {
  public static readonly _darkTheme = 'darkTheme';
  public static readonly _languageCode = 'languageCode';
}

export default class Preferences implements IPreferences {
  private readonly _systemPreferences: Map<string, Map<string, string>> = new Map();
  private readonly _userPreferences: Map<string, Map<string, string>> = new Map();
  private username: string = '';

  constructor(username: string) {
    this.username = username;
  }

  public get enableDarkTheme() {
    return false;
  }

  public set enableDarkTheme(value: boolean) {
    this.setUserPreferences<boolean>(SectionName._preferences, SectionKey._darkTheme, value);
  }

  public get languageCode() {
    return '';
  }

  public set languageCode(value: string) {
    this.setUserPreferences<string>(SectionName._preferences, SectionKey._languageCode, value);
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

  private async getUserPreferences<T>(section: string, key: string, defaultValue: T) {
    return await this.getPreferences<T>(section, key, defaultValue, this.username);
  }

  private setUserPreferences<T>(section: string, key: string, value: T) {
    this.setPreferences<T>(section, key, value, this.username);
  }

  private getSystemPreferences<T>(section: string, key: string, defaultValue: T) {
    return this.getPreferences<T>(section, key, defaultValue, '');
  }

  public async readPreference(sectionName: string, username: string): Promise<IPrefrencesSchema> {
    return await PreferencesDAL.getLeanPreference(username, sectionName);
  }

  private async getPreferences<T>(section: string, key: string, defaultValue: T, username: string) {
    const _preferences = username ? this._userPreferences : this._systemPreferences;

    if (!_preferences.has(section)) {
      const preference = await this.readPreference(section, username);

      if (!preference) {
        return defaultValue;
      }

      this.loadPreference(section, preference.value, username);
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
      return value;
    }

    return JSON.parse(value as string) as T;
  }

  private loadPreference(section: string, value: string, username: string): void {
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
