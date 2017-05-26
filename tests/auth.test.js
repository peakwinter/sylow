import request from 'supertest-as-promised';
import httpStatus from 'http-status';
import cheerio from 'cheerio';
import chai, { expect } from 'chai';
import app from '../index';
// import config from '../config/config';

chai.config.includeStack = true;

describe('## Auth APIs', () => {
  const validUserCredentials = {
    username: 'react',
    // password: 'testpass',
    passwordHash: '0f04a285f6554e97fbbd2d0faf180eeb9db3e90388d0f3570ab8e6e1db7ba9ac088b41e1ba66e65ab39aa6124f69879d48ef8f771c475a945687f55d1a5695bd'
  };

  const invalidUserCredentials = {
    username: 'react',
    // password: 'IDontKnow',
    passwordHash: 'xxxxxx'
  };

  const testEntity = {
    entityName: 'testuser@testdomain.xyz',
    passwordHash: '33f1ba50d3acdfe04fadbfcdc50edd84a3af0f9d377872003eaedbb68f8e6d7146e87c35e5f3338341d91b84c1371a6a9db054c4104797e99848f4d2d8a2b91e',
    passwordSalt: '694658b93aa9c2f245cca37da3b4d7cc',
    keypair: {
      public: 'xxxxx'
    },
    authoritative: true
  };

  let testClient = {
    clientId: 'sylowTestClient',
    clientSecret: 'sylowTestSecret',
    clientName: 'Sylow Test Client',
    deviceType: 'other',
    redirectUri: 'http://localhost/cb',
  };

  const oauthAgent = request.agent(app);

  let testAccessCode;
  let testAuthToken;
  let testTransactionId;

  describe('# OAuth2: Authentication Code Flow', () => {
    it('should create a new entity and client to test with', (done) => {
      request(app)
        .post('/api/entities')
        .send(testEntity)
        .then((res) => {
          Object.assign(testEntity, res.body);
          testClient.entityId = testEntity.id;
          request(app)
            .post('/api/clients')
            .send(testClient)
            .then((clientRes) => {
              testClient = clientRes.body;
              done();
            })
            .catch(done);
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
    it('should return Authentication error', (done) => {
      request(app)
        .get('/api/auth/salt')
        .query({ username: 'xxxxxx' })
        .expect(httpStatus.NOT_FOUND)
        .then((res) => {
          expect(res.body.message).to.equal('User not found');
          done();
        })
        .catch(done);
    });

    it('should return correct password salt', (done) => {
      request(app)
        .get('/api/auth/salt')
        .query({ username: validUserCredentials.username })
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body.salt).to.equal('9b02e8d16d99533a1063b9fb554d8380');
          done();
        })
        .catch(done);
    });
  });

  describe('# POST /login', () => {
    it('should return Authentication error', (done) => {
      request(app)
        .post('/login')
        .send(invalidUserCredentials)
        .type('form')
        .expect(httpStatus.FOUND)
        .then((res) => {
          expect(res.headers.location).to.equal('/login');
          done();
        })
        .catch(done);
    });

    /* it('should get valid JWT token', (done) => {
      request(app)
        .post('/api/auth/login')
        .send(validUserCredentials)
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body).to.have.property('token');
          jwt.verify(res.body.token, config.jwtSecret, (err, decoded) => {
            expect(err).to.not.be.ok; // eslint-disable-line no-unused-expressions
            expect(decoded.username).to.equal(validUserCredentials.username);
            // jwtToken = `Bearer ${res.body.token}`;
            done();
          });
        })
        .catch(done);
    }); */
  });
});
