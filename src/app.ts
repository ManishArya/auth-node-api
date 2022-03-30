import cors from 'cors';
import express from 'express';
import i18n from 'i18n';
import path from 'path';
import errorHandling from './middlewares/error-handling';
import db from './startup/db';
import route from './startup/route';
import logger from './utils/logger';

i18n.configure({
  locales: ['en', 'hi'],
  directory: path.join(__dirname, '/locales')
});

const app = express();

app.use((req, res, next) => {
  const listener = (err: any) => {
    if (!res.headersSent) next(err);
  };
  process.once('unhandledRejection', listener);
  next();
});

app.use((res, req, next) => {
  i18n.init(res, req, next);
  i18n.setLocale(res.getLocale());
});
app.use(express.json());
app.set('view engine', 'ejs');
app.use(cors());
route(app);
db();
app.use(errorHandling);

const port = process.env.PORT || 3000;

app.listen(port, () => logger.info(`App listening on port ${port}!`));

process.on('uncaughtException', (err) => logger.error(err));

export default app;
