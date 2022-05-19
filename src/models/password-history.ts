import mongoose from 'mongoose';
import IPasswordHistorySchema from './IPasswordHistorySchema';

const passwordHistorySchema = new mongoose.Schema<IPasswordHistorySchema>(
  {
    username: {
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
