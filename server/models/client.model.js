import Promise from 'bluebird';
import mongoose from 'mongoose';
import httpStatus from 'http-status';

import createdPlugin from './plugins/created';
import APIError from '../helpers/APIError';

/**
 * Client Storage Schema
 */
const ClientSchema = new mongoose.Schema({
  clientName: {
    type: String,
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
  deviceType: {
    type: String,
    enum: ['computer', 'mobile', 'gateway', 'web', 'other'],
    required: true
  },
  redirectUri: String,
  grantTypes: String,
  scope: String,
  isTrusted: {
    type: Boolean,
    default: false
  }
});

ClientSchema.plugin(createdPlugin);
ClientSchema.set('toJSON', { virtuals: true });

/**
 * Add your
 * - pre-save hooks
 * - validations
 * - virtuals
 */

 /** Virtuals */
 /* eslint-disable func-names */
ClientSchema.virtual('deviceTypeProper')
  .get(function () {
    return `${this.deviceType.charAt(0).toUpperCase()}${this.deviceType.slice(1)}`;
  });
/* eslint-enable */

/**
 * Methods
 */
ClientSchema.method({
});

/**
 * Statics
 */
ClientSchema.statics = {
  /**
   * Get client
   * @param {String} _id - the id of the client.
   * @returns {Promise<Client, APIError>}
   */
  get(id) {
    return this.findById(id)
      .exec()
      .then((client) => {
        if (client) {
          return client;
        }
        const err = new APIError('No such client exists!', httpStatus.NOT_FOUND);
        return Promise.reject(err);
      });
  },

  /**
   * List clients in descending order of 'created' timestamp.
   * @param {number} skip - Number of clients to be skipped.
   * @param {number} limit - Limit number of clients to be returned.
   * @returns {Promise<Client[]>}
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
export default mongoose.model('Client', ClientSchema);
