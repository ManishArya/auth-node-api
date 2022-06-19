import PreferencesManager from '../manager/preferences-manager';
import ApiResponse from '../models/api-response';
import IPreferences from '../models/interfaces/preferences';

export default class PreferencesService {
  private readonly currentUsername: string = '';
  private readonly _preferencesManager: PreferencesManager;

  constructor(username: string, preferencesManager: PreferencesManager) {
    this.currentUsername = username;
    this._preferencesManager = preferencesManager;
  }

  public async getPreferences() {
    return Promise.resolve(
      new ApiResponse(await this._preferencesManager.getUserPreferencesBySection<IPreferences>('preferences'))
    );
  }

  public async setDarkTheme(enable: boolean): Promise<void> {
    await this._preferencesManager.setDarkTheme(enable);
    await this._preferencesManager.update();
  }

  public async setLocale(locale: string): Promise<void> {
    await this._preferencesManager.setUserLocale(locale);
    await this._preferencesManager.update();
  }
}
