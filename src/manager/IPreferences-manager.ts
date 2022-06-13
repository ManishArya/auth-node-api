export interface IPreferenceManager {
  GetDarkTheme: () => Promise<boolean>;
  GetUserLocale: () => Promise<string>;
  SetDarkTheme: (enable: boolean) => Promise<void>;
  SetUserLocale: (locale: string) => Promise<void>;
  Update: () => Promise<void>;
  GetUserPreferencesBySection: <T>(section: ValueOf<SectionName>) => Promise<T>;
}

export class SectionName {
  public readonly _preferences = 'preferences';
}

export class SectionKey {
  public readonly _darkTheme = 'darkTheme';
  public readonly _locale = 'locale';
}

export type ValueOf<T> = T[keyof T];
