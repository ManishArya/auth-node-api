import mongoose from 'mongoose';
import IPasswordHistorySchema from './interfaces/password-history-schema';

const passwordHistorySchema = new mongoose.Schema<IPasswordHistorySchema>(
  {
    userId: {
      type: String
    },
    password: {
      type: String
    }
  },
  {
    timestamps: true
  }
);

export default mongoose.model<IPasswordHistorySchema>('password-history', passwordHistorySchema);
