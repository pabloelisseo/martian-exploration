import Debug from 'debug';
import { Router, Request, Response, NextFunction } from 'express';
export const router: Router = Router();
const debug = Debug('martian-exploration:middleware:info');

/**
 * Verify if the user auth status is valid or not
 */
router.use(async (request: Request, _response: Response, next: NextFunction) => {
  debug(
    `New request ${request.method} to ${request.path}`,
  );
  next();
});
