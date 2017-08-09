#!/usr/bin/env node
/* eslint-env node */
/* eslint-disable object-shorthand */
/* eslint-disable func-names */
/* eslint-disable prefer-arrow-callback */
/* eslint-disable no-console */

const fs = require('fs');
const mongoose = require('mongoose');
const uuidV4 = require('uuid/v4');
const forge = require('node-forge');

const utils = require('./util');

const forgePki = forge.pki;
const forgeRsa = forge.pki.rsa;

const serverSchema = {
  _id: { type: String, required: true, default: uuidV4 },
  name: { type: String },
  domain: { type: String, required: true },
  description: { type: String },
  contacted: { type: Date, default: Date.now },
  keypair: {
    private: { type: String },
    public: { type: String }
  },
  authoritative: { type: Boolean, default: false },
  created: { type: Date, default: Date.now, required: true },
  updated: { type: Date, default: Date.now }
};

const Server = mongoose.model('Server', serverSchema);

function generateRsa(cb) {
  return forgeRsa.generateKeyPair({ bits: 2048, workers: -1 }, function (err, keypair) {
    if (err) {
      return cb(err);
    }
    return cb(null, {
      private: forgePki.privateKeyToPem(keypair.privateKey),
      public: forgePki.publicKeyToPem(keypair.publicKey)
    });
  });
}

function createServer(datas) {
  return new Promise((resolve, reject) => {
    Server
      .findOne({ authoritative: true })
      .exec()
      .then((server) => {
        if (server) {
          return reject('An authoritative server already exists...');
        }
        return resolve(Server.create(datas));
      });
  });
}

function getAuthoritative() {
  return new Promise((resolve, reject) => {
    Server
      .findOne({ authoritative: true })
      .exec()
      .then((server) => {
        if (server) {
          return resolve(server);
        }
        return reject('No authoritative server was found...');
      })
      .catch(err => reject(err));
  });
}

module.exports = {
  newServer: function (domain, options) {
    utils.mongooseConnect();
    const validOptions = ['name', 'description'];
    if (!domain) {
      console.error('Domain missing');
      process.exit(1);
    }

    const finalDatas = {
      domain,
      keypair: {
        public: null,
        private: null
      }
    };
    validOptions.forEach(function (i) {
      if (options[i] && typeof options[i] !== 'function') {
        finalDatas[i] = options[i];
      }
    });
    finalDatas.authoritative = true;

    if (options.publickeyFile && options.privatekeyFile) {
      finalDatas.keypair = {
        public: fs.readFileSync(options.publickeyFile, 'utf8'),
        private: fs.readFileSync(options.privatekeyFile, 'utf8')
      };
      createServer(finalDatas)
        .then(() => {
          console.log('Success!');
          process.exit(0);
        })
        .catch((e) => {
          console.error(e);
          process.exit(1);
        });
    } else {
      generateRsa(function (err, keypair) {
        if (err) {
          console.error(err);
          process.exit(1);
        }
        finalDatas.keypair = keypair;
        createServer(finalDatas)
          .then(() => {
            console.log('Success!');
            process.exit(0);
          })
          .catch((e) => {
            console.error(e);
            process.exit(1);
          });
      });
    }
  },

  exportServer: function (options) {
    utils.mongooseConnect();
    let targetFile = options.file ? options.file : 'server.json';
    targetFile = targetFile.endsWith('.json') ? targetFile : targetFile.concat('.json');
    getAuthoritative()
      .then((server) => {
        fs.writeFile(targetFile, JSON.stringify(server), (err) => {
          if (err) {
            console.log(err);
            process.exit(1);
          }
          console.log(`Server records saved in ${targetFile}`);
          process.exit(0);
        });
      })
      .catch((err) => {
        console.log(err);
        process.exit(1);
      });
  },

  editServer: function (options) {
    utils.mongooseConnect();
    const validOptions = ['name', 'domain'];

    const finalDatas = {};
    validOptions.forEach(function (i) {
      if (options[i] && typeof options[i] !== 'function') {
        finalDatas[i] = options[i];
      }
    });
    if (options.publickeyFile || options.privatekeyFile) {
      finalDatas.keypair = {};
      if (options.publickeyFile) {
        const pk = fs.readFileSync(options.publickeyFile, 'utf-8');
        Object.assign(finalDatas.keypair, { public: pk });
      }
      if (options.privatekeyFile) {
        const pk = fs.readFileSync(options.privatekeyFile, 'utf-8');
        Object.assign(finalDatas.keypair, { private: pk });
      }
    }

    getAuthoritative()
      .then((server) => {
        Server
          .findOneAndUpdate({ _id: server._id }, finalDatas, { new: true })
          .then(() => {
            console.log('The server has been updated');
            process.exit(0);
          })
          .catch((err) => {
            console.error(err);
            process.exit(1);
          });
      })
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
  }
};
