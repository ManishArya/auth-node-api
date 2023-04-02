import BaseSchema from './base-schema';
import Role from './role-schema';

export default interface IUserSchema extends BaseSchema {
  name: string;
  email: string;
  mobile: string;
  avatar: Buffer;
  password: string;
  isAdmin: boolean;
  hasLocked: boolean;
  failureAttempt: number;
  lockedAt: Date | null;
  isUserLocked: boolean;
  roles: Role[];
  isPasswordValidAsync: (password: string) => Promise<boolean>;
  isOldAndCurrentPasswordSameAsync: (password: string) => Promise<boolean>;
  updateUserLockedInformationAsync: (isPasswordValid: boolean) => Promise<void>;
}
