import mongoose from 'mongoose';
import request from 'supertest-as-promised';
import httpStatus from 'http-status';
import chai, { expect } from 'chai';

import config from '../config/config';
import app from '../index';
import createTokens from '../server/helpers/Pretest';

chai.config.includeStack = true;

/**
 * root level hooks
 */
after((done) => {
  // required because https://github.com/Automattic/mongoose/issues/1251#issuecomment-65793092
  mongoose.models = {};
  mongoose.modelSchemas = {};
  mongoose.connection.close();
  done();
});

describe('## Entity APIs', () => {
  let entity = {
    entityName: 'testuser1@testdomain.xyz',
    passwordHash: '33f1ba50d3acdfe04fadbfcdc50edd84a3af0f9d377872003eaedbb68f8e6d7146e87c35e5f3338341d91b84c1371a6a9db054c4104797e99848f4d2d8a2b91e',
    passwordSalt: '694658b93aa9c2f245cca37da3b4d7cc',
    keypair: {
      public: 'xxxxx'
    },
    authoritative: true
  };

  let entity2 = {
    username: 'testuser2',
    domain: 'testdomain.xyz',
    passwordHash: '33f1ba50d3acdfe04fadbfcdc50edd84a3af0f9d377872003eaedbb68f8e6d7146e87c35e5f3338341d91b84c1371a6a9db054c4104797e99848f4d2d8a2b91e',
    passwordSalt: '694658b93aa9c2f245cca37da3b4d7cc',
    keypair: {
      public: 'xxxxx'
    },
    authoritative: true
  };

  let accessToken;

  before('Clean up test data', () =>
    createTokens().then(({ adminAccessToken }) => {
      accessToken = adminAccessToken;
    })
  );

  describe('# POST /api/entities', () => {
    it('should fail to create a new entity due to server restriction', (done) => {
      config.allowSignups = false;
      request(app)
        .post('/api/entities')
        .set('Authorization', `Bearer ${accessToken.token}`)
        .send(entity)
        .expect(httpStatus.BAD_REQUEST)
        .then((res) => {
          expect(res.body.message).to.equal('New signups not allowed');
          config.allowSignups = true;
          done();
        })
        .catch(done);
    });

    it('should create a new entity with entityName parameter', (done) => {
      request(app)
        .post('/api/entities')
        .set('Authorization', `Bearer ${accessToken.token}`)
        .send(entity)
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body.entityName).to.equal(entity.entityName);
          expect(res.body.keypair.public).to.equal(entity.keypair.public);
          entity = res.body;
          done();
        })
        .catch(done);
    });

    it('should create a new entity with username and domain parameters', (done) => {
      request(app)
        .post('/api/entities')
        .set('Authorization', `Bearer ${accessToken.token}`)
        .send(entity2)
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body.username).to.equal(entity2.username);
          expect(res.body.domain).to.equal(entity2.domain);
          expect(res.body.entityName).to.equal(entity2.username.concat('@').concat(entity2.domain));
          entity2 = res.body;
          done();
        })
        .catch(done);
    });
  });

  describe('# GET /api/entities/:entityId', () => {
    it('should get entity details', (done) => {
      request(app)
        .get(`/api/entities/${entity.id}`)
        .set('Authorization', `Bearer ${accessToken.token}`)
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body.entityName).to.equal(entity.entityName);
          expect(res.body.keypair.public).to.equal(entity.keypair.public);
          done();
        })
        .catch(done);
    });

    it('should report error with message - Not found, when entity does not exists', (done) => {
      request(app)
        .get('/api/entities/xxxxx')
        .set('Authorization', `Bearer ${accessToken.token}`)
        .expect(httpStatus.NOT_FOUND)
        .then((res) => {
          expect(res.body.message).to.equal('Not Found');
          done();
        })
        .catch(done);
    });
  });

  describe('# PUT /api/entities/:entityId', () => {
    it('should update entity details', (done) => {
      entity.entityName = 'newtest@newdomain.xyz';
      request(app)
        .put(`/api/entities/${entity.id}`)
        .set('Authorization', `Bearer ${accessToken.token}`)
        .send(entity)
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body.entityName).to.equal(entity.entityName);
          expect(res.body.keypair.public).to.equal(entity.keypair.public);
          done();
        })
        .catch(done);
    });
  });

  describe('# GET /api/entities/', () => {
    it('should get all entities', (done) => {
      request(app)
        .get('/api/entities')
        .set('Authorization', `Bearer ${accessToken.token}`)
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body).to.be.an('array');
          done();
        })
        .catch(done);
    });

    it('should get all entities (with limit and skip)', (done) => {
      request(app)
        .get('/api/entities')
        .set('Authorization', `Bearer ${accessToken.token}`)
        .query({ limit: 10, skip: 1 })
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body).to.be.an('array');
          done();
        })
        .catch(done);
    });
  });

  describe('# DELETE /api/entities/', () => {
    it('should delete entity', (done) => {
      request(app)
        .delete(`/api/entities/${entity.id}`)
        .set('Authorization', `Bearer ${accessToken.token}`)
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body.entityName).to.equal('newtest@newdomain.xyz');
          expect(res.body.keypair.public).to.equal(entity.keypair.public);
          done();
        })
        .catch(done);
    });
    it('should delete entity2', (done) => {
      request(app)
          .delete(`/api/entities/${entity2.id}`)
          .set('Authorization', `Bearer ${accessToken.token}`)
          .expect(httpStatus.OK)
          .then((res) => {
            expect(res.body.id).to.equal(entity2.id);
            expect(res.body.entityName).to.equal(entity2.username.concat('@').concat(entity2.domain));
            done();
          })
          .catch(done);
    });
  });
});
