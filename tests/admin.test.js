import request from 'supertest-as-promised';
import httpStatus from 'http-status';
import chai/* , { expect }*/ from 'chai';
import app from '../index';

chai.config.includeStack = true;


describe('## Admin Interface', () => {
  describe('# GET /', () => {
    it('should return 200 status', (done) => {
      request(app)
        .get('/')
        .expect(httpStatus.FOUND)
        .then((/* res */) => {
          // expect(res.text).to.include('Hello World');
          done();
        })
        .catch(done);
    });
  });
});
