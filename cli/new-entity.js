#!/usr/bin/env node
/* eslint-env node */
/* eslint-disable no-console */

const readline = require('readline');
const mongoose = require('mongoose');
const uuidV4 = require('uuid/v4');
const utils = require('./util');

const entitySchema = {
  _id: { type: String, required: true, default: uuidV4 },
  username: { type: String, required: true },
  domain: { type: String, required: true },
  passwordHash: String,
  passwordSalt: String,
  authoritative: { type: Boolean, default: false },
  admin: { type: Boolean, default: false },
  created: { type: Date, default: Date.now, required: true },
  updated: { type: Date, default: Date.now }
};

function rlFactory(prompt) {
  return readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt
  });
}

function createEntity(username, domain, password, admin) {
  const passwordSalt = utils.generateSalt();
  return utils.scrypt(password, passwordSalt, (passwordHash) => {
    const Entity = mongoose.model('Entity', entitySchema);
    return Entity.create({ username, domain, passwordSalt, passwordHash, admin });
  });
}


module.exports = function newEntity(username, domain, admin) {
  utils.mongooseConnect();

  if (!username) {
    console.error('Name missing');
    process.exit(1);
  } else if (!domain) {
    console.error('Domain missing');
    process.exit(1);
  }

  let password;
  let passwordConfirm;

  const pwPrompt = rlFactory('Password: ');
  pwPrompt.prompt();
  pwPrompt.on('line', (pwd) => {
    password = pwd;
    pwPrompt.close();
  })
    .on('close', () => {
      const pwConfPrompt = rlFactory('Confirm: ');
      pwConfPrompt.prompt();
      pwConfPrompt.on('line', (pwdconf) => {
        passwordConfirm = pwdconf;
        pwConfPrompt.close();
      })
        .on('close', () => {
          if (password !== passwordConfirm) {
            console.error('Passwords did not match.');
            process.exit(1);
          }

          createEntity(username, domain, password, admin)
            .then(() => {
              console.log('Entity saved.');
              process.exit(0);
            })
            .catch((e) => {
              console.error(e.message);
              process.exit(1);
            });
        });
    });
};
