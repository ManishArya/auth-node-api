import { Model } from 'mongoose';
import IUser from '../models/IUser';
import User from '../models/user';
import { QueryDAL } from './query.dal';

export default class UserDal extends QueryDAL<IUser> {
  protected DBSchema: Model<IUser, {}, {}> = User;
}
