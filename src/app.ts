import cors from 'cors';
import express from 'express';
import db from './startup/db';
import route from './startup/route';
import logger from './utils/logger';

const app = express();
app.use(express.json());
app.set('view engine', 'ejs');
app.use(cors());
route(app);
db();
const port = process.env.PORT || 3000;

app.listen(port, () => logger.info(`App listening on port ${port}!`));

process.on('uncaughtException', (err) => logger.error(err));

export default app;
