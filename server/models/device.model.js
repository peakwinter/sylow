import Promise from 'bluebird';
import mongoose from 'mongoose';
import httpStatus from 'http-status';

import idPlugin from './plugins/id';
import createdPlugin from './plugins/created';
import updatedPlugin from './plugins/updated';
import APIError from '../helpers/APIError';
import uuidRegex from '../utils/uuid';

/**
 * Device Storage Schema
 */
const DeviceSchema = new mongoose.Schema({
  entityId: {
    type: String,
    required: true,
    match: [uuidRegex, 'The value of path {PATH} ({VALUE}) is not a valid UUID.']
  },
  deviceName: {
    type: String,
    required: true
  },
  deviceType: {
    type: String,
    enum: ['computer', 'mobile', 'gateway', 'web', 'other'],
    required: true
  },
  clientId: {
    type: String,
    required: true
  },
  clientSecret: {
    type: String,
    required: true
  },
  redirectUri: {
    type: String,
    required: true
  },
  grantTypes: String,
  scope: String
});

DeviceSchema.plugin(idPlugin);
DeviceSchema.plugin(createdPlugin);
DeviceSchema.plugin(updatedPlugin);
DeviceSchema.set('toJSON', { virtuals: true });

/**
 * Add your
 * - pre-save hooks
 * - validations
 * - virtuals
 */

/**
 * Methods
 */
DeviceSchema.method({
});

/**
 * Virtuals
 */

/* eslint-disable func-names */
DeviceSchema.virtual('id')
  .get(function () {
    return this._id;
  })
  .set(function (v) {
    this._id = v;
  });
/* eslint-enable */

/**
 * Statics
 */
DeviceSchema.statics = {
  /**
   * Get device by Sylow UUID
   * @param {String} _id - the id of device.
   * @returns {Promise<Device, APIError>}
   */
  get(_id) {
    return this.findOne({ _id })
      .exec()
      .then((device) => {
        if (device) {
          return device;
        }
        const err = new APIError('No such device exists!', httpStatus.NOT_FOUND);
        return Promise.reject(err);
      });
  },

  /**
   * List devices in descending order of 'created' timestamp.
   * @param {number} skip - Number of devices to be skipped.
   * @param {number} limit - Limit number of devices to be returned.
   * @returns {Promise<Device[]>}
   */
  list({ skip = 0, limit = 50 } = {}) {
    return this.find()
      .sort({ created: -1 })
      .skip(+skip)
      .limit(+limit)
      .exec();
  }
};

/**
 * @typedef Entity
 */
export default mongoose.model('Device', DeviceSchema);
