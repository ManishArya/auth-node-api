import BaseSchema from './base-schema';
import Role from './Role';

export default interface IUserSchema extends BaseSchema {
  name: string;
  email: string;
  mobile: string;
  avatar: Buffer;
  username: string;
  password: string;
  isAdmin: boolean;
  hasLocked: boolean;
  failureAttempt: number;
  lockedAt: Date | null;
  isUserLocked: boolean;
  roles: Role[];
  isPasswordValid: (password: string) => Promise<boolean>;
  isOldPasswordAndCurrentPasswordMatch: (password: string) => Promise<boolean>;
  updateUserLockedInformation: (isPasswordValid: boolean) => Promise<void>;
}
