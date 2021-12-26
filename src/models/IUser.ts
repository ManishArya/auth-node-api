export default interface IUser {
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
  createdBy: string;
  lastUpdatedBy: string;
  isUserLocked: boolean;
  isPasswordValid: (password: string) => Promise<boolean>;
  isOldPasswordSameAsCurrentPassword: (password: string) => Promise<boolean>;
  updateUserLockedInformation: (isPasswordValid: boolean) => Promise<void>;
}
