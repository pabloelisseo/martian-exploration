import { ObjectId } from 'mongodb';

export interface IRobot {
    _id?: ObjectId;
    planet?: ObjectId
    orientation: 'N'|'S'|'E'|'W';
    lost?: boolean;
}
