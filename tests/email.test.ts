import chai from 'chai';
import spies from 'chai-spies';
import mailer from 'nodemailer';
import MailOptions from '../src/models/mail-options';
import email from './../src/utils/sendEmail';

const expect = chai.use(spies).expect;

describe('Email Service', () => {
  afterEach(() => {
    chai.spy.restore(mailer);
  });

  it('should call sendMail when user send email', () => {
    const transport = {
      sendMail: () => Promise.resolve({ messageId: 'success' })
    };
    const spy = chai.spy.on(mailer, 'createTransport', () => transport);
    const mailOptions = new MailOptions({ subject: 'mail', to: '', text: '' });
    email(mailOptions);

    expect(spy).to.have.called();
  });
});
