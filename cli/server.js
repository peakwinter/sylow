#!/usr/bin/env node
/* eslint-env node */
/* eslint-disable no-console */

const readline = require('readline');
const mongoose = require('mongoose');
const uuidV4 = require('uuid/v4');
const fs = require('fs');

const utils = require('./util');

const serverSchema = {
  _id: { type: String, required: true, default: uuidV4 },
  name: { type: String },
  domain: { type: String, required: true },
  description: { type: String },
  contacted: { type: Date, default: Date.now },
  keypair: { 
    private: { type: String },
    public : { type: String, required: true }
  },
  authoritative: { type: Boolean, default: false },
  created: { type: Date, default: Date.now, required: true },
  updated: { type: Date, default: Date.now }
};

function createServer(datas) {
  return new Promise((fulfill, error) => {
    const Server = mongoose.model('Server', serverSchema);
    if(datas.authoritative) {
      fulfill(Server.create(datas));
    } else {
      return error('The server isn\'t authoritative...');
    }
  });
}

module.exports.newServer = function (domain, publicKeyFile, options) {
  utils.mongooseConnect();
  const validOptions = ['name', 'description', 'authoritative', 'privateKeyFile'];
  
  if (!domain) {
    console.error('Domain missing');
    process.exit(1);
  } else if (!publicKeyFile) {
    console.error('Public key file path missing');
    process.exit(1);
  }
 
  let publicKey = fs.readFileSync(publicKeyFile, 'utf8');
  let privateKey = options.privateKeyFile ? fs.readFileSync(options.privateKeyFile, 'utf8') : null;

  let keypair = {
    public: publicKey,
    private: privateKey
  }

  let finalDatas = { 
    domain, publicKeyFile, keypair
  }

  validOptions.forEach(function(i) {
    if(options[i] && typeof options[i] !== 'function') {
      finalDatas[i] = options[i];
    }
  });
  createServer(finalDatas) 
    .then(() => {
        console.log('Success !');
        process.exit(0);
      })
    .catch((e) => {
      console.error(e);
      process.exit(1);
    });
};
