import BaseSchema from './base-schema';

export default interface IPasswordHistorySchema extends BaseSchema {
  username: string;
  password: string;
}
