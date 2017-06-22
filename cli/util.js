const mongoose = require('mongoose');
const dotenv = require('dotenv');
const dotenvExpand = require('dotenv-expand');
const crypto = require('crypto');
const util = require('util');
const debug = require('debug')('sylow:cli');

const scryptAsync = require('scrypt-async');

// make bluebird default Promise
Promise = require('bluebird'); // eslint-disable-line no-global-assign

module.exports = {
  mongooseConnect() {
    // plugin bluebird promise in mongoose
    mongoose.Promise = Promise;

    const myEnv = dotenv.config();
    dotenvExpand(myEnv);
    const envConfig = Object.create(myEnv.parsed);

    const mongooseDebug = process.env.NODE_ENV === 'development';

    if (!envConfig.MONGO_HOST) {
      throw new Error('MONGO_HOST is not set, and was not found in a .env file.');
    }

    // connect to mongo db
    mongoose.connect(envConfig.MONGO_HOST, { server: { socketOptions: { keepAlive: 1 } } });
    mongoose.connection.on('error', () => {
      throw new Error(`unable to connect to database: ${envConfig.MONGO_HOST}`);
    });

    // print mongoose logs in dev env
    if (mongooseDebug) {
      mongoose.set('debug', (collectionName, method, query, doc) => {
        debug(`${collectionName}.${method}`, util.inspect(query, false, 20), doc);
      });
    }
  },

  generateSalt() {
    return crypto.randomBytes(8).toString('hex');
  },

  scrypt(pwd, salt, cb) {
    const options = {
      N: 16384, r: 8, dkLen: 64, encoding: 'hex'
    };
    return scryptAsync(pwd, salt, options, cb);
  },
};
