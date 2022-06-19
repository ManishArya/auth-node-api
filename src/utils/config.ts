import config from 'config';

export default class Config {
  public get service(): string {
    return config.get('mail.service') as string;
  }

  public get mailHost(): string {
    return config.get('mail.host') as string;
  }

  public get isMailSecure(): boolean {
    return config.get('mail.secure');
  }

  public get mailPassword() {
    return process.env.mail_server_password;
  }

  public get mailServerAddress() {
    return process.env.mail_server_address;
  }
}
