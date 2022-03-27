import ApiResponse from '../models/api-response';
import IPreferences from '../models/IPreferences';
import PreferencesManager from '../models/preferences-manager';

export default class PreferencesService {
  public static currentUsername: string;

  public static async getPreferences() {
    const p = new PreferencesManager(this.currentUsername);
    return Promise.resolve(new ApiResponse(await p.getUserPreferencesBySection<IPreferences>('preferences')));
  }

  public static async setDarkTheme(enable: boolean): Promise<void> {
    const p = new PreferencesManager(this.currentUsername);
    p.setUserPreferences<boolean>('preferences', 'darkTheme', enable);
    await p.update();
  }
}
