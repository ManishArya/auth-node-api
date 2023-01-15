import BaseSchema from './base-schema';

export default interface IPrefrencesSchema extends BaseSchema {
  userId: string;
  sectionName: string;
  sectionPreferences: Record<string, any>;
}
