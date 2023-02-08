import { Request } from 'express';
import { isNil } from 'lodash';
import { ICreatePlanetInput, IPlanet, IPosition } from '~/types/planet.types';
import { dbProvider } from '~/providers/db.provider';
import { convertToAppError } from '~/providers/response.provider';
import { AppError } from '~/types/error.types';
import { Logger } from '~/lib/logger';

export async function create(
    request: Request,
): Promise<Record<string, any>> {
    try {
        const { name, upperCoordinates } = request.body as ICreatePlanetInput;
        // Check fields
        if (isNil(upperCoordinates) || isNil(name)) {
            throw {
                httpStatus: 403,
                description: 'Name and upperCoordinates are non optional parameters',
                error: new Error('Missing parameters'),
            } as AppError;
        }

        const planet = await dbProvider.getPlanetsCollection().findOne({ name });
        if (!isNil(planet)) {
            throw {
                httpStatus: 403,
                description: 'Planet name already registered',
                error: new Error('Planet alredy registered.'),
            } as AppError;
        }

        const result = await dbProvider.getPlanetsCollection().insertOne(
      {
          name: name,
          lowerCoordinates: { x: 0, y: 0 } as IPosition,
          upperCoordinates: upperCoordinates,
          createdAt: new Date(),
          lastModifiedAt: new Date(),

      } as IPlanet,
        );
        Logger.info(`Created planet ${name} with _id ${result.insertedId.toHexString()}`);

        return { message: 'Planet successfully created' };
    } catch (err) {
        return convertToAppError(err);
    }
}

export const planetProvider = {
    create,
};