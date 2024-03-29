import cors from 'cors';
import express from 'express';
import 'express-async-errors';
import i18n from 'i18n';
import path from 'path';
import genericErrorHandler from './middlewares/errors/generic-error-handler';
import logHandler from './middlewares/errors/log-handler';
import validationHandler from './middlewares/errors/validation-handler';
import db from './startup/db';
import registerDependency from './startup/DI';
import route from './startup/route';
import logger from './utils/logger';

i18n.configure({
  locales: ['en', 'hi'],
  directory: path.join(__dirname, '/locales'),
  api: {
    __: 'translate',
    __mf: 'translateFormatter'
  }
});

const container = registerDependency();

const app = express();

app.use((req, res, next) => {
  req.scope = container.createScope();
  next();
});

app.use((req, res, next) => {
  i18n.init(req, res, next);
  i18n.setLocale(req.getLocale());
});

app.use(express.json());
app.set('view engine', 'ejs');
app.use(cors());
route(app);
db();
app.use(logHandler);
app.use(validationHandler);
app.use(genericErrorHandler);

const port = process.env.PORT || 3000;

app.listen(port, () => logger.info(`App listening on port ${port}!`));

const callbackFunction = (err: any) => {
  logger.error(err);
  process.kill(process.pid);
  process.exit(1);
};

process.on('uncaughtException', callbackFunction);

export default app;
