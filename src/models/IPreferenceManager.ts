export interface IPreferenceManager {
  getDarkTheme: () => Promise<boolean>;
  getUserLocale: () => Promise<string>;
}
