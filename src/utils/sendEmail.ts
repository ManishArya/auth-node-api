import nodemailer from 'nodemailer';
import config from 'config';

export default async function sendEmail(mailOptions: any) {
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
    ...mailOptions
  });
}
