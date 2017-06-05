import request from 'supertest-as-promised';
import cheerio from 'cheerio';
import httpStatus from 'http-status';
import chai, { expect } from 'chai';

import config from '../config/config';
import app from '../index';

import Client from '../server/models/client.model';
import Entity from '../server/models/entity.model';

chai.config.includeStack = true;

const adminSesh = request.agent(app);

const testEntity = {
  username: 'testuser',
  domain: 'sylow.dev',
  entityName: 'testuser@sylow.dev',
  passwordHash: '33f1ba50d3acdfe04fadbfcdc50edd84a3af0f9d377872003eaedbb68f8e6d7146e87c35e5f3338341d91b84c1371a6a9db054c4104797e99848f4d2d8a2b91e',
  passwordSalt: '694658b93aa9c2f245cca37da3b4d7cc',
  keypair: {
    public: 'xxxxx'
  },
  authoritative: true,
  admin: true
};

const testClient = {
  clientId: 'clientIdTest',
  clientName: 'clientNameTest',
  clientSecret: 'clientSecretTest',
  redirectUri: 'http://localhost/cb',
  deviceType: 'mobile'
};

const superfluousEntity = {
  username: 'newuser',
  passwordHash: 'xxxxxx',
  passwordSalt: 'xxxxxx',
  admin: true
};


describe('## Admin Interface', () => {
  before('Create and use test entity', () => {
    if (config.env !== 'test') {
      return Promise.reject('Not in a test environment');
    }
    return Promise.all([Entity.remove(), Client.remove()])
      .then(() => new Entity(testEntity).save())
      .then((entity) => {
        testEntity.id = entity._id;
        testClient.entityId = testEntity.id;
        return new Client(testClient).save();
      })
      .then((client) => {
        testClient._id = client._id;
        return adminSesh.post('/login')
          .send({
            username: testEntity.username,
            passwordHash: testEntity.passwordHash
          })
          .type('form')
          .expect(httpStatus.FOUND)
          .then((res) => {
            expect(res.headers.location).to.equal('/');
          });
      });
  });

  describe('# GET /', () => {
    it('should return the dashboard page', (done) => {
      adminSesh.get('/')
        .expect(httpStatus.OK)
        .then((res) => {
          const html = cheerio.load(res.text);
          const contents = html('.ui.sy-dashboard h1.ui.header').html();
          expect(contents).to.equal('Dashboard');
          done();
        })
        .catch(done);
    });
  });

  describe('# GET /entities', () => {
    it('should return a list of entities', (done) => {
      adminSesh.get('/entities')
        .expect(httpStatus.OK)
        .then((res) => {
          const html = cheerio.load(res.text);
          const contents = html('.ui.sy-dashboard .ui.four.cards');
          const testuserCard = contents.children().first();
          expect(contents.length).to.equal(1);
          expect(testuserCard.find('.content .header').first().html())
            .to.equal('testuser@sylow.dev');
          done();
        })
        .catch(done);
    });
  });

  describe('# POST /entities', () => {
    it('should fail to create an entity with missing information', (done) => {
      adminSesh.post('/entities')
        .redirects(1)
        .send({ username: 'xxxxxx', authoritative: true })
        .type('form')
        .expect(httpStatus.OK)
        .then((res) => {
          const html = cheerio.load(res.text);
          const err = html('.ui.sy-dashboard .ui.error.message p').html();
          expect(err).to.equal('Missing values');
          done();
        })
        .catch(done);
    });

    it('should create an entity', (done) => {
      adminSesh.post('/entities')
        .redirects(1)
        .send(superfluousEntity)
        .type('form')
        .expect(httpStatus.OK)
        .then((res) => {
          const html = cheerio.load(res.text);
          const contents = html('.ui.sy-dashboard .ui.four.cards').children();
          const testuserCard = contents.first();
          superfluousEntity.id = testuserCard.find('.ui.negative.button').data('params');
          expect(contents.length).to.equal(2);
          expect(testuserCard.find('.content .header').first().html())
            .to.equal('newuser@sylow.dev');
          done();
        })
        .catch(done);
    });
  });

  describe('# DELETE /entities/:id', () => {
    it('should fail to delete a nonexistent entity', (done) => {
      adminSesh.delete('/entities/xxxxxx')
        .expect(httpStatus.NOT_FOUND)
        .then((res) => {
          expect(res.body.message).to.equal('Entity does not exist');
          done();
        })
        .catch(done);
    });

    it('should delete an entity', (done) => {
      adminSesh.delete(`/entities/${superfluousEntity.id}`)
        .expect(httpStatus.NO_CONTENT)
        .then(() =>
          adminSesh.get('/entities')
            .expect(httpStatus.OK)
            .then((res) => {
              const html = cheerio.load(res.text);
              const contents = html('.ui.sy-dashboard .ui.four.cards');
              const testuserCard = contents.children().first();
              expect(contents.length).to.equal(1);
              expect(testuserCard.find('.content .header').first().html())
                .to.equal('testuser@sylow.dev');
              done();
            })
        )
        .catch(done);
    });
  });

  describe('# GET /entities/:id', () => {
    it('should show an entity', (done) => {
      adminSesh.get(`/entities/${testEntity.id}`)
        .expect(httpStatus.OK)
        .then((res) => {
          const html = cheerio.load(res.text);
          const title = html('.ui.sy-dashboard h1.ui.header').first().html();
          expect(title).to.equal(`Entity: ${testEntity.entityName}`);
          done();
        })
        .catch(done);
    });

    it('should update an entity', (done) => {
      adminSesh.post(`/entities/${testEntity.id}`)
        .redirects(1)
        .send({ username: 'newTest', admin: 1 })
        .type('form')
        .expect(httpStatus.OK)
        .then((res) => {
          const html = cheerio.load(res.text);
          const title = html('.ui.sy-dashboard h1.ui.header').first().html();
          expect(title).to.equal(`Entity: newTest@${testEntity.domain}`);
          return request(app).post('/login')
            .send({
              username: 'newTest',
              passwordHash: testEntity.passwordHash
            })
            .type('form')
            .expect(httpStatus.FOUND)
            .then((logRes) => {
              expect(logRes.headers.location).to.equal('/');
              done();
            });
        })
        .catch(done);
    });

    it('should update an entity with a new password', (done) => {
      adminSesh.post(`/entities/${testEntity.id}`)
        .redirects(1)
        .send({ username: 'testuser', admin: 1, passwordHash: 'xxxxxx', passwordSalt: 'xxxxxx' })
        .type('form')
        .expect(httpStatus.OK)
        .then((res) => {
          const html = cheerio.load(res.text);
          const title = html('.ui.sy-dashboard h1.ui.header').first().html();
          expect(title).to.equal(`Entity: testuser@${testEntity.domain}`);
          return request(app).post('/login')
            .send({
              username: 'testuser',
              passwordHash: 'xxxxxx'
            })
            .type('form')
            .expect(httpStatus.FOUND)
            .then((logRes) => {
              expect(logRes.headers.location).to.equal('/');
              done();
            });
        })
        .catch(done);
    });
  });

  describe('# DELETE /clients/:id', () => {
    it('should fail to revoke a client', (done) => {
      adminSesh.delete('/clients/593576a8570f1de0f3303c87')
        .expect(httpStatus.NOT_FOUND)
        .then((res) => {
          expect(res.body.message).to.equal('Client does not exist');
          done();
        })
        .catch(done);
    });

    it('should successfully revoke a client', (done) => {
      adminSesh.delete(`/clients/${testClient._id}`)
        .expect(httpStatus.NO_CONTENT)
        .then((res) => {
          expect(res.text).to.equal('');
          done();
        })
        .catch(done);
    });
  });
});
