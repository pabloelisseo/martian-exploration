import { Request } from 'express';
import Debug from 'debug';
import { isNil } from 'lodash';
import { ICreatePlanetInput, IPlanet, IPosition } from '~/types/planet.types';
import { dbProvider } from '~/providers/db.provider';
import { convertToAppError } from '~/providers/response.provider';
import { AppError } from '~/types/error.types';

const debug = Debug('martian-exploration:planet');

export async function create(
  request: Request,
): Promise<Record<string, any>> {
  try {
    const { name, upperCoordinates } = request.body as ICreatePlanetInput;

    // Check fields
    if (isNil(upperCoordinates) || isNil(name)){
      throw {
        httpStatus: 413,
        description: 'Name and upperCoordinates are non optional parameters',
        error: new Error('Missing parameters'),
      } as AppError;    
    }

    // Create Planet, lower coordinates are always 0,0
    const planet: IPlanet = {
      name : name,
      lowerCoordinates: {x: 0, y: 0} as IPosition,
      upperCoordinates: upperCoordinates,
      createdAt: new Date(),
      lastModifiedAt: new Date(),
    };

    const result = await dbProvider.getPlanetsCollection().insertOne(planet);
    debug(`Created planet ${name} with _id ${result.insertedId.toHexString()}`);
    
    return {message: 'Planet successfully created'};
  } catch (err) {
    debug(`${err}`);
    return convertToAppError(err);
  }
}

export const planetProvider = {
  create,
};