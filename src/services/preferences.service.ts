import PreferencesDAL from '../data-access/preferences.dal';
import ApiResponse from '../models/api-response';
import IPrefrencesSchema from '../models/IPreferences-schema';
import Preferences from '../models/preferences';
import UserInfo from '../models/user-info';

export default class PreferencesService {
  public static currentUser: UserInfo;

  public static async getPreferences() {
    const preferencesSchema = await PreferencesDAL.getPreferences(this.currentUser.username);
    return Promise.resolve(new ApiResponse(new Preferences(preferencesSchema, this.currentUser.username).toJson()));
  }

  public static async getPreferencesBySection(sectionName: string) {
    return PreferencesDAL.getPreference(this.currentUser.username, sectionName);
  }

  public static async setDarkTheme(enable: boolean) {
    const preference = await this.getPreferencesBySection(SectionName._preferncesSection);
    const p = new Preferences([preference as IPrefrencesSchema], this.currentUser.username);
    p.enableDarkTheme = enable;
    p.languageCode = 'en-cn';
    p.update();
    // if (!preference) {
    //   const newPreference = {
    //     sectionName: SectionName._preferncesSection,
    //     username: this.currentUser.username,
    //     value: `${SectionKey._languageCode}=${enable}`
    //   } as IPrefrencesSchema;

    //   await PreferencesDAL.createPreference(newPreference);
    // } else {
    //   let value = preference.value || '';

    //   const values = value.split(' ').filter((x) => !!x);

    //   if (!value.includes(SectionKey._darkTheme)) {
    //     values.push(`${SectionKey._darkTheme}=${enable}`);
    //   } else {
    //     const index = values.findIndex((v) => v.includes(SectionKey._darkTheme));
    //     values[index] = `${SectionKey._darkTheme}=${enable}`;
    //   }
    //   preference.value = values.join(' ');
    //   preference.save();
    // }
  }

  public static async setPreferences() {
    throw new Error('Not implemented yet');
  }
}

class SectionName {
  public static readonly _preferncesSection = 'preferences';
  public static readonly _configurationSection = 'configuration';
}

class SectionKey {
  public static readonly _darkTheme = 'darkTheme';
  public static readonly _languageCode = 'languageCode';
}
