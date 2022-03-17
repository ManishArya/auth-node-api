import PreferencesDAL from '../data-access/preferences.dal';
import IPrefrencesSchema from './IPreferences-schema';
import preferencesSchema from './preferences-schema';

class SectionName {
  public static readonly _preferncesSection = 'preferences';
}

class SectionKey {
  public static readonly _darkTheme = 'darkTheme';
  public static readonly _languageCode = 'languageCode';
}

export default class Preferences {
  private isNew: boolean = false;
  private readonly _systemPreferences: Map<string, Map<string, string>> = new Map();
  private readonly _userPreferences: Map<string, Map<string, string>> = new Map();
  private readonly _preferences: Map<string, Map<string, string>> = new Map();
  private _username: string = '';

  constructor(preferencesSchema: IPrefrencesSchema[], username: string) {
    this._username = username;

    preferencesSchema?.forEach((p) => {
      const section = p?.sectionName;

      if (!section) return;

      const value = p.value;

      if (!value) return;

      const splitValue = value.split(' ').filter((v) => !!v);

      const preferenceMap = new Map<string, string>();

      splitValue.forEach((s) => {
        const preference = s.split('=').filter((v) => !!v);
        const preferenceValue = preference[1];
        const preferenceKey = preference[0];

        if (preferenceValue && preferenceKey) {
          if (p.username) {
            this._userPreferences.set(section, preferenceMap.set(preferenceKey, preferenceValue));
          } else {
            this._systemPreferences.set(section, preferenceMap.set(preferenceKey, preferenceValue));
          }
        }
      });
    });
  }

  public get enableDarkTheme(): boolean {
    return this.getUserPreferences<boolean>(SectionName._preferncesSection, SectionKey._darkTheme, false);
  }

  public set enableDarkTheme(value: boolean) {
    this.setUserPreferences<boolean>(SectionName._preferncesSection, SectionKey._darkTheme, value);
  }

  public get languageCode() {
    return (async () =>
      await this.getUserPreferences<string>(SectionName._preferncesSection, SectionKey._languageCode, 'en-us'))();
  }

  public set languageCode(value: string) {
    this.setUserPreferences<string>(SectionName._preferncesSection, SectionKey._languageCode, value);
  }

  public toJson() {
    return {
      enableDarkTheme: this.enableDarkTheme,
      languageCode: this.languageCode
    };
  }

  public async update() {
    if (this._preferences.size) {
      const y = Array.from(this._preferences.entries()).flat();
      const sectionName = y[0] as string;
      const v = y[1] as Map<string, string>;
      const x = v?.entries();
      if (x) {
        const value = Array.from(x)
          .flatMap((x) => x.join('='))
          .join(' ');

        const preference = {
          sectionName,
          username: this._username,
          value
        };

        if (this.isNew) {
          preferencesSchema.create(preference);
        } else {
          preferencesSchema.updateOne(
            {
              sectionName: SectionName._preferncesSection
            },
            preference
          );
        }
      }
    }
  }

  private async create() {}

  private async getUserPreferences<T>(section: string, key: string, defaultValue: T) {
    return await this.getPreferences<T>(section, key, defaultValue, this._username);
  }

  private setUserPreferences<T>(section: string, key: string, value: T) {
    this.setPreferences<T>(section, key, value, this._username);
  }

  private getSystemPreferences<T>(section: string, key: string, defaultValue: T) {
    return this.getPreferences<T>(section, key, defaultValue, '');
  }

  public async readPrefrences(sectionName: string): Promise<IPrefrencesSchema> {
    return await PreferencesDAL.getLeanPreference(this._username, sectionName);
  }

  private async getPreferences<T>(section: string, key: string, defaultValue: T, username: string) {
    if (!this._preferences.has(section)) {
      const preferenceSchema = await this.readPrefrences(section);
      if (!preferenceSchema) {
        return defaultValue;
      }
      this.setPreferences(section, key, preferenceSchema.value, username);
    }

    const preference = this._preferences.get(section);

    if (!preference?.has(key)) {
      return defaultValue;
    }

    const value = preference.get(key);

    if (!value) {
      return defaultValue;
    }

    if (typeof defaultValue === 'string') {
      return value;
    }

    return JSON.parse(value as string);
  }

  private setPreferences<T>(section: string, key: string, value: T, username: string) {
    if (!this._preferences.has(section)) {
      this.isNew = true;
      this._preferences.set(section, new Map<string, string>([[key, value as unknown as string]]));
    } else {
      const preference = this._preferences.get(section);
      if (preference) {
        this._preferences.set(section, preference.set(key, value as unknown as string));
      }
    }
  }
}
