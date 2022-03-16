import mongoose from 'mongoose';
import IPrefrencesSchema from './IPreferences-schema';
const preferencesSchema = new mongoose.Schema<IPrefrencesSchema>(
  {
    username: {
      type: String,
      required: true
    },
    sectionName: {
      type: String,
      required: true
    },
    value: {
      type: String
    },
    createdBy: { type: String, default: 'admin' },
    lastUpdatedBy: { type: String, default: 'admin' }
  },
  {
    timestamps: true
  }
);

export default mongoose.model<IPrefrencesSchema>('perference', preferencesSchema);
