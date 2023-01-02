import BaseSchema from './base-schema';

export default interface IPrefrencesSchema extends BaseSchema {
  username: string;
  sectionName: string;
  sectionPreferences: Record<string, any>;
}
