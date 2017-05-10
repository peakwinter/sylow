import Promise from 'bluebird';
import mongoose from 'mongoose';
import httpStatus from 'http-status';
import uuidV4 from 'uuid/v4';

import APIError from '../helpers/APIError';
import uuidRegex from '../utils/uuid';

/**
 * Document Storage Schema
 */
const DocumentSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    default: uuidV4,
    match: [uuidRegex, 'The value of path {PATH} ({VALUE}) is not a valid UUID.']
  },
  entityId: {
    type: String,
    required: true
  },
  created: {
    type: Date,
    required: true,
    default: Date.now
  },
  updated: {
    type: Date,
    default: Date.now
  },
  contentType: {
    type: String,
    required: true
  },
  version: {
    type: Number,
    default: 1,
    required: true
  },
  public: {
    type: Boolean,
    default: false
  },
  diffed: {
    type: Boolean,
    default: false
  },
  encryption: {
    type: String,
    required: true,
    default: 'base64'
  },
  summary: {
    contentType: {
      type: String,
      default: 'text/plain'
    },
    encoding: {
      type: String,
      enum: ['url', 'base64', 'uuid', 'plain'],
      default: 'plain'
    },
    data: String
  },
  data: Object,
  references: Object,
  mentions: Object,
  tags: Array,
  key: String
});

/**
 * Add your
 * - pre-save hooks
 * - validations
 * - virtuals
 */

/**
 * Methods
 */
DocumentSchema.method({
});

/**
 * Statics
 */
DocumentSchema.statics = {
  /**
   * Get document by Mongo object ID
   * @param {ObjectId} id - The objectId of document.
   * @returns {Promise<Document, APIError>}
   */
  getByObjectId(id) {
    return this.findById(id)
      .exec()
      .then((user) => {
        if (user) {
          return user;
        }
        const err = new APIError('No such document exists!', httpStatus.NOT_FOUND);
        return Promise.reject(err);
      });
  },

  /**
   * Get document by Sylow UUID
   * @param {String} id - The id of document.
   * @returns {Promise<Document, APIError>}
   */
  get(id) {
    return this.findOne({ id })
      .exec()
      .then((user) => {
        if (user) {
          return user;
        }
        const err = new APIError('No such document exists!', httpStatus.NOT_FOUND);
        return Promise.reject(err);
      });
  },

  /**
   * List documents in descending order of 'created' timestamp.
   * @param {number} skip - Number of documents to be skipped.
   * @param {number} limit - Limit number of documents to be returned.
   * @returns {Promise<Document[]>}
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
 * @typedef Document
 */
const DocumentModel = mongoose.model('Document', DocumentSchema);
export { DocumentModel as default, DocumentSchema };
