import mongoose from 'mongoose';
import IBaseSchema from './IBaseSchema';

const roleSchema = new mongoose.Schema<IBaseSchema>({
  name: {
    type: String,
    required: [true, 'name is required'],
    maxLength: [50, 'name cannot exceed 50 characters'],
    trim: true,
    unique: true
  },
  createdBy: { type: String, default: 'admin' },
  lastUpdatedBy: { type: String, default: 'admin' }
});

export default mongoose.model<IBaseSchema>('role', roleSchema);
