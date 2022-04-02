import config from 'config';
import { connect } from 'mongoose';
import logger from '../utils/logger';

export default function () {
  let connectionString = config.get('db.connectionString') as string;
  const isProduction = (process.env.NODE_ENV || 'development') === 'production';
  if (isProduction) {
    connectionString = connectionString.replace(
      'username:password',
      `${process.env.db_username}:${process.env.db_password}`
    );
  }
  connect(connectionString, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false
  }).then(() => logger.info('connected to db'));
}
