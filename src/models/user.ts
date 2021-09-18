import bcrypt from 'bcrypt';
import mongoose from 'mongoose';
import UserProfile from './user-profile';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'name is required'],
      maxLength: [50, 'name cannot exceed 50 characters'],
      trim: true,
      validate: {
        validator: function (v: string) {
          return /^[A-Za-z\s]*$/.test(v);
        },
        message: 'alphabets and spaces are allowed only !!!'
      }
    },
    email: {
      type: String,
      required: [true, 'email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      validate: {
        validator: function (v: string) {
          return /^[a-zA-Z0-9+_.-]+@[a-zA-Z0-9.-]+$/.test(v);
        },
        message: 'Enter valid email'
      }
    },
    mobile: {
      type: String,
      unique: true,
      validate: {
        validator: function (v: string) {
          return /^(0|91)?[7-9]\d{9}$/.test(v);
        },
        message: 'Enter valid mobile number'
      }
    },
    photo: { type: Buffer },
    username: {
      type: String,
      required: [true, 'username is required'],
      immutable: true,
      unique: true,
      lowercase: true,
      minLength: [4, 'username should be in between 4 to 10 charcters'],
      MaxLength: [10, 'username should be in between 4 to 10 charcters'],
      trim: true
    },
    password: {
      type: String,
      required: [true, 'password is required'],
      validate: {
        validator: function (v: string) {
          return /^(?=.*\d)(?=.*[A-Z])(?=.*[a-z])(?=.*[!@#$%^&*-+]).{6,15}$/.test(v);
        },
        message:
          'Password should have at least 1 digit 1 upper case 1 lower case and 1 special characters and length should between 6 to 15'
      }
    },
    isAdmin: { type: Boolean, default: false },
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

userSchema.pre('save', async function (next) {
  const self = this as any;
  self.createdBy = self.username?.toLowerCase();
  self.lastUpdatedBy = self.createdBy;
  if (self.isModified('password')) {
    const password = self.password;
    self.password = await bcrypt.hash(password, 10);
  }
  next();
});

export default mongoose.model('user', userSchema);
