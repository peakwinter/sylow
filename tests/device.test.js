import mongoose from 'mongoose';
import request from 'supertest-as-promised';
import httpStatus from 'http-status';
import chai, { expect } from 'chai';
import app from '../index';
import uuidV4 from 'uuid/v4';

chai.config.includeStack = true;

describe('## Device APIs', () => {
  let device = {
    entityId: uuidV4(),
    deviceName: 'deviceNameTest',
    deviceType: 'mobile'
  };

  describe('# POST /api/devices', () => {
    it('should create a new device', (done) => {
      request(app)
        .post('/api/devices')
        .send(device)
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body.deviceName).to.equal(device.deviceName);
          expect(res.body.entityId).to.equal(device.entityId);
          expect(res.body.deviceType).to.equal(device.deviceType);
          device = res.body;
          done();
        })
        .catch(done);
    });
  });

  describe('# GET /api/devices/:deviceId', () => {
    it('should get device details', (done) => {
      request(app)
        .get(`/api/devices/${device._id}`)
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body.entityId).to.equal(device.entityId);
          expect(res.body.deviceType).to.equal(device.deviceType);
          expect(res.body.deviceName).to.equal(device.deviceName);
          done();
        })
        .catch(done);
    });

    it('should report error with message - Not found, when device does not exists', (done) => {
      request(app)
        .get('/api/devices/xxxxx')
        .expect(httpStatus.NOT_FOUND)
        .then((res) => {
          expect(res.body.message).to.equal('Not Found');
          done();
        })
        .catch(done);
    });
  });

  describe('# PUT /api/devices/:deviceId', () => {
    it('should update device details', (done) => {
      device.deviceName = 'MyNewName';
      request(app)
        .put(`/api/devices/${device._id}`)
        .send(device)
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body.deviceName).to.equal(device.deviceName);
          done();
        })
        .catch(done);
    });
  });

  describe('# GET /api/devices/', () => {
    it('should get all devices', (done) => {
      request(app)
        .get('/api/devices')
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body).to.be.an('array');
          done();
        })
        .catch(done);
    });

    it('should get all devices (with limit and skip)', (done) => {
      request(app)
        .get('/api/devices')
        .query({ limit: 10, skip: 1 })
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body).to.be.an('array');
          done();
        })
        .catch(done);
    });
  });

  describe('# DELETE /api/devices/', () => {
    it('should delete device', (done) => {
      request(app)
        .delete(`/api/devices/${device._id}`)
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body.entityId).to.equal(device.entityId);
          expect(res.body.deviceType).to.equal(device.deviceType);
          expect(res.body.deviceName).to.equal('MyNewName');
          done();
        })
        .catch(done);
    });
  });
});
