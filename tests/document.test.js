import request from 'supertest-as-promised';
import httpStatus from 'http-status';
import chai, { expect } from 'chai';
import uuidV4 from 'uuid/v4';

import app from '../index';
import createTokens from '../server/helpers/Pretest';

chai.config.includeStack = true;

describe('## Document APIs', () => {
  const contentType1 = 'text/vnd.sylow.status';
  const contentType2 = 'contentType2';

  let document = {
    contentType: 'contentType2',
    public: true,
    encryption: 'plain',
    data: {
      content: 'This is the first test status.'
    },
    tags: ['1', '2', '3']
  };

  let document1 = {
    entityId: uuidV4(),
    contentType: contentType2,
    public: true,
    encryption: 'plain',
    data: {
      content: 'This is the second test status.'
    },
    tags: ['3', '4', '5']
  };

  let entity;
  let accessToken;
  let nonAdminToken;

  before('Clean up test data', () =>
    createTokens().then(({ adminEntity, adminAccessToken, nonAdminAccessToken }) => {
      entity = adminEntity;
      accessToken = adminAccessToken;
      nonAdminToken = nonAdminAccessToken;
    })
  );

  describe('# POST /api/documents', () => {
    it('should create a new document', (done) => {
      document.entityId = entity._id;
      request(app)
        .post('/api/documents')
        .set('Authorization', `Bearer ${accessToken.token}`)
        .send(document)
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body.data.content).to.equal(document.data.content);
          document = res.body;
          done();
        })
        .catch(done);
    });

    it('should upsert new documents', (done) => {
      request(app)
        .post('/api/documents')
        .set('Authorization', `Bearer ${accessToken.token}`)
        .send([document, document1])
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body[0].data.content).to.equal(document.data.content);
          expect(res.body[1].data.content).to.equal(document1.data.content);
          [document, document1] = res.body;
          done();
        })
        .catch(done);
    });
  });

  describe('# GET /api/documents/:documentId', () => {
    it('should get document details', (done) => {
      request(app)
        .get(`/api/documents/${document.id}`)
        .set('Authorization', `Bearer ${accessToken.token}`)
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body.data.content).to.equal(document.data.content);
          done();
        })
        .catch(done);
    });

    it('should report error with message - Not found, when document does not exists', (done) => {
      request(app)
        .get('/api/documents/xxxxx')
        .set('Authorization', `Bearer ${accessToken.token}`)
        .expect(httpStatus.NOT_FOUND)
        .then((res) => {
          expect(res.body.message).to.equal('Not Found');
          done();
        })
        .catch(done);
    });
  });

  describe('# PUT /api/documents/:documentId', () => {
    it('should fail to update document details for an unowned document', (done) => {
      document1.data.content = 'Here is a new test status';
      request(app)
        .put(`/api/documents/${document1._id}`)
        .set('Authorization', `Bearer ${nonAdminToken.token}`)
        .send(document1)
        .expect(httpStatus.UNAUTHORIZED)
        .then((res) => {
          expect(res.body.message).to.equal('Unauthorized action');
          done();
        })
        .catch(done);
    });

    it('should update document details', (done) => {
      document.data.content = 'Here is a new test status';
      request(app)
        .put(`/api/documents/${document.id}`)
        .set('Authorization', `Bearer ${accessToken.token}`)
        .send(document)
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body.data.content).to.equal(document.data.content);
          done();
        })
        .catch(done);
    });
  });

  describe('# Filters', () => {
    it('should get all documents (with limit and skip)', (done) => {
      request(app)
        .get('/api/documents')
        .set('Authorization', `Bearer ${accessToken.token}`)
        .query({ limit: 10, skip: 1, contentType: contentType1 })
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body).to.be.an('array');
          done();
        })
        .catch(done);
    });

    it('should get document list according to the contentType', (done) => {
      request(app)
        .get('/api/documents')
        .set('Authorization', `Bearer ${accessToken.token}`)
        .query({ contentType: contentType2 })
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body).to.be.an('array');
          for (let i = 0; i < res.body.length; i += 1) {
            expect(res.body[i].contentType).to.equal(contentType2);
          }
          done();
        })
        .catch(done);
    });

    it('should get documents list according to the created datetime', (done) => {
      const createdStart = new Date();
      createdStart.setDate(createdStart.getDate() - 1);
      const createdEnd = new Date();

      request(app)
        .get('/api/documents')
        .set('Authorization', `Bearer ${accessToken.token}`)
        .query({ createdStart, createdEnd, contentType: contentType1 })
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body).to.be.an('array');
          for (let i = 0; i < res.body.length; i += 1) {
            expect(res.body[i].created > createdStart);
            expect(res.body[i].created < createdEnd);
          }
          done();
        })
        .catch(done);
    });

    it('should get documents list according to the update datetime', (done) => {
      const updatedStart = new Date();
      updatedStart.setDate(updatedStart.getDate() - 1);
      const updatedEnd = new Date();

      request(app)
        .get('/api/documents')
        .set('Authorization', `Bearer ${accessToken.token}`)
        .query({ updatedStart, updatedEnd, contentType: contentType1 })
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body).to.be.an('array');
          for (let i = 0; i < res.body.length; i += 1) {
            expect(res.body[i].updated > updatedStart);
            expect(res.body[i].updated < updatedEnd);
          }
          done();
        })
        .catch(done);
    });

    it('should get documents list according to the document tags', (done) => {
      const testTags = ['1', '5'];

      request(app)
        .get('/api/documents')
        .set('Authorization', `Bearer ${accessToken.token}`)
        .query({ tags: testTags, contentType: contentType1 })
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body).to.be.an('array');
          for (let i = 0; i < res.body.length; i += 1) {
            expect(res.body[i].tags.some(e => testTags.indexOf(e) >= 0));
          }
          done();
        })
        .catch(done);
    });
  });

  describe('# DELETE /api/documents/', () => {
    it('should fail to remove an unowned document', (done) => {
      request(app)
        .delete(`/api/documents/${document1._id}`)
        .set('Authorization', `Bearer ${nonAdminToken.token}`)
        .expect(httpStatus.UNAUTHORIZED)
        .then((res) => {
          expect(res.body.message).to.equal('Unauthorized action');
          done();
        })
        .catch(done);
    });

    it('should delete document', (done) => {
      request(app)
        .delete(`/api/documents/${document.id}`)
        .set('Authorization', `Bearer ${accessToken.token}`)
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body.data.content).to.equal(document.data.content);
          done();
        })
        .catch(done);
    });
  });
});
