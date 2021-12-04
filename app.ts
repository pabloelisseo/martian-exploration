import * as dotenv from 'dotenv';
dotenv.config();

import { environment } from '~/environment/environment';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUiExpress, { SwaggerOptions } from 'swagger-ui-express';
import cors from 'cors';
import express, { Express, json } from 'express';
import Debug from 'debug';
import { dbProvider } from '~/providers/db.provider';
import { router as infoMiddleware } from '~/middlewares/info.middleware';
import { router as publicRouter } from '~/router/public.router';




const debug = Debug('martian-exploration:app');

// Setup REST server
export const app: Express = express();


const swaggerOptions: SwaggerOptions = {
  swaggerDefinition: {
    openapi: '3.0.1',
    info: {
      title: 'Martian robots - Mars exploration REST API',
      description: 'Backend for a Mars exploration experience with robots.',
      contact: {
        name: 'Pablo Eliseo',
        url: 'https://github.com/pabloelisseo',
      },
    },
    servers: [
      // {
      //   url: 'https://',
      //   description: 'Production',
      // },
      {
        url: `http://localhost:${environment.api.port}`,
        description: 'Development',
      },
    ],
  },
  apis: [
    '**/*.ts',
  ],
};
const swaggerDocs = swaggerJsdoc(swaggerOptions);

app.use('/api-docs', swaggerUiExpress.serve, swaggerUiExpress.setup(swaggerDocs));
app.use(cors());
app.use(json());
app.use(infoMiddleware);
app.use('/', publicRouter);


export async function instance(): Promise<void> {
  await dbProvider.instance(environment.db);
}

export async function closeInstance(): Promise<void> {
  await dbProvider.disconnectInstance();
}

(async () => {
  try {
    if (environment.autoInstance) {
      await instance();

      app.listen(environment.api.port, (): void => {
        debug(`App listening at http://localhost:${environment.api.port}`);
      });
    }
  }
  catch (error){
    debug(`${error}`);
    closeInstance();
  }
})();
