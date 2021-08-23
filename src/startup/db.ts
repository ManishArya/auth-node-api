import { connect } from 'mongoose';
import config from 'config';

export default function () {
  const isProduction = (process.env.NODE_ENV || 'development') === 'production';
  let connectionString = config.get('db.connectionString') as string;
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
  }).then(() => console.log('connected to db'));
}
