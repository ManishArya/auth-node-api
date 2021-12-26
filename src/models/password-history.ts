import mongoose from 'mongoose';

const passwordHistorySchema = new mongoose.Schema(
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

export default mongoose.model('password-history', passwordHistorySchema);
