import Promise from 'bluebird';
import mongoose from 'mongoose';
import httpStatus from 'http-status';

import idPlugin from './plugins/id';
import createdPlugin from './plugins/created';
import updatedPlugin from './plugins/updated';
import uuidRegex from '../utils/uuid';
import APIError from '../helpers/APIError';

/**
 * Entity Storage Schema
 */
const EntitySchema = new mongoose.Schema({
  username: {
    type: String,
    required: true
  },
  domain: {
    type: String,
    required: true
  },
  passwordHash: String,
  passwordSalt: String,
  contactId: {
    type: String,
    match: [uuidRegex, 'The value of path {PATH} ({VALUE}) is not a valid UUID.'],
    ref: 'Document'
  },
  keypair: {
    public: {
      type: String,
      required: true
    },
    private: String,
    recovery: String
  },
  authoritative: {
    type: Boolean,
    default: false
  },
  admin: {
    type: Boolean,
    default: false
  }
});

EntitySchema.plugin(idPlugin);
EntitySchema.plugin(createdPlugin);
EntitySchema.plugin(updatedPlugin);
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
EntitySchema.virtual('id')
 .get(function () {
   return this._id;
 })
 .set(function (v) {
   this._id = v;
 });

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
   * Get entity by Sylow UUID
   * @param {String} id - The id of entity.
   * @returns {Promise<Entity, APIError>}
   */
  get(id) {
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
