import { ObjectId } from 'mongodb';
import { IPosition } from './planet.types';

export interface IRobot {
    _id?: ObjectId;
    name: string;
    password: string;
    planetId?: ObjectId;
    orientation: 'N'|'S'|'E'|'W';  // North, South, East and West respectively
    position: IPosition; // Current position
    lost?: boolean;
}
export interface ICreateRobotInput {
    name: string;
    password: string;
    orientation: 'N'|'S'|'E'|'W';  // North, South, East and West respectively
    position: IPosition; // Current position
    planetName?: string
}

export interface IInstructions {
    instructions: ('L' | 'R' | 'F')[];  // Turn left, turn right and advance respectively
}
