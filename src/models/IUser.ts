import IBaseSchema from './IBaseSchema';

export default interface IUser extends IBaseSchema {
  name: string;
  email: string;
  mobile: string;
  photo: Buffer;
  username: string;
  password: string;
  isAdmin: boolean;
  hasLocked: boolean;
  failureAttempt: number;
  lockedAt: Date | null;
  isUserLocked: boolean;
  roles: [];
  isPasswordValid: (password: string) => Promise<boolean>;
  isOldPasswordAndCurrentPasswordMatch: (password: string) => Promise<boolean>;
  updateUserLockedInformation: (isPasswordValid: boolean) => Promise<void>;
}
