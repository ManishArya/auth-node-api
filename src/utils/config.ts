import config from 'config';

export default class Config {
  public get Service(): string {
    return config.get('mail.service') as string;
  }

  public get MailHost(): string {
    return config.get('mail.host') as string;
  }

  public get IsMailSecure(): boolean {
    return config.get('mail.secure');
  }

  public get MailPassword() {
    return process.env.mail_server_password;
  }

  public get MailServerAddress() {
    return process.env.mail_server_address;
  }
}
