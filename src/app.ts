import express from 'express';
import db from './startup/db';
import cors from 'cors';
import logger from './utils/logger';
import route from './startup/route';
const isDevelopment = (process.env.NODE_ENV || 'development') === 'development';
const app = express();
app.use(express.json());
app.set('view engine', 'ejs');
app.use(cors());
route(app);
db();
const port = process.env.PORT || 3000;

app.listen(port, () => {
  const message = `App listening on port ${port}!`;
  isDevelopment ? console.log(message) : logger.info(message);
});

process.on('uncaughtException', (err) => (isDevelopment ? console.error(err) : logger.error(err)));

export default app;
