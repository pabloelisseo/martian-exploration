import { MongoMemoryServer } from 'mongodb-memory-server';
import * as dotenv from 'dotenv';
dotenv.config();
import chai from 'chai';
import chaiHttp from 'chai-http';
import { IPlanet } from '~/types/planet.types';
import { environment } from '../environment/environment';
environment.autoInstance = false;
import { app, closeInstance, instance } from '../app';


// Configure chai
chai.use(chaiHttp);
chai.should();

const baseUrl = '/planet';

describe(baseUrl, () => {

    before(() => {
        return initializeTests();
    });

    after(() => {
        closeInstance();
    });

    describe('should not fail', (): void => {
        it('should create planet', (done) => {
            chai.request(app)
                .post(baseUrl)
                .send({
                    name: 'mars',
                    upperCoordinates: {
                        x: 5,
                        y: 3,
                    },
                } as IPlanet)
                .end((_err, res) => {
                    res.should.have.status(200);
                    done();
                });
        });
    });

    describe('should fail', (): void => {
        it('Create planet with same name', (done) => {
            chai.request(app)
                .post(baseUrl)
                .send({
                    name: 'mars',
                    upperCoordinates: {
                        x: 2,
                        y: 2,
                    },
                } as IPlanet)
                .end((_err, res) => {
                    res.should.have.status(413);
                    done();
                });
        });
        it('Create planet without name', (done) => {
            chai.request(app)
                .post(baseUrl)
                .send({
                    upperCoordinates: {
                        x: 2,
                        y: 2,
                    },
                })
                .end((_err, res) => {
                    res.should.have.status(413);
                    done();
                });
        });
        it('Create planet without coordinates', (done) => {
            chai.request(app)
                .post(baseUrl)
                .send({
                    name: 'mars',
                })
                .end((_err, res) => {
                    res.should.have.status(413);
                    done();
                });
        });
        it('Create planet without coordinates', (done) => {
            chai.request(app)
                .post(baseUrl)
                .send({
                    name: 'mars',
                    upperCoordinates: {
                        x: -1,
                        y: -1,
                    },
                })
                .end((_err, res) => {
                    res.should.have.status(413);
                    done();
                });
        });
    });
});

async function initializeTests(){
    const uri = await getMockDbUri();
    environment.db = uri;
    await instance(uri);
}

async function getMockDbUri() {
    const mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri('test');
    return uri;
}
