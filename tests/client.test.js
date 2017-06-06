import request from 'supertest-as-promised';
import httpStatus from 'http-status';
import chai, { expect } from 'chai';
import app from '../index';

chai.config.includeStack = true;

describe('## Client APIs', () => {
  let client = {
    clientId: 'clientIdTest',
    clientName: 'clientNameTest',
    clientSecret: 'clientSecretTest',
    redirectUri: 'http://localhost/cb',
    deviceType: 'mobile'
  };

  describe('# POST /api/clients', () => {
    it('should create a new client', (done) => {
      request(app)
        .post('/api/clients')
        .send(client)
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body.clientName).to.equal(client.clientName);
          expect(res.body.deviceType).to.equal(client.deviceType);
          client = res.body;
          done();
        })
        .catch(done);
    });
  });

  describe('# GET /api/clients/:clientId', () => {
    it('should get client details', (done) => {
      request(app)
        .get(`/api/clients/${client._id}`)
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body.deviceType).to.equal(client.deviceType);
          expect(res.body.clientName).to.equal(client.clientName);
          done();
        })
        .catch(done);
    });

    it('should report error with message - Not found, when client does not exists', (done) => {
      request(app)
        .get('/api/clients/56c787ccc67fc16ccc1a5e92')
        .expect(httpStatus.NOT_FOUND)
        .then((res) => {
          expect(res.body.message).to.equal('Not Found');
          done();
        })
        .catch(done);
    });
  });

  describe('# PUT /api/clients/:clientId', () => {
    it('should update client details', (done) => {
      client.clientName = 'MyNewName';
      request(app)
        .put(`/api/clients/${client._id}`)
        .send(client)
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body.clientName).to.equal(client.clientName);
          done();
        })
        .catch(done);
    });
  });

  describe('# GET /api/clients/', () => {
    it('should get all clients', (done) => {
      request(app)
        .get('/api/clients')
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body).to.be.an('array');
          done();
        })
        .catch(done);
    });

    it('should get all clients (with limit and skip)', (done) => {
      request(app)
        .get('/api/clients')
        .query({ limit: 10, skip: 1 })
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body).to.be.an('array');
          done();
        })
        .catch(done);
    });
  });

  describe('# DELETE /api/clients/', () => {
    it('should delete client', (done) => {
      request(app)
        .delete(`/api/clients/${client._id}`)
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body.deviceType).to.equal(client.deviceType);
          expect(res.body.clientName).to.equal('MyNewName');
          done();
        })
        .catch(done);
    });
  });
});
