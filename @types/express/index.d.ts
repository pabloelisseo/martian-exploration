import { DecodedTokenPayload } from '~/types/token.types';

declare global {
  namespace Express {
    interface Request {
      decodedTokenPayload: DecodedTokenPayload;
    }
  }
}