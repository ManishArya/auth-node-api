import mongoose from 'mongoose';
import IEmailSechema from './interfaces/email-schema';

const emailSchema = new mongoose.Schema<IEmailSechema>(
  {
    subject: String,
    body: String,
    from: String,
    to: String
  },
  {
    timestamps: true
  }
);

export default mongoose.model<IEmailSechema>('email', emailSchema);
