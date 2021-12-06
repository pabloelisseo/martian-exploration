import { AppError } from '~/types/error.types';
import { environment } from '~/../environment/environment';
import { isEmpty, isNil, isObject } from 'lodash';
import jwt from 'jsonwebtoken';
import { dbProvider } from './db.provider';
import { DecodedTokenPayload } from '~/types/token.types';

/**
 * Get new auth token and store it in database.
 */
async function getNewToken(payload: DecodedTokenPayload): Promise<Record<string, any>> {
    const { token } = sign(payload);
    const result = await dbProvider.getTokensCollection().insertOne({
        token,
        createdAt: new Date(),
    });
    if (isNil(result.insertedId)) {
        throw {
            httpStatus: 500,
            description: 'Cannot store token.',
            error: new Error('Impossible to store token'),
        } as AppError;
    }
    return { token };
}

/**
 * Sign token.
 */
function sign(payload: DecodedTokenPayload): Record<string, any> {
    if (isEmpty(payload)) {
        throw {
            httpStatus: 413,
            description: 'Payload cannot be null',
            error: new Error('Missing Payload'),
        } as AppError;
    }
    const token: string = jwt.sign(payload, environment.jwt.secret, {
        expiresIn: '8h',
    });

    if (isNil(token)) {
        throw new Error('Generated token is nil');
    }

    return { token };
}

/**
 * Check if token is well-formatted and still valid in database.
 */
async function checkToken(token: string): Promise<DecodedTokenPayload> {
    const tokenDocument = await dbProvider.getTokensCollection().findOne({token});
    if(isNil(tokenDocument)) {
        throw {
            httpStatus: 401,
            description: 'Token already expired.',
            error: new Error('Token expired'),
        } as AppError;
    }
    const payload = verify(token);
    return payload;
}

/**
 * Verify token.
 */
function verify(token: string): DecodedTokenPayload {
    try {
        if (isEmpty(token)) {
            throw {
                httpStatus: 413,
                description: 'Token cannot be null',
                error: new Error('Missing Token'),
            } as AppError;
        }

        const payload: DecodedTokenPayload = jwt.verify(token, environment.jwt.secret) as DecodedTokenPayload;

        if (!isObject(payload)) {
            throw {
                httpStatus: 500,
                description: 'Cannot decode payload',
                error: new Error('Decode payload failed'),
            } as AppError;
        }

        return payload;
    } catch (err) {
        throw {
            httpStatus: 401,
            description: 'Token already expired',
            error: err,
        } as AppError;
    }
}


export const tokenProvider = {
    checkToken,
    getNewToken,
};