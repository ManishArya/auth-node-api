import nodemailer from 'nodemailer';
import Config from '../utils/config';
import logger from '../utils/logger';

export default class MailService {
  public to: string = '';
  public subject: string = '';
  public text?: string;

  private readonly _config: Config;

  constructor(config: Config) {
    this._config = config;
  }

  public async send() {
    try {
      const transport = nodemailer.createTransport({
        service: this._config.service,
        host: this._config.mailHost,
        secure: this._config.isMailSecure,
        auth: {
          user: this._config.mailServerAddress,
          pass: this._config.mailPassword
        }
      });

      return await transport.sendMail({
        from: this._config.mailServerAddress,
        to: this.to,
        subject: this.subject,
        text: this.text
      });
    } catch (error) {
      logger.error(error);
      // supress exception
    }
  }
}
