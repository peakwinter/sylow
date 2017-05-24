import request from 'supertest-as-promised';
import httpStatus from 'http-status';
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

  // let jwtToken;

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

  describe('# POST /api/auth/login', () => {
    it('should return Authentication error', (done) => {
      request(app)
        .post('/api/auth/login')
        .send(invalidUserCredentials)
        .expect(httpStatus.UNAUTHORIZED)
        .then((/* res */) => {
          // expect(res.body.message).to.equal('Authentication error');
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
    });*/
  });

  describe('# GET /api/auth/random-number', () => {
    it('should fail to get random number because of missing Authorization', (done) => {
      request(app)
        .get('/api/auth/random-number')
        .expect(httpStatus.UNAUTHORIZED)
        .then((res) => {
          expect(res.body.message).to.equal('Unauthorized');
          done();
        })
        .catch(done);
    });

    it('should fail to get random number because of wrong token', (done) => {
      request(app)
        .get('/api/auth/random-number')
        .set('Authorization', 'Bearer inValidToken')
        .expect(httpStatus.UNAUTHORIZED)
        .then((res) => {
          expect(res.body.message).to.equal('Unauthorized');
          done();
        })
        .catch(done);
    });

    /* it('should get a random number', (done) => {
      request(app)
        .get('/api/auth/random-number')
        .set('Authorization', jwtToken)
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body.num).to.be.a('number');
          done();
        })
        .catch(done);
    }); */
  });
});
