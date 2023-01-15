import mongoose from 'mongoose';
import IPrefrencesSchema from './interfaces/preferences-schema';

const preferencesSchema = new mongoose.Schema<IPrefrencesSchema>(
  {
    userId: {
      type: String,
      required: true
    },
    sectionName: {
      type: String,
      required: true
    },
    sectionPreferences: {
      type: Object
    },
    createdBy: { type: String, default: 'admin' },
    lastUpdatedBy: { type: String, default: 'admin' }
  },
  {
    timestamps: true
  }
);

export default mongoose.model<IPrefrencesSchema>('Preferences', preferencesSchema);
