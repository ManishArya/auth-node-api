import PreferencesManager from '../manager/preferences-manager';
import ApiResponse from '../models/api-response';
import IPreferences from '../models/IPreferences';

export default class PreferencesService {
  private readonly currentUsername: string = '';
  private readonly _preferencesManager: PreferencesManager;

  constructor(username: string, preferencesManager: PreferencesManager) {
    this.currentUsername = username;
    this._preferencesManager = preferencesManager;
  }

  public async GetPreferences() {
    return Promise.resolve(
      new ApiResponse(await this._preferencesManager.GetUserPreferencesBySection<IPreferences>('preferences'))
    );
  }

  public async SetDarkTheme(enable: boolean): Promise<void> {
    await this._preferencesManager.SetDarkTheme(enable);
    await this._preferencesManager.Update();
  }

  public async SetLocale(locale: string): Promise<void> {
    await this._preferencesManager.SetUserLocale(locale);
    await this._preferencesManager.Update();
  }
}
