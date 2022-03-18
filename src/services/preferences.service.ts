import ApiResponse from '../models/api-response';
import IPreferences from '../models/IPreferences';
import Preferences from '../models/preferences';
import UserInfo from '../models/user-info';

export default class PreferencesService {
  public static currentUser: UserInfo;

  public static async getPreferences() {
    const p = new Preferences(this.currentUser.username);
    return Promise.resolve(
      new ApiResponse({
        enableDarkTheme: p.enableDarkTheme,
        languageCode: p.languageCode
      } as IPreferences)
    );
  }

  public static async setDarkTheme(enable: boolean): Promise<void> {
    const p = new Preferences(this.currentUser.username);
    p.enableDarkTheme = enable;
    await p.update();
  }
}
