import pino from 'pino';
import { createApp } from './app.js';

const logger = pino({ level: process.env.LOG_LEVEL || 'info' });
const app = createApp();

const port = Number(process.env.PORT) || 4000;
app.listen(port, () => {
  logger.info({ port, env: process.env.NODE_ENV }, 'Backend server listening');
});
