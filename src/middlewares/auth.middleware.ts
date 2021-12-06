import { Router, Request, Response, NextFunction } from 'express';
import { DecodedTokenPayload } from '~/types/token.types';
import { tokenProvider } from '~/providers/token.provider';
import { convertToAppError } from '~/providers/response.provider';
import { Logger } from '~/logger/logger';

export const authMiddleware: Router = Router();

/**
 * Verify if the user auth status is valid or not
 */
authMiddleware.use(async (request: Request, response: Response, next: NextFunction) => {
  try {
    const token: string = request.headers.authorization.split('Bearer').find(t => t !== '').trim();

    const payload: DecodedTokenPayload = await tokenProvider.checkToken(
      token || '',
    );
    Logger.debug(`Robot identified as ${payload.name} : ${payload._id}`);
    request.decodedTokenPayload = payload as DecodedTokenPayload;
    next();
  } catch (err) {
    return convertToAppError(err);
  }
});
