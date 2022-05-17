import IBaseSchema from './IBaseSchema';

export default interface IPasswordHistorySchema extends IBaseSchema {
  username: string;
  password: string;
}
