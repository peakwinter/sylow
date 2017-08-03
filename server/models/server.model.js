import mongoose from 'mongoose';
import Promise from 'bluebird';
import httpStatus from 'http-status';

import idPlugin from './plugins/id';
import createdPlugin from './plugins/created';
import updatedPlugin from './plugins/updated';
import APIError from '../helpers/APIError';
import config from '../../config/config';
import generateRsa from '../helpers/Encrypt';

/**
 * Server Storage Schema
 */
const ServerSchema = new mongoose.Schema({
  domain: {
    type: String,
    required: true
  },
  name: {
    type: String
  },
  description: {
    type: String
  },
  contacted: {
    type: Date,
    default: Date.now
  },
  keypair: {
    private: String,
    public: {
      type: String
    }
  },
  authoritative: {
    type: Boolean,
    default: false
  }
});

ServerSchema.plugin(idPlugin);
ServerSchema.plugin(createdPlugin);
ServerSchema.plugin(updatedPlugin);
ServerSchema.set('toJSON', { virtuals: true });

/**
 * Add your
 * - pre-save hooks
 * - validations
 * - virtuals
 */

/* eslint-disable func-names */
ServerSchema.pre('save', function (next, done) {
  const self = this;
  if (self.authoritative && (self.keypair.public === null && self.keypair.private === null)) {
    generateRsa((err, keypair) => {
      if (err) {
        next(new Error(err));
      }
      Object.assign(this.keypair, keypair);
      done();
    });
  }
  next();
});
/* eslint-enable */

/**
 * Methods
 */
ServerSchema.method({
});

/**
 * Virtuals
 */

 /* eslint-disable func-names */
ServerSchema.virtual('id')
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
ServerSchema.statics = {
  /**
   * Get server by UUID
   * @param {String} id - The id of a server.
   * @returns {Promise<Server, APIError>}
   */
  get(id) {
    return this.findById(id)
      .exec()
      .then((server) => {
        if (server) {
          return server;
        }
        const err = new APIError('No such server exists!', httpStatus.NOT_FOUND);
        return Promise.reject(err);
      });
  },

  /**
   * List servers in descending order of 'created' timestamp.
   * @param {number} skip - Number of servers to be skipped.
   * @param {number} limit - Limit number of servers to be returned.
   * @returns {Promise<Server[]>}
   */
  list({ skip = 0, limit = 50 } = {}) {
    return this.find()
      .sort({ created: -1 })
      .skip(+skip)
      .limit(+limit)
      .exec();
  },

  /**
   * Return the server marked as authoritative
   * @returns {Promise<Server>}
   */
  getAuthoritative() {
    return this.findOne({ authoritative: true })
      .exec()
      .then((server) => {
        if (server) {
          return server;
        } else if (config.env === 'test') {
          const datas = {
            name: 'Sylow Test Server',
            domain: 'sylow.dev',
            authoritative: true,
            keypair: {
              public: 'xxxxx',
              private: 'xxxxx'
            }
          };
          const newServer = new this(datas);
          return newServer.save()
            .then(savedServer => savedServer)
            .catch(err => Promise.reject(err));
        }
        return null;
      });
  }
};

/**
 * @typedef Server
 */
export default mongoose.model('Server', ServerSchema);
