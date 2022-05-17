import IBaseSchema from './IBaseSchema';

export default interface IPrefrencesSchema extends IBaseSchema {
  username: string;
  sectionName: string;
  value: string;
}
