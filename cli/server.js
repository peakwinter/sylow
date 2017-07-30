#!/usr/bin/env node
/* eslint-env node */
/* eslint-disable object-shorthand */
/* eslint-disable func-names */
/* eslint-disable prefer-arrow-callback */
/* eslint-disable no-console */

const fs = require('fs');
const mongoose = require('mongoose');
const uuidV4 = require('uuid/v4');

const utils = require('./util');

const serverSchema = {
  _id: { type: String, required: true, default: uuidV4 },
  name: { type: String },
  domain: { type: String, required: true },
  description: { type: String },
  contacted: { type: Date, default: Date.now },
  keypair: {
    private: { type: String },
    public: { type: String, required: true }
  },
  authoritative: { type: Boolean, default: false },
  created: { type: Date, default: Date.now, required: true },
  updated: { type: Date, default: Date.now }
};

function createServer(datas) {
  return new Promise((resolve, reject) => {
    const Server = mongoose.model('Server', serverSchema);
    Server
      .findOne({ authoritative: true })
      .exec()
      . then((server) => {
        if (server) {
          return reject('An authoritative server already exists...');
        }
        return resolve(Server.create(datas));
      });
  });
}

function getAuthoritative() {
  return new Promise((resolve, reject) => {
    const Server = mongoose.model('Server', serverSchema);
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
  newServer: function (domain, publicKeyFile, privateKeyFile, options) {
    utils.mongooseConnect();
    const validOptions = ['name', 'description'];
    if (!domain) {
      console.error('Domain missing');
      process.exit(1);
    } else if (!publicKeyFile) {
      console.error('Public key file path missing');
      process.exit(1);
    } else if (!privateKeyFile) {
      console.error('Private key file path missing');
      process.exit(1);
    }

    const publicKey = fs.readFileSync(publicKeyFile, 'utf8');
    const privateKey = fs.readFileSync(privateKeyFile, 'utf8');

    const keypair = {
      public: publicKey,
      private: privateKey
    };

    const finalDatas = {
      domain, publicKeyFile, keypair
    };

    validOptions.forEach(function (i) {
      if (options[i] && typeof options[i] !== 'function') {
        finalDatas[i] = options[i];
      }
    });
    finalDatas.authoritative = true;
    createServer(finalDatas)
      .then(() => {
        console.log('Success!');
        process.exit(0);
      })
      .catch((e) => {
        console.error(e);
        process.exit(1);
      });
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
  }
};
