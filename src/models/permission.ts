import mongoose from 'mongoose';
import BaseSchema from './interfaces/base-schema';

const permissionSchema = new mongoose.Schema<BaseSchema>(
  {
    _id: {
      type: String
    },
    value: {
      type: Number,
      required: [true, 'value is required'],
      unique: true
    },
    createdBy: { type: String, default: 'admin' },
    lastUpdatedBy: { type: String, default: 'admin' }
  },
  {
    timestamps: true
  }
);

export default mongoose.model<BaseSchema>('permission', permissionSchema);
