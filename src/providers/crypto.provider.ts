import crypto from 'crypto';
import { isEmpty } from 'lodash';
import { environment } from '~/../environment/environment';
import { ICryptoConfig } from '~/types/crypto.types';

export const config: ICryptoConfig = {
    algorithm: environment.crypto.algorithm,
    salt: environment.crypto.salt,
    encryptionKey: environment.crypto.encryptionKey,
    iv: isEmpty(environment.crypto.iv) ? null: Buffer.from(environment.crypto.iv.slice(0, 8), 'utf8'),
};

function decrypt(token: string): string {

    // Validate missing token
    if (!token) {
        throw Error('A token is required!');
    }
    const decipher = crypto.createDecipheriv(config.algorithm, config.encryptionKey, config.iv);
    const buffer = Buffer.from(token, 'base64').toString('hex');

    const firstPart = decipher.update(buffer, 'hex', 'base64');
    const finalPart = decipher.final('base64') || '';

    // concat both parts
    const decrypted = `${firstPart}${finalPart}`;

    // Encode decrypted value as a 64-bit Buffer
    const buf = Buffer.from(decrypted, 'base64');

    return buf.toString('utf8');
}

function encrypt(value: string): string {
    // Validate missing value
    if (!value) {
        throw Error('A value is required!');
    }
    const cipher = crypto.createCipheriv(config.algorithm, config.encryptionKey, config.iv);
    const buffer = Buffer.from(value, 'utf8').toString('binary');

    const firstPart = cipher.update(buffer, 'binary', 'base64');
    const finalPart = cipher.final('base64');

    // concat and return both parts
    return `${firstPart}${finalPart}`;
}

export const cryptoProvider = {
    encrypt,
    decrypt,
};

