import PreferencesManager from '../manager/preferences-manager';
import ApiResponse from '../models/api-response';
import GeneralPreferences from '../models/interfaces/general-preferences';

export default class PreferencesService {
  private readonly _preferencesManager: PreferencesManager;

  constructor(preferencesManager: PreferencesManager) {
    this._preferencesManager = preferencesManager;
  }

  public async getPreferencesAsync() {
    return Promise.resolve(
      new ApiResponse(
        await this._preferencesManager.getUserPreferencesBySectionAsync<GeneralPreferences>('general-preferences')
      )
    );
  }

  public async setDarkThemeAsync(enable: boolean): Promise<void> {
    await this._preferencesManager.setDarkThemeAsync(enable);
    await this._preferencesManager.updateAsync();
  }

  public async setLocaleAsync(locale: string): Promise<void> {
    await this._preferencesManager.setUserLocaleAsync(locale);
    await this._preferencesManager.updateAsync();
  }
}
