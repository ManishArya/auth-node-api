export interface IPreferenceManager {
  getDarkTheme: () => Promise<boolean>;
  getUserLocale: () => Promise<string>;
  setDarkTheme: (enable: boolean) => Promise<void>;
  setUserLocale: (locale: string) => Promise<void>;
  update: () => Promise<void>;
  getUserPreferencesBySection: <T>(section: ValueOf<SectionName>) => Promise<T>;
}

export class SectionName {
  public readonly _preferences = 'general-preferences';
}

export class SectionKey {
  public readonly _darkTheme = 'darkTheme';
  public readonly _locale = 'locale';
}

export type ValueOf<T> = T[keyof T];
