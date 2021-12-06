import { Router, Request, Response } from 'express';
import { planetProvider } from '~/providers/planet.provider';
import { getApiResponse } from '~/providers/response.provider';
import { robotProvider } from '~/providers/robot.provider';

export const router: Router = Router();

/**
 * @swagger
 * /robot/login:
 *   post:
 *     description: Log in as robot and get auth token.
 *     summary: Login as robot.
 *     operationId: "login"
 *     requestBody:
 *       description: Robot's login information
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Loged in.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *              
 *                 
 *     tags:
 *     - public
 */
router.post('/robot/login', async (request: Request, response: Response) => {
    const message = await robotProvider.login(request);

    const { status, body } = getApiResponse(message);
    response.status(status).send(body);
});

/**
 * @swagger
 * /robot:
 *   post:
 *     description: Create robot and get auth token.
 *     summary: Create robot.
 *     operationId: "createRobot"
 *     requestBody:
 *       description: Robot's information
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               password:
 *                 type: string
 *               orientation:
 *                 type: string
 *               position:
 *                 type: object
 *                 properties:
 *                   x:
 *                     type: number
 *                   y:
 *                     type: number
 *               planetName:
 *                 type: string
 *     responses:
 *       200:
 *         description: Created robot.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                 
 *     tags:
 *     - public
 */
router.post('/robot', async (request: Request, response: Response) => {
    const message = await robotProvider.create(request);

    const { status, body } = getApiResponse(message);
    response.status(status).send(body);
});

/**
 * @swagger
 * /planet:
 *   post:
 *     description: Create planet.
 *     summary: Create planet.
 *     operationId: "createPlanet"
 *     requestBody:
 *       description: Planet information
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               upperCoordinates:
 *                 type: object
 *                 properties:
 *                   x:
 *                     type: number
 *                   y:
 *                     type: number
 *     responses:
 *       200:
 *         description: Created planet.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 massage:
 *                   type: string
 *                   example: Planet successfully created
 *              
 *                 
 *     tags:
 *     - private
 */
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