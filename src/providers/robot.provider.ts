import { Request } from 'express';
import Debug from 'debug';
import { get, isNil } from 'lodash';
import { dbProvider } from './db.provider';
import { cryptoProvider } from './crypto.provider';
import { AuthProvider } from './auth.provider';
import { convertToAppError } from '~/providers/response.provider';
import { AppError } from '~/types/error.types';
import { ICreateRobotInput, IInstructions, IRobot } from '~/types/robot.types';
import { IPlanet, IPosition } from '~/types/planet.types';
import { tokenProvider } from './token.provider';
import { DecodedTokenPayload } from '~/types/token.types';
import { ObjectId } from 'mongodb';
const debug = Debug('martian-exploration:planet');


// It's similar as a sign up
async function create(
  request: Request,
): Promise<Record<string, any>> {
  try {
    const { name, password, orientation, position, planetName } = request.body as ICreateRobotInput;

    // Check required fields
    if (isNil(name) || isNil(password) || isNil(orientation) || isNil(position)) {
      throw {
        httpStatus: 413,
        description: 'Name, password, orientation and position are non optional parameters.',
        error: new Error('Missing parameters'),
      } as AppError;
    }
    // If planet is empty, use the last created planet
    let planetDocument: IPlanet;
    if (isNil(planetName)) {
      planetDocument = await dbProvider.getPlanetsCollection().find({}, { projection: { lastModifiedAt: 1, _id: 0 } }).sort({ lastModifiedAt: -1 }).limit(1).toArray()[0];
    } else {
      planetDocument = await dbProvider.getPlanetsCollection().findOne({ name: planetName });
    }
    const planetId = planetDocument._id;

    // Check if robot's initial position is within the planet grid
    if (position.x > planetDocument.upperCoordinates.x
      || position.y > planetDocument.upperCoordinates.y
      || position.x < planetDocument.lowerCoordinates.x
      || position.y < planetDocument.lowerCoordinates.y) {
      throw {
        httpStatus: 413,
        description: `Robot's initial position (${position.x}, ${position.y}) outside the planet grid.`,
        error: new Error('Missing parameters'),
      } as AppError;
    }

    // Encrypt password
    const encryptedPassword = cryptoProvider.encrypt(password);

    const result = await dbProvider.getRobotsCollection().insertOne({
      name,
      password: encryptedPassword,
      planetId,
      orientation,
      position,
    } as IRobot);
    debug(`Created robot ${name} with _id ${result.insertedId.toHexString()}`);

    const { token } = await tokenProvider.getNewToken(
      {
        _id: result.insertedId.toHexString(),
        name,
      } as DecodedTokenPayload,
    );

    return { token };
  } catch (err) {
    debug(`${err}`);
    return convertToAppError(err);
  }
}


/**
 * Robot login.
 */
async function login(
  request: Request,
): Promise<Record<string, any>> {
  try {
    // Robot credentials
    const { name, password } = request.body;

    if (isNil(name) || isNil(password)) {
      throw {
        httpStatus: 413,
        description: 'Name and password are non optional parameters',
        error: new Error('Missing parameters'),
      } as AppError;
    }

    // If the db user does not exists, we need to check it
    // const dbUser: IUser = await UserSchema.findOne({ email });
    const robot: IRobot = await dbProvider.getRobotsCollection().findOne({ name });

    // If the email or password are not valid we throw an authorization error
    if (
      !get(robot, 'password', null) ||
      !isValidCredentials(password, robot.password)
    ) {
      throw AuthProvider.getNonValidCredentialsErrorMessage();
    }
    const payload: DecodedTokenPayload = {
      _id: robot._id.toHexString(),
      name: robot.name,
    };

    // If we are here is because the credentials are valid
    const { token } = await tokenProvider.getNewToken(
      payload,
    );

    debug(`Login success for ${name}`);
    return { token };

  } catch (error) {
    return convertToAppError(error);
  }
}

/**
 * It compares if both passwords are the same.
 * It is possible because the db password is decrypted inside of this function.
 */
function isValidCredentials(
  password: string,
  dbPassword: string,
): boolean {
  const dbPasswordDecrypted: string = cryptoProvider.decrypt(dbPassword);
  return password === dbPasswordDecrypted;
}

/**
 * Moves the robot.
 */
async function move(
  request: Request,
): Promise<Record<string, any>> {
  try {
    const { _id } = request.decodedTokenPayload;
    const robotId = new ObjectId(_id);

    // We need to know the planet where the robot is
    // But first we need robot's document to search for planetId
    const robot = await dbProvider.getRobotsCollection().findOne({ _id: robotId });
    if (isNil(robot)) {
      throw {
        httpStatus: 413,
        description: 'Wrong robot _id',
        error: new Error('Wrong robot _id'),
      } as AppError;
    }
    if (robot.lost) {
      throw {
        httpStatus: 413,
        description: 'Cannot connect to robot. We have lost it.',
        error: new Error('Robot lost'),
      } as AppError;
    }
    const planet = await dbProvider.getPlanetsCollection().findOne({ _id: robot.planetId });
    if (isNil(planet)) {
      throw {
        httpStatus: 500,
        description: 'Planet not found.',
        error: new Error('Missing planet'),
      } as AppError;
    }
    const { instructions } = request.body as IInstructions;

    let position: IPosition;
    let orientation: 'N'|'S'|'E'|'W';
    let lost = false;

    for (const instruction of instructions) {
      // Copy values, not reference
      const pastPosition: IPosition = {
        x: robot.position.x,
        y: robot.position.y,
      };

      calculateNewPosition(instruction, robot);
      if (isNil(planet.limits)) {
        planet.limits = [];
      }
      // If a robot has reach that limit before, ours mustn't get lost
      if (planet.limits.find(p => p.x === robot.position.x && p.y === robot.position.y)) {
        position = pastPosition;
        orientation = robot.orientation;
        break;
      }
      // If is outside the planet's grid, the robot get lost
      if (isBeyondLimits(robot, planet)) {
        robot.lost = lost = true;
        // Write the limit for following robots
        planet.limits.push(robot.position);
        await dbProvider.getPlanetsCollection().updateOne({ _id: planet._id }, {
          $set: { limits: planet.limits },
        });
      }

      await dbProvider.getRobotsCollection().updateOne({ _id: robotId }, {
        $set: robot,
      });
      position = robot.position;
      orientation = robot.orientation;
    }

    return { position, orientation, lost };

  } catch (err) {
    debug(`${err}`);
    return convertToAppError(err);
  }
}

function isBeyondLimits(robot: IRobot, planet: IPlanet): boolean {
  return (robot.position.x > planet.upperCoordinates.x ||
    robot.position.x < planet.lowerCoordinates.x ||
    robot.position.y > planet.upperCoordinates.y ||
    robot.position.y < planet.lowerCoordinates.y);
}

function calculateNewPosition(instruction: 'L' | 'R' | 'F', robot: IRobot) {
  switch (instruction) {
  case 'L':  // Turn left
    if (robot.orientation === 'N') { robot.orientation = 'W'; }
    else if (robot.orientation === 'W') { robot.orientation = 'S'; }
    else if (robot.orientation === 'S') { robot.orientation = 'E'; }
    else if (robot.orientation === 'E') { robot.orientation = 'N'; }
    break;
  case 'R':  // Turn right
    if (robot.orientation === 'N') { robot.orientation = 'E'; }
    else if (robot.orientation === 'E') { robot.orientation = 'S'; }
    else if (robot.orientation === 'S') { robot.orientation = 'W'; }
    else if (robot.orientation === 'W') { robot.orientation = 'N'; }
    break;
  case 'F':  // Advance forward
    if (robot.orientation === 'N') { robot.position.y = robot.position.y + 1; }
    else if (robot.orientation === 'S') { robot.position.y = robot.position.y - 1; }
    else if (robot.orientation === 'E') { robot.position.x = robot.position.x + 1; }
    else if (robot.orientation === 'W') { robot.position.x = robot.position.x - 1; }
    break;
  }
}

export const robotProvider = {
  create,
  login,
  move,
};