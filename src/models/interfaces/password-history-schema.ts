import BaseSchema from './base-schema';

export default interface IPasswordHistorySchema extends BaseSchema {
  userId: string;
  password: string;
}
