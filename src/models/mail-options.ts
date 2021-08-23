export default class MailOptions {
  private to: string;
  private subject: string;
  private text: string;
  constructor(option: any) {
    this.to = option.to;
    this.subject = option.subject;
    this.text = option.text;
  }
}
