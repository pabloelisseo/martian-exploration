import { isNil, isString, get } from 'lodash';
import { MongoClient, Db, Collection } from 'mongodb';
import {
  IDbParameters,
} from '~/environment/environment.type';
import { IPlanet } from '~/types/planet.types';
import { IRobot } from '~/types/robot.types';

let client: MongoClient;
let db: Db;

function getClient(): MongoClient {
  return client;
}

/**
 * Get MongoDB connection URI
 */
function getUri(connectOptions: IDbParameters): string {
  const { protocol, username, password, host, db, options } = connectOptions;
  return `${protocol}${username}:${password}@${host}/${db}?retryWrites=${options.retryWrites}&w=${options.w}`;
}

/**
 * Internal instance MongoDB for the current nodejs runtime process
 * This is a global instance of mongoose
 */
async function instance(connectionParameters: IDbParameters | string): Promise<void> {
  try {
    let uri: string;
    if (isString(connectionParameters)) {
      uri = connectionParameters;
    } else {
      uri = getUri(connectionParameters);
    }
    client = new MongoClient(uri);

    await client.connect();
    db = client.db();
    await db.listCollections({ name: 'planets' }).next(async (_, collinfo) => {
      if (!collinfo) {
        await db.createCollection('planets');
      }
    });
    await db.listCollections({ name: 'robots' }).next(async (_, collinfo) => {
      if (!collinfo) {
        await db.createCollection('robots');
      }
    });
    await db.listCollections({ name: 'tokens' }).next(async (_, collinfo) => {
      if (!collinfo) {
        await db.createCollection('tokens');
      }
      const indexes = await db.indexInformation('tokens');
      const createdAtIndex = get(indexes, 'createdAt', null);
      if (isNil(createdAtIndex)){
        await db.createIndex('tokens', { 'createdAt': 1 },
          {
            expireAfterSeconds: 8*60*60,
          });
      }
    });
  } catch (error) {
    throw new Error(error);
  }
}

/**
 * Diconnect an existing MongoDB connection
 */
async function disconnectInstance(): Promise<void> {
  getClient() && getClient().close();
}

/**
 * Returns planets collection
 */
function getPlanetsCollection(): Collection<IPlanet> {
  return db.collection('planets');
}

/**
 * Returns robots collection
 */
function getRobotsCollection(): Collection<IRobot> {
  return db.collection('robots');
}

/**
 * Returns robots collection
 */
function getTokensCollection(): Collection<any> {
  return db.collection('tokens');
}

export const dbProvider = {
  instance,
  getClient,
  getPlanetsCollection,
  getRobotsCollection,
  getTokensCollection,
  disconnectInstance,
};
