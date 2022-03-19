import { SectionName } from '../enums/section-name.enum';
import ApiResponse from '../models/api-response';
import IPreferences from '../models/IPreferences';
import PreferencesManager from '../models/preferences-manager';
import UserInfo from '../models/user-info';

export default class PreferencesService {
  public static currentUser: UserInfo;

  public static async getPreferences() {
    const p = new PreferencesManager(this.currentUser.username);
    return Promise.resolve(
      new ApiResponse({
        enableDarkTheme: await p.getUserPreferences<boolean>(SectionName._preferences, 'enableDarkTheme', false),
        languageCode: await p.getUserPreferences<string>(SectionName._preferences, 'languageCode', 'en-us')
      } as IPreferences)
    );
  }

  public static async setDarkTheme(enable: boolean): Promise<void> {
    const p = new PreferencesManager(this.currentUser.username);
    await p.setUserPreferences<boolean>(SectionName._preferences, 'enableDarkTheme', enable);
    await p.update();
  }
}
