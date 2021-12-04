import { Router, Request, Response } from 'express';
import { planetProvider } from '~/providers/planet.provider';
import { getApiResponse } from '~/providers/response.provider';

export const router: Router = Router();


router.post('/planet', async (request: Request, response: Response) => {
  const message = await planetProvider.create(request);

  const { status, body } = getApiResponse(message);
  response.status(status).send(body);
});

/**
 * @swagger
 * /status:
 *   get:
 *     description: Get server's status.
 *     summary: Get status.
 *     operationId: "getStatus"
 *     responses:
 *       200:
 *         description: Server OK.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 *                 
 *     tags:
 *     - status
 */
router.get('/status', async (request: Request, response: Response) => {
  const message = { status: 'ok' };
  const { status, body } = getApiResponse(message);
  response.status(status).send(body);
});