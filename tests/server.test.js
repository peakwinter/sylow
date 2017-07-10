import mongoose from 'mongoose';
import request from 'supertest-as-promised';
import httpStatus from 'http-status';
import chai, { expect } from 'chai';

import app from '../index';

chai.config.includeStack = true;

after((done) => {
  mongoose.models = {};
  mongoose.modelSchemas = {};
  mongoose.connection.close();
  done();
});

describe('## Server APIs', () => {
  let server = {
    domain: 'testdomain.xyz',
    name: 'testServer',
    description: 'The first server\'s description',
    keypair: {
      public: 'xxxxxx'
    },
    authoritative: true
  };

  let server2 = {
    domain: 'testdomain2.xyz',
    name: 'testServer2',
    description: 'The second server\'s description',
    keypair: {
      public: 'xxxxxx'
    },
    authoritative: true
  };

  describe('# POST /api/servers', () => {
    it('should create a new server', (done) => {
      request(app)
        .post('/api/servers')
        .send(server)
        .expect(httpStatus.OK)
        .then((res) => {
           expect(res.body.name).to.equal(server.name);
           server = res.body;
         })
         .catch(done);

      request(app)
        .post('/api/servers')
        .send(server2)
        .expect(httpStatus.OK)
        .then((res) => {
           expect(res.body.name).to.equal(server2.name);
           server2 = res.body;
           done();
         })
         .catch(done);
    });
  });

  describe('# GET /api/servers/:serverId', () => {
    it('should get server details', (done) => {
      request(app)
        .get(`/api/servers/${server.id}`)
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body.name).to.equal(server.name);
          expect(res.body.domain).to.equal(server.domain);
          done();
        })
        .catch(done);
    });
  });

  describe('# PUT /api/servers/:serverId', () => {
    it('should update server details', (done) => {
      server.name = 'New Server name';
      request(app)
        .put(`/api/servers/${server.id}`)
        .send(server)
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body.name).to.equal(server.name);
          expect(res.body.domain).to.equal(server.domain);
          done();
        })
        .catch(done);
    });

    describe('# GET /api/servers', () => {
      it('should get all servers', (done) => {
        request(app)
          .get('/api/servers')
          .expect(httpStatus.OK)
          .then((res) => {
            expect(res.body).to.be.an('array');
            done();
          })
          .catch(done);
      });
    });
 
    describe('# DELETE /api/servers/:serverId', () => {
      it('should delete server', (done) => {
        request(app)
          .delete(`/api/servers/${server.id}`)
          .expect(httpStatus.OK)
          .then((res) => {
            expect(res.body.name).to.equal(server.name);
            expect(res.body.domain).to.equal(server.domain);
          })
          .catch(done);

        request(app)
          .delete(`/api/servers/${server2.id}`)
          .expect(httpStatus.OK)
          .then((res) => {
            expect(res.body.name).to.equal(server2.name);
            expect(res.body.domain).to.equal(server2.domain);
            done();
          })
          .catch(done);

      });
    });
  });
});
