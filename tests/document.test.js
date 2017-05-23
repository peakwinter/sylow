import request from 'supertest-as-promised';
import httpStatus from 'http-status';
import chai, { expect } from 'chai';
import uuidV4 from 'uuid/v4';

import app from '../index';

chai.config.includeStack = true;


describe('## Document APIs', () => {

  let contentType1 = 'text/vnd.sylow.status';
  let contentType2 = 'contentType2';

  let document = {
    entityId: uuidV4(),
    contentType: contentType1,
    public: true,
    encryption: 'plain',
    data: {
      content: 'This is the first test status.'
    }
  };

  let document1 = {
    entityId: uuidV4(),
    contentType: contentType2,
    public: true,
    encryption: 'plain',
    data: {
      content: 'This is the second test status.'
    }
  };

  describe('# POST /api/documents', () => {
    it('should create a new document', (done) => {
      request(app)
        .post('/api/documents')
        .send(document)
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body.data.content).to.equal(document.data.content);
          document = res.body;
          done();
        })
        .catch(done);
    });
});

  describe('# GET /api/documents/:documentId', () => {
    it('should get document details', (done) => {
      request(app)
        .get(`/api/documents/${document.id}`)
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
        .expect(httpStatus.NOT_FOUND)
        .then((res) => {
          expect(res.body.message).to.equal('Not Found');
          done();
        })
        .catch(done);
    });
  });

  describe('# PUT /api/documents/:documentId', () => {
    it('should update document details', (done) => {
      document.data.content = 'Here is a new test status';
      request(app)
        .put(`/api/documents/${document.id}`)
        .send(document)
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body.data.content).to.equal(document.data.content);
          done();
        })
        .catch(done);
    });
  });

  describe('# GET /api/documents/', () => {
    it('should get all documents', (done) => {
      request(app)
        .get('/api/documents')
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body).to.be.an('array');
          done();
        })
        .catch(done);
    });

    it('should get all documents (with limit and skip)', (done) => {
      request(app)
        .get('/api/documents')
        .query({ limit: 10, skip: 1 })
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body).to.be.an('array');
          done();
        })
        .catch(done);
    });
  });

  describe('# DELETE /api/documents/', () => {
    it('should delete document', (done) => {
      request(app)
        .delete(`/api/documents/${document.id}`)
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body.data.content).to.equal(document.data.content);
          done();
        })
        .catch(done);
    });
  });

  describe('# ContentType filter /api/documents?contentType=...', () => {
    it('should get document list according to the filter', (done) => {
      request(app)
        .post('/api/documents')
        .send(document)
        .catch(done);

      request(app)
        .post('/api/documents')
        .send(document1)
        .catch(done);

      request(app)
        .get(`/api/documents`)
        .query({ contentType: contentType2 })
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body).to.be.an('array');
          for(let i = 0; i<res.body.length; i++) {
            expect(res.body[i].contentType).to.equal(contentType2);
            request(app).delete(`api/documents/${res.body[i].id}`);
          }
          done();
        })
        .catch(done);
    });
  });
});
