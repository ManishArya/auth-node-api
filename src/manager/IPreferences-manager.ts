export interface IPreferenceManager {
  getDarkThemeAsync: () => Promise<boolean>;
  getUserLocaleAsync: () => Promise<string>;
  setDarkThemeAsync: (enable: boolean) => Promise<void>;
  setUserLocaleAsync: (locale: string) => Promise<void>;
  updateAsync: () => Promise<void>;
  getUserPreferencesBySectionAsync: <T>(section: ValueOf<SectionName>) => Promise<T>;
}

export class SectionName {
  public readonly _preferences = 'general-preferences';
}

export class SectionKey {
  public readonly _darkTheme = 'darkTheme';
  public readonly _locale = 'locale';
}

export type ValueOf<T> = T[keyof T];
