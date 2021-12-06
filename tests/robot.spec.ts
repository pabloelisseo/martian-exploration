import { MongoMemoryServer } from 'mongodb-memory-server';
import * as dotenv from 'dotenv';
dotenv.config();

import chai, { expect } from 'chai';
import chaiHttp from 'chai-http';
import { IPlanet, IPosition } from '~/types/planet.types';
import { environment } from '../environment/environment';
environment.autoInstance = false;
import { app, closeInstance, instance } from '../app';
import { IRobot } from '~/types/robot.types';
import { dbProvider } from '~/providers/db.provider';
import { get } from 'lodash';


// Configure chai
chai.use(chaiHttp);
chai.should();

const baseUrl = '/robot';

describe(baseUrl, () => {
    let token: string;

    before(() => {
        return initializeTests();
    });

    after(() => {
        closeInstance();
    });

    describe('should not fail', (): void => {
        it('should create robot', (done) => {
            chai.request(app)
                .post(baseUrl)
                .send({
                    name: 'rover',
                    password: 'Robot1234',
                    orientation: 'N',
                    planetName: 'mars',
                    position: {
                        x: 1,
                        y: 1,
                    },
                } as IRobot)
                .end((_err, res) => {
                    // token = res.body.token;
                    res.should.have.status(200);
                    done();
                });
        });
        it('should login as a robot', (done) => {
            chai.request(app)
                .post(baseUrl+'/login')
                .send({
                    name: 'rover',
                    password: 'Robot1234',
                })
                .end((_err, res) => {
                    token = res.body.token;
                    res.should.have.status(200);
                    done();
                });
        });
        it('should move robot within the planet', (done) => {
            chai.request(app)
                .post(baseUrl+'/move')
                .set({ 'Authorization': `Bearer ${token}` })
                .send({
                    instructions: ['L', 'F'],
                })
                .end((_err, res) => {
                    const orientation = get(res.body, 'orientation', null);
                    const position = get(res.body, 'position', null) as IPosition;
                    const lost = get(res.body, 'lost', null);

                    res.should.have.status(200);
                    expect(orientation === 'W');
                    expect(position.x === 0);
                    expect(position.y === 1);
                    expect(lost === null);
                    done();
                });
        });
        it('should move robot outside the planet', (done) => {
            chai.request(app)
                .post(baseUrl+'/move')
                .set({ 'Authorization': `Bearer ${token}` })
                .send({
                    instructions: ['F'],
                })
                .end((_err, res) => {
                    const orientation = get(res.body, 'orientation', null);
                    const position = get(res.body, 'position', null) as IPosition;
                    const lost = get(res.body, 'lost', null);

                    res.should.have.status(200);
                    expect(orientation === 'W');
                    expect(position.x === 0);
                    expect(position.y === 1);
                    expect(lost === true);
                    done();
                });
        });
    });

    describe('should fail', (): void => {
        it('Create robot with same name', (done) => {
            chai.request(app)
                .post(baseUrl)
                .send({
                    name: 'rover',
                    password: 'Robot12345',
                    orientation: 'S',
                    position: {
                        x: 3,
                        y: 2,
                    },
                } as IRobot)
                .end((_err, res) => {
                    res.should.have.status(413);
                    done();
                });
        });
        it('Create robot without name', (done) => {
            chai.request(app)
                .post(baseUrl)
                .send({
                    password: 'Robot12345',
                    orientation: 'S',
                    position: {
                        x: 3,
                        y: 2,
                    },
                } as IRobot)
                .end((_err, res) => {
                    res.should.have.status(413);
                    done();
                });
        });
        it('Login with wrong credentials', (done) => {
            chai.request(app)
                .post(baseUrl)
                .send({
                    name: 'pepe',
                    password: 'Robot12345',
                } as IRobot)
                .end((_err, res) => {
                    res.should.have.status(413);
                    done();
                });
        });
        it('move lost robot', (done) => {
            chai.request(app)
                .post(baseUrl+'/move')
                .set({ 'Authorization': `Bearer ${token}` })
                .send({
                    instructions: ['F'],
                })
                .end((_err, res) => {
                    res.should.have.status(413);
                    done();
                });
        });
    });
});

async function initializeTests() {
    const uri = await getMockDbUri();
    environment.db = uri;
    await instance(uri);
    await dbProvider.getPlanetsCollection().insertOne({
        name: 'mars',
        lowerCoordinates: { x: 0, y: 0 } as IPosition,
        upperCoordinates: { x: 5, y: 3 },
        createdAt: new Date(),
        lastModifiedAt: new Date(),
    } as IPlanet);
}

async function getMockDbUri() {
    const mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri('test');
    return uri;
}
