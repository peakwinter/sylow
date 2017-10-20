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
    public: String
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
ServerSchema.pre('save', function (done) {
  if (this.authoritative && !this.keypair.public && !this.keypair.private) {
    generateRsa((err, keypair) => {
      if (err) {
        done(new Error(err));
      }
      Object.assign(this.keypair, keypair);
      done();
    });
  } else {
    done();
  }
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
  list({ skip = 0, limit = 50, showKeys = false } = {}) {
    const findServers = this.find()
      .sort({ created: -1 })
      .skip(+skip)
      .limit(+limit);

    if (!showKeys) {
      findServers.select('-keypair');
    }
    return findServers.exec();
  },

  /**
   * Create and return an authoritative server
   * @returns {Promise<Server>}
   */
  createAuthoritative() {
    const datas = {
      authoritative: true,
      keypair: {
        public: null,
        private: null
      }
    };

    if (config.domain) {
      Object.assign(datas, {
        domain: config.domain
      });
    } else if (config.env === 'test') {
      Object.assign(datas, {
        name: 'Sylow Test Server',
        domain: 'sylow.dev'
      });
    }
    const newServer = new this(datas);
    return newServer.save()
      .then(savedServer => savedServer)
      .catch(() => Promise.reject(new Error('I cannot start, authoritative server and SY_DOMAIN not found. Please run \'cli/sylow new-server\' or set SY_DOMAIN in .env file')));
  },

  /**
   * Return the server marked as authoritative
   * @returns {Promise<Server>}
   */
  getAuthoritative() {
    return this.findOne({ authoritative: true })
      .select('-keypair.private')
      .exec()
      .then((server) => {
        if (server) {
          return Promise.resolve(server);
        }
        return Promise.reject(new Error('No authoritative server found'));
      });
  }
};

/**
 * @typedef Server
 */
export default mongoose.model('Server', ServerSchema);
