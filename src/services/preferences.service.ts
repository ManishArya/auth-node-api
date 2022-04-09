import ApiResponse from '../models/api-response';
import IPreferences from '../models/IPreferences';
import PreferencesManager from '../models/preferences-manager';

export default class PreferencesService {
  public static currentUsername: string;

  public static async getPreferences() {
    const p = PreferencesManager.Current(this.currentUsername);
    return Promise.resolve(new ApiResponse(await p.getUserPreferencesBySection<IPreferences>('preferences')));
  }

  public static async setDarkTheme(enable: boolean): Promise<void> {
    const p = PreferencesManager.Current(this.currentUsername);
    await p.setDarkTheme(enable);
    await p.update();
  }

  public static async setLocale(locale: string): Promise<void> {
    const p = PreferencesManager.Current(this.currentUsername);
    await p.setUserLocale(locale);
    await p.update();
  }
}
