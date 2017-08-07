import mongoose from 'mongoose';
import util from 'util';

// config should be imported before importing any other file
import config from './config/config';
import app from './config/express';

import Server from './server/models/server.model';


const debug = require('debug')('sylow:index');

// make bluebird default Promise
Promise = require('bluebird'); // eslint-disable-line no-global-assign

// plugin bluebird promise in mongoose
mongoose.Promise = Promise;

// connect to mongo db
const mongoUri = config.mongo.host;
mongoose.connect(mongoUri, { server: { socketOptions: { keepAlive: 1 } } });
mongoose.connection.on('error', () => {
  throw new Error(`unable to connect to database: ${mongoUri}`);
});

// print mongoose logs in dev env
if (config.MONGOOSE_DEBUG) {
  mongoose.set('debug', (collectionName, method, query, doc) => {
    debug(`${collectionName}.${method}`, util.inspect(query, false, 20), doc);
  });
}

// module.parent check is required to support mocha watch
// src: https://github.com/mochajs/mocha/issues/1912
if (!module.parent) {
  // check for authoritative server record presence. if not, prevent startup
  Server
    .getAuthoritative()
    .then((server) => {
      if (server) {
        if (config.domain) {
          console.log('\x1b[33m', 'SY_DOMAIN was set, but I already have an authoritative server that I must use. To edit the autoritative server, please use the CLI.');
        }
        Object.assign(app, { sylowServer: server.domain });
        // listen on port config.port
        app.listen(config.port, () => {
          console.info(`server started on port ${config.port} (${config.env})`); // eslint-disable-line no-console
        });
      } else {
        throw new Error('Authoritative server not found. Please run `cli/sylow new-server`.');
      }
    })
    .catch((err) => {
      console.error(err.message); // eslint-disable-line no-console
      process.exit(1);
    });
} else {
  Object.assign(app, { sylowServer: 'testDomain' });
}

export default app;
