import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import request from 'supertest-as-promised';
import httpStatus from 'http-status';
import chai, { expect } from 'chai';

import app from '../index';
import config from '../config/config';
import uuidRegex from '../server/utils/uuid';
import createTokens from '../server/helpers/Pretest';

chai.config.includeStack = true;

/**
 * root level hooks
 */
after((done) => {
  // required because https://github.com/Automattic/mongoose/issues/1251#issuecomment-65793092
  mongoose.models = {};
  mongoose.modelSchemas = {};
  mongoose.connection.close();
  done();
});

describe('## Local File Storage APIs', () => {
  const fileCodes = [];

  let entity;
  let accessToken;
  let fileCode;

  before('Create token', () =>
    createTokens().then(({ adminEntity, adminAccessToken }) => {
      entity = adminEntity;
      accessToken = adminAccessToken;
    })
  );

  describe('# POST /api/files', () => {
    it('should create a file upload authorization', (done) => {
      request(app)
        .post('/api/files')
        .set('Authorization', `Bearer ${accessToken.token}`)
        .expect(httpStatus.OK)
        .then((res) => {
          const [entityId, newFileCode] = res.body.url.split('/').slice(3);
          expect(entityId).to.equal(entity._id);
          expect(newFileCode).to.match(uuidRegex);
          fileCode = newFileCode;
          fileCodes.push(fileCode);
          done();
        })
        .catch(done);
    });

    it('should successfully upload a test file', (done) => {
      request(app)
        .post(`/api/files/${entity._id}/${fileCode}`)
        .set('Authorization', `Bearer ${accessToken.token}`)
        .attach('file', path.join(__dirname, '../package.json'))
        .expect(httpStatus.OK)
        .then(() => {
          const filePath = path.join(config.fileSystemPath, entity._id, fileCode);
          const checkFile = () => fs.accessSync(filePath, fs.constants.R_OK);
          expect(checkFile).to.not.throw();
          done();
        })
        .catch(done);
    });

    it('should fail to upload a file that is not authorized', (done) => {
      request(app)
        .post(`/api/files/${entity._id}/xxxxxx`)
        .set('Authorization', `Bearer ${accessToken.token}`)
        .attach('file', path.join(__dirname, '../package.json'))
        .expect(httpStatus.BAD_REQUEST)
        .then((res) => {
          expect(res.body.message).to.equal('Upload not authorized');
          done();
        })
        .catch(done);
    });
  });

  after('Clean up test files', (done) => {
    fileCodes.forEach((codeToRemove) => {
      fs.unlinkSync(path.join(config.fileSystemPath, entity._id, codeToRemove));
    });
    fs.rmdirSync(path.join(config.fileSystemPath, entity._id));
    done();
  });
});
