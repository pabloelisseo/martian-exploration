import { get } from 'lodash';
import { Router, Request, Response, NextFunction } from 'express';
import { DecodedTokenPayload } from '~/types/token.types';
import { tokenProvider } from '~/providers/token.provider';

export const router: Router = Router();

/**
 * Verify if the user auth status is valid or not
 */
router.use(async (request: Request, response: Response, next: NextFunction) => {
  try {
    const token: string = request.headers.authorization.split('Bearer').find(t => t !== '').trim();

    const payload: DecodedTokenPayload = await tokenProvider.checkToken(
      token || '',
    );

    request.decodedTokenPayload = payload as DecodedTokenPayload;
    next();
  } catch (error) {
    const httpStatus = get(error, 'httpStatus', 500);
    const description = get(error, 'description', error);

    return response.status(httpStatus).send({error: description});
  }
});