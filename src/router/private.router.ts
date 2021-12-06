import { Router, Request, Response } from 'express';
import { getApiResponse } from '~/providers/response.provider';
import { robotProvider } from '~/providers/robot.provider';

export const router: Router = Router();

/**
 * @swagger
 * /robot/move:
 *   post:
 *     security:
 *     - bearerAuth: []
 *     description: Send instructions to the robot for it to move.
 *     summary: Move robot.
 *     operationId: "moveRobot"
 *     requestBody:
 *       description: Robot's instructions, L R or F.
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: array
 *             items:
 *               type: string
 *               example: [ "L", "R" ]
 *     responses:
 *       200:
 *         description: Successfully moved.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *                 
 *     tags:
 *     - private
 */
router.post('/robot/move', async (request: Request, response: Response) => {
    const message = await robotProvider.move(request);

    const { status, body } = getApiResponse(message);
    response.status(status).send(body);
});
