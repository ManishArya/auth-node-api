import mongoose from 'mongoose';
import { AddressType } from '../enums/address-type';
import { isAlphaAndSpace, isMobileNumber, isPincode } from '../utils/mongoose-validator';
import IAddressSchema from './interfaces/address-schema';

const addressSchema = new mongoose.Schema<IAddressSchema>(
  {
    userId: {
      type: String,
      required: true
    },
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
    mobileNumber: {
      type: String,
      required: [true, 'mobile number is required'],
      validate: {
        validator: isMobileNumber,
        message: 'enter valid mobile number'
      }
    },
    city: {
      type: String,
      required: [true, 'city is required'],
      maxLength: [20, 'city cannot exceed 20 characters']
    },
    state: {
      type: String,
      required: [true, 'state is required'],
      maxLength: [20, 'state cannot exceed 20 characters']
    },
    pincode: {
      type: String,
      required: [true, 'pincode is required'],
      validate: {
        validator: isPincode,
        message: 'enter valid pincode'
      }
    },
    area: {
      type: String,
      required: [true, 'area is required'],
      maxLength: [100, 'area cannot exceed 100 characters']
    },
    street: {
      type: String,
      required: [true, 'street is required'],
      maxLength: [50, 'street cannot exceed 50 characters']
    },
    landmark: String,
    default: Boolean,
    addressType: {
      type: String,
      required: [true, 'addressType is required'],
      enum: {
        values: Object.values(AddressType),
        message: 'enter provie valid address Type'
      }
    },
    country: {
      type: String,
      default: 'India'
    }
  },
  {
    timestamps: true
  }
);

export default mongoose.model<IAddressSchema>('address', addressSchema);
