import ApiResponse from '../models/api-response';
import IPreferences from '../models/IPreferences';
import PreferencesManager from '../models/preferences-manager';
import UserInfo from '../models/user-info';

export default class PreferencesService {
  public static currentUser: UserInfo;

  public static async getPreferences() {
    const p = new PreferencesManager(this.currentUser.username);
    return Promise.resolve(new ApiResponse(await p.getUserPreferencesBySection<IPreferences>('preferences')));
  }

  public static async setDarkTheme(enable: boolean): Promise<void> {
    const p = new PreferencesManager(this.currentUser.username);
    p.setUserPreferences<boolean>('preferences', 'darkTheme', enable);
    await p.update();
  }
}
