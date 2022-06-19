import mongoose from 'mongoose';
import BaseSchema from './interfaces/base-schema';
import Permission from './permission';

const roleSchema = new mongoose.Schema<BaseSchema>(
  {
    name: {
      type: String,
      required: [true, 'name is required'],
      maxLength: [50, 'name cannot exceed 50 characters'],
      trim: true,
      unique: true
    },
    perms: [{ type: mongoose.Schema.Types.ObjectId, ref: Permission }],
    createdBy: { type: String, default: 'admin' },
    lastUpdatedBy: { type: String, default: 'admin' }
  },
  { timestamps: true }
);

export default mongoose.model<BaseSchema>('role', roleSchema);
