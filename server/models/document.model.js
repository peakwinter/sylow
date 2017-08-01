import Promise from 'bluebird';
import mongoose from 'mongoose';
import httpStatus from 'http-status';

import idPlugin from './plugins/id';
import createdPlugin from './plugins/created';
import updatedPlugin from './plugins/updated';
import APIError from '../helpers/APIError';

/**
 * Document Storage Schema
 */
const DocumentSchema = new mongoose.Schema({
  entityId: {
    type: String,
    index: true,
    required: true,
    ref: 'Entity'
  },
  contentType: {
    type: String,
    index: true,
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
  tags: Object,
  key: String
});

DocumentSchema.plugin(idPlugin);
DocumentSchema.plugin(createdPlugin);
DocumentSchema.plugin(updatedPlugin);
DocumentSchema.set('toJSON', { virtuals: true });

/**
 * Add your
 * - pre-save hooks
 * - validations
 * - virtuals
 */

/**
 * Virtuals
 */

 /* eslint-disable func-names */
DocumentSchema.virtual('id')
  .get(function () {
    return this._id;
  })
  .set(function (v) {
    this._id = v;
  });
/* eslint-enable */

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
   * Get document by Sylow UUID
   * @param {String} id - The id of document.
   * @returns {Promise<Document, APIError>}
   */
  get(id) {
    return this.findById(id)
      .exec()
      .then((user) => {
        if (user) {
          return user;
        }
        const err = new APIError('No such document exists!', httpStatus.NOT_FOUND);
        return Promise.reject(err);
      });
  }
};

/**
 * @typedef Document
 */
const DocumentModel = mongoose.model('Document', DocumentSchema);
export { DocumentModel as default, DocumentSchema };
