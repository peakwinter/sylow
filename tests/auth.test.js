import request from 'supertest-as-promised';
import httpStatus from 'http-status';
import cheerio from 'cheerio';
import chai, { expect } from 'chai';

import app from '../index';
import config from '../config/config';
import AccessToken from '../server/models/accessToken.model';
import Entity from '../server/models/entity.model';
import Client from '../server/models/client.model';

chai.config.includeStack = true;

describe('## Authentification', () => {
  const badUsernameCredentials = {
    username: 'react',
    passwordHash: 'xxxxxx'
  };

  const badPasswordCredentials = {
    username: 'testuser',
    passwordHash: 'xxxxxx'
  };

  const notAdminCredentials = {
    username: 'notadmin',
    passwordHash: 'xxxxxx'
  };

  const testEntity = {
    entityName: 'testuser@testdomain.xyz',
    passwordHash: '33f1ba50d3acdfe04fadbfcdc50edd84a3af0f9d377872003eaedbb68f8e6d7146e87c35e5f3338341d91b84c1371a6a9db054c4104797e99848f4d2d8a2b91e',
    passwordSalt: '694658b93aa9c2f245cca37da3b4d7cc',
    keypair: {
      public: 'xxxxx'
    },
    authoritative: true,
    admin: true
  };

  const notAdminEntity = Object.assign(
    {}, testEntity, { entityName: 'notadmin@testdomain.xyz', passwordHash: 'xxxxxx', admin: false }
  );

  let testClient = {
    clientId: 'sylowTestClient',
    clientSecret: 'sylowTestSecret',
    clientName: 'Sylow Test Client',
    deviceType: 'other',
    redirectUri: 'http://localhost/cb',
  };

  const oauthAgent = request.agent(app);
  const localAgent = request.agent(app);

  let testAccessCode;
  let testAuthToken;
  let testTransactionId;

  before('Clean up test data', () => {
    if (config.env !== 'test') {
      return Promise.reject('Not in a test environment');
    }
    return Promise.all([
      AccessToken.remove(),
      Entity.remove(),
      Client.remove()
    ]).then(() =>
      Entity.create([testEntity, notAdminEntity])
        .then(([entity1, entity2]) => {
          testEntity.username = entity1.username;
          notAdminEntity.username = entity2.username;
          testClient.entityId = entity1._id;
          const newClient = new Client(testClient);
          return newClient.save()
            .then((client) => {
              testClient = client;
            });
        })
    );
  });

  describe('# OAuth2: Authentication Code Flow', () => {
    it('should fail to find a client with this ID', (done) => {
      oauthAgent.get('/api/auth/authorize')
        .query({
          client_id: 'noNameClient',
          response_type: 'code',
          redirect_uri: 'http://localhost/cb'
        })
        .auth(testEntity.username, testEntity.passwordHash)
        .expect(httpStatus.FORBIDDEN)
        .then((res) => {
          expect(res.body.message).to.equal('Forbidden');
          done();
        })
        .catch(done);
    });

    it('should reject client because of hijacked redirect uri', (done) => {
      oauthAgent.get('/api/auth/authorize')
        .query({
          client_id: 'sylowTestClient',
          response_type: 'code',
          redirect_uri: 'http://testdomain.blah/cb'
        })
        .auth(testEntity.username, testEntity.passwordHash)
        .expect(httpStatus.FORBIDDEN)
        .then((res) => {
          expect(res.body.message).to.equal('Forbidden');
          done();
        })
        .catch(done);
    });

    it('should be able to get authorization page', (done) => {
      oauthAgent.get('/api/auth/authorize')
        .query({
          client_id: 'sylowTestClient',
          response_type: 'code',
          redirect_uri: 'http://localhost/cb'
        })
        .auth(testEntity.username, testEntity.passwordHash)
        .expect(httpStatus.OK)
        .then((res) => {
          const html = cheerio.load(res.text);
          // cookieId = req.headers['set-cookie'][0]
          testTransactionId = html('input[type="hidden"]').val();
          done();
        })
        .catch(done);
    });

    it('should be able to retrieve an authorization code', (done) => {
      oauthAgent.post('/api/auth/decision')
        .auth(testEntity.username, testEntity.passwordHash)
        .type('form')
        .send({
          transaction_id: testTransactionId
        })
        .expect(httpStatus.FOUND)
        .then((res) => {
          testAccessCode = res.text.split('code=')[1];
          done();
        })
        .catch(done);
    });

    it('should fail to exchange an invalid authorization code', (done) => {
      request(app)
        .post('/api/auth/token')
        .auth(testClient.clientId, testClient.clientSecret)
        .send({
          code: 'xxxxxx',
          client_id: testClient.clientId,
          client_secret: testClient.clientSecret,
          grant_type: 'authorization_code',
          redirect_uri: testClient.redirectUri
        })
        .type('form')
        .expect(httpStatus.FORBIDDEN)
        .then((res) => {
          expect(res.body.error_description).to.equal('Invalid authorization code');
          done();
        })
        .catch(done);
    });

    it('should fail to exchange an authorization code with a bad redirect uri', (done) => {
      request(app)
        .post('/api/auth/token')
        .auth(testClient.clientId, testClient.clientSecret)
        .send({
          code: testAccessCode,
          client_id: testClient.clientId,
          client_secret: testClient.clientSecret,
          grant_type: 'authorization_code',
          redirect_uri: 'http://testdomain.blah/cb'
        })
        .type('form')
        .expect(httpStatus.FORBIDDEN)
        .then((res) => {
          expect(res.body.error_description).to.equal('Invalid authorization code');
          done();
        })
        .catch(done);
    });

    it('should be able to use the code to retrieve a token', (done) => {
      request(app)
        .post('/api/auth/token')
        .auth(testClient.clientId, testClient.clientSecret)
        .send({
          code: testAccessCode,
          client_id: testClient.clientId,
          client_secret: testClient.clientSecret,
          grant_type: 'authorization_code',
          redirect_uri: testClient.redirectUri
        })
        .type('form')
        .expect(httpStatus.OK)
        .then((res) => {
          testAuthToken = res.body.access_token;
          done();
        })
        .catch(done);
    });

    it('should be able to use the token to access a protected endpoint', (done) => {
      request(app)
        .get('/api/auth/random-number')
        .set('Authorization', `Bearer ${testAuthToken}`)
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body.num).to.be.a('number');
          done();
        })
        .catch(done);
    });

    it('should automatically give an access code after first authorize', (done) => {
      oauthAgent.get('/api/auth/authorize')
        .query({
          client_id: 'sylowTestClient',
          response_type: 'code',
          redirect_uri: 'http://localhost/cb'
        })
        .auth(testEntity.username, testEntity.passwordHash)
        .expect(httpStatus.FOUND)
        .then((res) => {
          testAccessCode = res.headers.location.split('code=')[1];
          done();
        })
        .catch(done);
    });

    it('should fail to get random number because of missing Authorization', (done) => {
      request(app)
        .get('/api/auth/random-number')
        .expect(httpStatus.UNAUTHORIZED)
        .then(() => done())
        .catch(done);
    });

    it('should fail to get random number because of wrong token', (done) => {
      request(app)
        .get('/api/auth/random-number')
        .set('Authorization', 'Bearer inValidToken')
        .expect(httpStatus.UNAUTHORIZED)
        .then(() => done())
        .catch(done);
    });
  });

  describe('# GET /api/auth/salt', () => {
    it('should return a random salt if no user found', (done) => {
      request(app)
        .get('/api/auth/salt')
        .query({ username: 'xxxxxx' })
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body.salt).to.be.a('string');
          done();
        })
        .catch(done);
    });

    it('should return correct password salt', (done) => {
      request(app)
        .get('/api/auth/salt')
        .query({ username: testEntity.username })
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body.salt).to.equal('694658b93aa9c2f245cca37da3b4d7cc');
          done();
        })
        .catch(done);
    });
  });

  describe('# POST /login', () => {
    it('should fail to login with a bad username', (done) => {
      localAgent.post('/login')
        .redirects(1)
        .send(badUsernameCredentials)
        .type('form')
        .expect(httpStatus.OK)
        .then((res) => {
          const html = cheerio.load(res.text);
          const err = html('.ui.error.message p').html();
          expect(err).to.equal('Invalid username or password.');
          done();
        })
        .catch(done);
    });

    it('should fail to login with bad password', (done) => {
      localAgent.post('/login')
        .redirects(1)
        .send(badPasswordCredentials)
        .type('form')
        .expect(httpStatus.OK)
        .then((res) => {
          const html = cheerio.load(res.text);
          const err = html('.ui.error.message p').html();
          expect(err).to.equal('Invalid username or password.');
          done();
        })
        .catch(done);
    });

    it('should fail to login because of a lack of admin status', (done) => {
      localAgent.post('/login')
        .redirects(1)
        .send(notAdminCredentials)
        .type('form')
        .expect(httpStatus.FORBIDDEN)
        .then((res) => {
          const html = cheerio.load(res.text);
          const err = html('.ui.negative.message p').html();
          expect(err).to.equal('Entity does not have sufficient rights');
          done();
        })
        .catch(done);
    });

    it('should successfully login', (done) => {
      localAgent.post('/login')
        .send({
          username: testEntity.username,
          passwordHash: testEntity.passwordHash
        })
        .type('form')
        .expect(httpStatus.FOUND)
        .then((res) => {
          expect(res.headers.location).to.equal('/');
          done();
        })
        .catch(done);
    });
  });
});
