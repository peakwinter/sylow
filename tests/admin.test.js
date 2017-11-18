import request from 'supertest-as-promised';
import cheerio from 'cheerio';
import httpStatus from 'http-status';
import chai, { expect } from 'chai';

import config from '../config/config';
import app from '../index';

import AccessToken from '../server/models/accessToken.model';
import Client from '../server/models/client.model';
import Entity from '../server/models/entity.model';
import Server from '../server/models/server.model';
import { randomStr } from '../server/utils/random';

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
  domain: 'testDomain',
  passwordHash: 'xxxxxx',
  passwordSalt: 'xxxxxx',
  admin: true
};

const superfluousClient = {
  clientId: 'newclient',
  clientName: 'New Client',
  clientSecret: 'xxxxxx',
  redirectUri: 'http://localhost/cb',
  deviceType: 'other'
};

const testAccessToken = {
  token: randomStr(256)
};

const authoritativeServer = {
  domain: 'serverDomainTest',
  name: 'serverNameTest',
  description: 'serverDescriptionTest',
  keypair: {
    public: 'xxxxx',
    private: 'xxxxx'
  },
  authoritative: true
};

const superfluousServer = {
  domain: 'newServer',
  name: 'New Server',
  description: 'New Server\'s description',
  keypair: {
    public: 'xxxxx',
  }
};

describe('## Admin Interface', () => {
  before('Create and use test entity', () => {
    if (config.env !== 'test') {
      return Promise.reject('Not in a test environment');
    }
    return Promise.all([Entity.remove(), Client.remove(), AccessToken.remove()])
      .then(() => new Entity(testEntity).save())
      .then((entity) => {
        testEntity.id = entity._id;
        testAccessToken.entity = entity._id;
        return new Client(testClient).save();
      })
      .then((client) => {
        testClient.id = client._id;
        testAccessToken.client = client._id;
        return new AccessToken(testAccessToken).save();
      })
      .then((accessToken) => {
        testAccessToken.id = accessToken._id;
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
    it('should return the first run page', (done) => {
      adminSesh.get('/')
        .expect(httpStatus.OK)
        .then((res) => {
          const html = cheerio.load(res.text);
          const contents = html('.ui.container h1').html();
          expect(contents).to.equal('Sylow');
          done();
        })
        .catch(done);
    });

    it('should return the dashboard page', (done) => {
      adminSesh.get('/')
        .expect(httpStatus.OK)
        .then((res) => {
          const html = cheerio.load(res.text);
          const contents = html('.ui.sy-dashboard h1.ui.header').html();
          expect(contents).to.equal('Dashboard');
          expect(res.headers).to.have.property('sylow-serverid');
          expect(res.headers['sylow-serverid']).to.equal('testDomain');
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
            .to.equal('newuser@testDomain');
          done();
        })
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
  });

  describe('# POST /entities/:id', () => {
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

  describe('# GET /clients', () => {
    it('should return a list of clients', (done) => {
      adminSesh.get('/clients')
        .expect(httpStatus.OK)
        .then((res) => {
          const html = cheerio.load(res.text);
          const contents = html('.ui.sy-dashboard .ui.four.cards');
          const testuserCard = contents.children().first();
          expect(contents.length).to.equal(1);
          expect(testuserCard.find('.content .header').first().html())
            .to.equal('clientNameTest');
          done();
        })
        .catch(done);
    });
  });

  describe('# POST /clients', () => {
    it('should fail to create a client with missing information', (done) => {
      adminSesh.post('/clients')
        .redirects(1)
        .send({ clientId: 'xxxxxx', clientName: 'xxxxxx' })
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

    it('should create a client', (done) => {
      adminSesh.post('/clients')
        .redirects(1)
        .send(superfluousClient)
        .type('form')
        .expect(httpStatus.OK)
        .then((res) => {
          const html = cheerio.load(res.text);
          const contents = html('.ui.sy-dashboard .ui.four.cards').children();
          const testuserCard = contents.first();
          superfluousClient.id = testuserCard.find('.ui.negative.button').data('params');
          expect(contents.length).to.equal(2);
          expect(testuserCard.find('.content .header').last().html())
            .to.equal('New Client');
          done();
        })
        .catch(done);
    });
  });

  describe('# GET /clients/:id', () => {
    it('should show a client', (done) => {
      adminSesh.get(`/clients/${testClient.id}`)
        .expect(httpStatus.OK)
        .then((res) => {
          const html = cheerio.load(res.text);
          const title = html('.ui.sy-dashboard h1.ui.header').first().html();
          expect(title).to.equal(`Client: ${testClient.clientName}`);
          done();
        })
        .catch(done);
    });
  });

  describe('# POST /clients/:id', () => {
    it('should update a client', (done) => {
      testClient.clientName = 'newNameTest';
      adminSesh.post(`/clients/${testClient.id}`)
        .redirects(1)
        .send(testClient)
        .type('form')
        .expect(httpStatus.OK)
        .then((res) => {
          const html = cheerio.load(res.text);
          const title = html('.ui.sy-dashboard h1.ui.header').first().html();
          expect(title).to.equal(`Client: ${testClient.clientName}`);
          done();
        })
        .catch(done);
    });
  });

  describe('# DELETE /clients/:id', () => {
    it('should fail to delete a client', (done) => {
      adminSesh.delete('/clients/593576a8570f1de0f3303c87')
        .expect(httpStatus.NOT_FOUND)
        .then((res) => {
          expect(res.body.message).to.equal('Client does not exist');
          done();
        })
        .catch(done);
    });

    it('should successfully delete a client', (done) => {
      adminSesh.delete(`/clients/${superfluousClient.id}`)
        .expect(httpStatus.NO_CONTENT)
        .then((res) => {
          expect(res.text).to.equal('');
          done();
        })
        .catch(done);
    });
  });

  describe('# DELETE /tokens/:id', () => {
    it('should fail to delete an access token', (done) => {
      adminSesh.delete('/tokens/593576a8570f1de0f3303c87')
        .expect(httpStatus.NOT_FOUND)
        .then((res) => {
          expect(res.body.message).to.equal('Tokens do not exist or client not associated');
          done();
        })
        .catch(done);
    });

    it('should successfully delete a token', (done) => {
      adminSesh.delete(`/tokens/${testAccessToken.id}`)
        .expect(httpStatus.NO_CONTENT)
        .then((res) => {
          expect(res.text).to.equal('');
          done();
        })
        .catch(done);
    });
  });

  describe('# GET /settings', () => {
    it('should show the settings page', (done) => {
      adminSesh.get('/settings')
        .expect(httpStatus.OK)
        .then((res) => {
          const html = cheerio.load(res.text);
          const title = html('.ui.sy-dashboard h1.ui.header').first().html();
          const allowSignups = html('.allowSignups input').attr('value');
          expect(title).to.equal('Settings');
          expect(allowSignups).to.equal('on');
          done();
        })
        .catch(done);
    });
  });

  describe('# POST /settings', () => {
    it('should update settings', (done) => {
      const updSettings = {
        domain: 'testdomain.xyz',
        allowSignups: 'on',
        schemaDomainWhitelist: ['sylow.network']
      };
      adminSesh.post('/settings')
        .redirects(1)
        .send(updSettings)
        .type('form')
        .expect(httpStatus.OK)
        .then((res) => {
          const html = cheerio.load(res.text);
          const title = html('.ui.sy-dashboard h1.ui.header').first().html();
          const domainWhiteListInputs = html('.schemaDomainWhitelist input').get().length;
          expect(title).to.equal('Settings');
          expect(domainWhiteListInputs).to.equal(2);
          done();
        })
        .catch(done);
    });
  });

  describe('# GET /servers', () => {
    before('Create and use test servers', () => {
      if (config.env !== 'test') {
        return Promise.reject('Not in a test environment');
      }

      return Server.remove()
        .then(() => Server.create([authoritativeServer, superfluousServer]))
        .then(([newAuthServer, newExtraServer]) => {
          authoritativeServer.id = newAuthServer.id;
          superfluousServer.id = newExtraServer.id;
        });
    });

    it('should show the servers admin page', (done) => {
      adminSesh.get('/servers')
        .expect(httpStatus.OK)
        .then((res) => {
          const html = cheerio.load(res.text);
          const title = html('.ui.sy-dashboard h1.ui.header').first().html();
          const authoritativeServerDomain = html('tr.authoritative td').first().html();
          const simpleServerDomain = html('tr.non-authoritative td').html();
          expect(title).to.equal('Servers');
          expect(authoritativeServerDomain).to.equal('serverDomainTest');
          expect(simpleServerDomain).to.equal('newServer');
          done();
        })
        .catch(done);
    });

    it('should show the authoritative server\'s update form', (done) => {
      adminSesh.get(`/servers/${authoritativeServer.id}`)
        .expect(httpStatus.OK)
        .then((res) => {
          const html = cheerio.load(res.text);
          const title = html('.ui.sy-dashboard h1.ui.header').first().html();
          const name = html('form input[type="text"]').val();
          expect(title).to.equal(authoritativeServer.domain);
          expect(name).to.equal(authoritativeServer.name);
          done();
        })
        .catch(done);
    });
  });

  describe('# POST /servers/:id', () => {
    it('should update authoritative server', (done) => {
      authoritativeServer.name = 'newName';
      adminSesh.post(`/servers/${authoritativeServer.id}`)
        .redirects(1)
        .send(authoritativeServer)
        .type('form')
        .expect(httpStatus.OK)
        .then((res) => {
          const html = cheerio.load(res.text);
          const name = html('form input[type="text"]').val();
          expect(name).to.equal(authoritativeServer.name);
          done();
        })
        .catch(done);
    });
  });

  describe('# DELETE /servers/:id', () => {
    it('should fail to delete an authoritative server', (done) => {
      adminSesh.delete(`/servers/${authoritativeServer.id}`)
        .expect(httpStatus.NOT_FOUND)
        .then((res) => {
          expect(res.body.message).to.equal('Server does not exist');
          done();
        })
        .catch(done);
    });

    it('should successfully delete a non-authoritative server', (done) => {
      adminSesh.delete(`/servers/${superfluousServer.id}`)
        .expect(httpStatus.NO_CONTENT)
        .then((res) => {
          expect(res.text).to.equal('');
          done();
        })
        .catch(done);
    });
  });
});
