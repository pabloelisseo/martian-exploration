import { Environment } from '~/../environment/environment.type';
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
        password: process.env.MONGO_INITDB_ROOT_PASSWORD,
        protocol: process.env.DB_PROTOCOL,
        username: process.env.MONGO_INITDB_ROOT_USERNAME,
    },
    crypto: {
        algorithm: process.env.ALGORITHM,
        encryptionKey: process.env.ENCRYPTION_KEY,
        salt: process.env.SALT,
        iv: process.env.IV,
    },
    jwt: {
        secret: process.env.JWT_SECRET,
    },
};
