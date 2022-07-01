import QueryDAL from '../data-access/query.dal';
import IEmailSechema from '../models/interfaces/email-schema';
import logger from '../utils/logger';

export default class MailService {
  public to: string = '';
  public subject: string = '';
  public text?: string;

  private readonly _emailDAL: QueryDAL<IEmailSechema>;

  constructor(mailDAL: QueryDAL<IEmailSechema>) {
    this._emailDAL = mailDAL;
  }

  public async send() {
    try {
      await this._emailDAL.saveRecord({
        to: this.to,
        subject: this.subject,
        body: this.text,
        from: process.env.mail_server_address
      });
    } catch (error) {
      logger.error(error);
      // supress exception
    }
  }
}
