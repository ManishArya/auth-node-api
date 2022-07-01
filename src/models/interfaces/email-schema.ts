import BaseSchema from './base-schema';

export default interface IEmailSechema extends BaseSchema {
  subject: string;
  body: string;
  from: string;
  to: string;
}
