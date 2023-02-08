import { ObjectId } from 'mongodb';

export interface IPlanet {
    _id?: ObjectId;
    name: string;
    upperCoordinates: IPosition;
    lowerCoordinates: IPosition;
    limits?: IPosition[];
    createdAt?: Date;
    lastModifiedAt?: Date;
}

export interface ICreatePlanetInput {
    name: string;
    upperCoordinates: IPosition;
}

export interface IPosition {
    x: number;
    y: number;
}