import request from 'supertest-as-promised';
import httpStatus from 'http-status';
import chai, { expect } from 'chai';
import uuidV4 from 'uuid/v4';

import app from '../index';

chai.config.includeStack = true;


describe('## Document APIs', () => {

  const contentType1 = 'text/vnd.sylow.status';
  const contentType2 = 'contentType2';

  let document = {
    entityId: uuidV4(),
    contentType: contentType1,
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

  let document2 = {
    entityId: uuidV4(),
    contentType: contentType2,
    public: true,
    encryption: 'plain',
    data: {
      content: 'This is the third test status.'
    },
    tags: ['3', '9']
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

  describe('# Filters', () => {

    it('should get all documents (with limit and skip)', (done) => {
      request(app)
        .post('/api/documents')
        .send(document1)
        .then((res) => {
          document1 = res.body;
        })
        .catch(done);

      request(app)
        .get('/api/documents')
        .query({ limit: 10, skip: 1, contentType : contentType1 })
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body).to.be.an('array');
          done();
        })
        .catch(done);
    });

    it('should get document list according to the contentType', (done) => {
      request(app)
        .get(`/api/documents`)
        .query({ contentType: contentType2 })
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body).to.be.an('array');
          for(let i = 0; i<res.body.length; i++) {
            expect(res.body[i].contentType).to.equal(contentType2);
          }
          done();
        })
        .catch(done);
    });

    it('should get documents list according to the created datetime', (done) => {
      let dateRefStart = new Date();
      dateRefStart.setDate(dateRefStart.getDate() - 1);
      let dateRefEnd = new Date();

      request(app)
        .get('/api/documents')
        .query({ creationStart : dateRefStart, creationEnd: dateRefEnd, contentType: contentType1 })
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body).to.be.an('array');
          for(let i = 0; i<res.body.length; i++) {
            expect(res.body[i].created > dateRefStart);
            expect(res.body[i].created < dateRefEnd);
          }
          done();
        })
        .catch(done);
    });

    it('should get documents list according to the update datetime', (done) => {
      let dateRefStart = new Date();
      dateRefStart.setDate(dateRefStart.getDate() - 1);
      const dateRefEnd = new Date();

      request(app)
        .get('/api/documents')
        .query({ updatedStart : dateRefStart, updatedEnd: dateRefEnd, contentType: contentType1 })
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body).to.be.an('array');
          for(let i = 0; i<res.body.length; i++) {
            expect(res.body[i].updated > dateRefStart);
            expect(res.body[i].updated < dateRefEnd);
          }
          done();
        })
        .catch(done);
    });

    it('should get documents list according to the document tags', (done) => {
      const testTags = ['1', '5'];

      request(app)
        .get('/api/documents')
        .query({ tags: testTags, contentType: contentType1 })
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body).to.be.an('array');
          for(let i = 0; i<res.body.length; i++) {
            expect(res.body[i].tags.some(e => testTags.includes(e)));
          }
          done();
        })
        .catch(done);
    });

    it('should provide a pagination system to display the documents', (done) => {
      const limitTest = 1;
      const pageTest = 2;

      request(app)
       .post('/api/documents')
       .send(document2)
       .then((res) => {
         document2 = res.body;
      })
      .catch(done);

      request(app)
        .get('/api/documents')
        .query({ limit: limitTest, page: pageTest, contentType: contentType2 })
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body[0].data.content).to.equal(document2.data.content);
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
        })
        .catch(done);

      request(app)
        .delete(`/api/documents/${document1.id}`)
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body.data.content).to.equal(document1.data.content);
          done();
        })
        .catch(done);

      request(app)
        .delete(`/api/documents/${document2.id}`)
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body.data.content).to.equal(document2.data.content);
        })
        .catch(done);

    });
  });
});
