import { Model } from 'mongoose';
import IPrefrencesSchema from '../models/IPreferences-schema';
import { default as preferencesSchema } from '../models/preferences-schema';
import { QueryDAL } from './query.dal';

export default class PreferencesDAL extends QueryDAL<IPrefrencesSchema> {
  protected DBSchema: Model<IPrefrencesSchema, {}, {}> = preferencesSchema;
}
