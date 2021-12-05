import { Router, Request, Response } from 'express';
import { getApiResponse } from '~/providers/response.provider';
import { robotProvider } from '~/providers/robot.provider';

export const router: Router = Router();

router.post('/robot/move', async (request: Request, response: Response) => {
  const message = await robotProvider.move(request);

  const { status, body } = getApiResponse(message);
  response.status(status).send(body);
});

/**
 * @swagger
 * /profile:
 *   get:
 *     description: Get user's profile (robot) information.
 *     summary: Get robot info.
 *     operationId: "getProfile"
 *     responses:
 *       200:
 *         description: Successfully returned robot info.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *                 
 *     tags:
 *     - private
 */
router.get('/profile', async (request: Request, response: Response) => {
  const message = { status: 'ok' };
  const { status, body } = getApiResponse(message);
  response.status(status).send(body);
});