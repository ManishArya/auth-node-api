import config from 'config';
import nodemailer from 'nodemailer';
import logger from './logger';

export class Mail {
  private to: string;
  private subject: string;
  private text?: string;
  constructor(option: IMailOption) {
    this.to = option.to;
    this.subject = option.subject;
    this.text = option.text;
  }

  public async send() {
    try {
      const transport = nodemailer.createTransport({
        service: config.get('mail.service') as string,
        host: config.get('mail.host') as string,
        secure: config.get('mail.secure'),
        auth: {
          user: process.env.mail_server_address,
          pass: process.env.mail_server_password
        }
      });

      return await transport.sendMail({
        from: process.env.mail_server_address,
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

export interface IMailOption {
  to: string;
  subject: string;
  text?: string;
}
