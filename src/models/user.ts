import mongoose from 'mongoose';
import UserProfile from './user-profile';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, maxLength: 50, trim: true, match: /^[A-Za-z\s]*$/ },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: /^[a-zA-Z0-9+_.-]+@[a-zA-Z0-9.-]+$/
    },
    mobile: { type: String, unique: true, match: /^(0|91)?[7-9]\d{9}$/ },
    photo: { type: Buffer },
    username: {
      type: String,
      required: true,
      immutable: true,
      unique: true,
      lowercase: true,
      minLength: 4,
      MaxLength: 10,
      trim: true
    },
    password: { type: String },
    createdBy: { type: String, default: 'admin' },
    lastUpdatedBy: { type: String, default: 'admin' }
  },
  {
    timestamps: true,
    toObject: {
      transform: function (doc: any, ret: any) {
        return new UserProfile(ret);
      }
    }
  }
);

export default mongoose.model('user', userSchema);
