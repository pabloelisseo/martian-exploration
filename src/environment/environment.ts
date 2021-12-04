import { Environment } from '~/environment/environment.type';
import { toNumber } from 'lodash';

export const environment: Environment = {
  autoInstance: true,
  api: {
    port: toNumber(process.env.API_PORT),
    xApiKey: process.env.API_KEY,
  },
  db: {
    db: process.env.DB_NAME,
    host: process.env.DB_HOST,
    password: process.env.DB_PASSWORD,
    protocol: process.env.DB_PROTOCOL,
    username: process.env.DB_USERNAME,
    options: {
      authSource: process.env.DB_OPTIONS_AUTH_SOURCE,
      retryWrites: process.env.DB_OPTIONS_RETRY_WRITES === 'true',
      w: process.env.DB_OPTIONS_W,
    },
  },
};
