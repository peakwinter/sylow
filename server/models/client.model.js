import Promise from 'bluebird';
import mongoose from 'mongoose';
import httpStatus from 'http-status';

import createdPlugin from './plugins/created';
import APIError from '../helpers/APIError';
import uuidRegex from '../utils/uuid';

/**
 * Client Storage Schema
 */
const ClientSchema = new mongoose.Schema({
  entityId: {
    type: String,
    required: true,
    match: [uuidRegex, 'The value of path {PATH} ({VALUE}) is not a valid UUID.'],
    ref: 'Entity'
  },
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
  redirectUri: {
    type: String,
    required: true
  },
  grantTypes: String,
  scope: String
});

ClientSchema.plugin(createdPlugin);

/**
 * Add your
 * - pre-save hooks
 * - validations
 * - virtuals
 */

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
