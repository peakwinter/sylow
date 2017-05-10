import Promise from 'bluebird';
import mongoose from 'mongoose';
import httpStatus from 'http-status';
import uuidV4 from 'uuid/v4';

import APIError from '../helpers/APIError';
import { DocumentSchema } from './document.model';
import uuidRegex from '../utils/uuid';

/**
 * Entity Storage Schema
 */
const EntitySchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    default: uuidV4,
    match: [uuidRegex, 'The value of path {PATH} ({VALUE}) is not a valid UUID.']
  },
  username: {
    type: String,
    required: true
  },
  domain: {
    type: String,
    required: true
  },
  passwordHash: {
    type: String,
    required: true
  },
  passwordSalt: {
    type: String,
    required: true
  },
  contact: DocumentSchema,
  keypair: {
    public: {
      type: String,
      required: true
    },
    private: String
  },
  created: {
    type: Date,
    default: Date.now
  },
  updated: {
    type: Date,
    default: Date.now
  },
  authoritative: {
    type: Boolean,
    default: false
  }
});

EntitySchema.set('toJSON', { virtuals: true });

/**
 * Add your
 * - pre-save hooks
 * - validations
 * - virtuals
 */

/**
 * Methods
 */
EntitySchema.method({
});

/**
 * Virtuals
 */

 /* eslint-disable func-names */
EntitySchema.virtual('entityName')
  .get(function () {
    return `${this.username}@${this.domain}`;
  })
  .set(function (v) {
    [this.username, this.domain] = v.split('@');
  });
/* eslint-enable */

/**
 * Statics
 */
EntitySchema.statics = {
  /**
   * Get entity by Mongo object ID
   * @param {ObjectId} id - The objectId of entity.
   * @returns {Promise<Entity, APIError>}
   */
  getByObjectId(id) {
    return this.findById(id)
      .exec()
      .then((user) => {
        if (user) {
          return user;
        }
        const err = new APIError('No such entity exists!', httpStatus.NOT_FOUND);
        return Promise.reject(err);
      });
  },

  /**
   * Get entity by Sylow UUID
   * @param {String} id - The id of entity.
   * @returns {Promise<Entity, APIError>}
   */
  get(id) {
    return this.findOne({ id })
      .exec()
      .then((user) => {
        if (user) {
          return user;
        }
        const err = new APIError('No such entity exists!', httpStatus.NOT_FOUND);
        return Promise.reject(err);
      });
  },

  /**
   * List entities in descending order of 'created' timestamp.
   * @param {number} skip - Number of entities to be skipped.
   * @param {number} limit - Limit number of entities to be returned.
   * @returns {Promise<Entity[]>}
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
export default mongoose.model('Entity', EntitySchema);
