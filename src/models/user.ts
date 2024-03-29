import bcrypt from 'bcrypt';
import config from 'config';
import moment from 'moment';
import mongoose from 'mongoose';
import { isAlphaAndSpace, isEmail, isMobileNumber } from '../utils/mongoose-validator';
import IUserSchema from './interfaces/user-schema';
import Role from './role';
import UserProfile from './user-profile';

const userSchema = new mongoose.Schema<IUserSchema>(
  {
    name: {
      type: String,
      required: [true, 'name is required'],
      maxLength: [50, 'name cannot exceed 50 characters'],
      trim: true,
      validate: {
        validator: isAlphaAndSpace,
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
        validator: isEmail,
        message: 'Enter valid email'
      }
    },
    mobile: {
      type: String,
      validate: {
        validator: isMobileNumber,
        message: 'Enter valid mobile number'
      }
    },
    avatar: { type: Buffer },
    password: {
      type: String,
      required: [true, 'password is required  '],
      validate: {
        validator: function (v: string) {
          return /^(?=.*\d)(?=.*[A-Z])(?=.*[a-z])(?=.*[!@#$%^&*-+]).{6,15}$/.test(v);
        },
        message:
          'Password should have at least 1 digit 1 upper case 1 lower case and 1 special characters and length should between 6 to 15'
      }
    },
    isAdmin: { type: Boolean, default: false },
    roles: [{ type: mongoose.Schema.Types.ObjectId, ref: Role }],
    hasLocked: { type: Boolean, default: false },
    failureAttempt: { type: Number, default: 0 },
    lockedAt: { type: Date },
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

//#region  METHODS

userSchema.methods.updateUserLockedInformationAsync = async function (isPasswordValid: boolean) {
  let count = this.failureAttempt;
  this.failureAttempt = isPasswordValid ? 0 : count + 1;
  this.lockedAt = isPasswordValid ? null : new Date();
  await this.save({ validateBeforeSave: false });
};

userSchema.methods.isOldAndCurrentPasswordSameAsync = async function (userInputPassword: string) {
  return await bcrypt.compare(userInputPassword, this.password);
};

userSchema.methods.isPasswordValidAsync = async function (userInputPassword: string) {
  if (userInputPassword) {
    return await bcrypt.compare(userInputPassword, this.password);
  }
  return Promise.resolve(false);
};

//#endregion

//#region VIRTUALS

userSchema.virtual('isUserLocked').get(function (this: any) {
  const lockedAt = this.lockedAt as Date;
  const lockedAtInLocal = moment.utc(lockedAt).local();
  const lockedPeriod = getLockedPeriod();
  const lockedTimeout = lockedAtInLocal.add(lockedPeriod, 'milliseconds');
  const isLockedTimeoutAfterCurrentTime = lockedTimeout.isAfter(moment());
  const failureAttempt = this.failureAttempt;
  const loginAttemptBeforeLocked = config.get('loginAttemptBeforeLockedOut') as number;
  const isAttemptPass = failureAttempt >= loginAttemptBeforeLocked;
  return isAttemptPass && isLockedTimeoutAfterCurrentTime;
});

//#endregion

//#region PRE MIDDLEWARE

userSchema.pre('save', async function (next) {
  const self = this as any;
  self.createdBy = self._id?.toString()?.toLowerCase();
  self.lastUpdatedBy = self.createdBy;

  if (self.isNew) {
    self.roles.push({ name: 'user', _id: '62a0a21fb12ff26ed28e6874' });
  }

  if (self.isModified('password')) {
    const password = self.password;
    self.password = await bcrypt.hash(password, 10);
  }
  next();
});

//#endregion

//#region  HELPER FUNCTIONS

function getLockedPeriod() {
  const period = config.get('lockedPeriod') as number;
  if (period <= 0) {
    return 600000;
  }
  return period;
}

//#endregion

export default mongoose.model<IUserSchema>('user', userSchema);
