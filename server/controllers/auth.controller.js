import jwt from 'jsonwebtoken';
import httpStatus from 'http-status';
import { Request, Response } from 'oauth2-server';

import Client from '../models/client.model';
import APIError from '../helpers/APIError';
import config from '../../config/config';
import { oauth } from '../../config/express';


// sample user, used for authentication
const users = {
  react: {
    username: 'react',
    passwordHash: '0f04a285f6554e97fbbd2d0faf180eeb9db3e90388d0f3570ab8e6e1db7ba9ac088b41e1ba66e65ab39aa6124f69879d48ef8f771c475a945687f55d1a5695bd',
    passwordSalt: '9b02e8d16d99533a1063b9fb554d8380'
  }
};

/**
 * Returns jwt token if valid username and password is provided
 * @param req
 * @param res
 * @param next
 * @returns {*}
 */
function login(req, res, next) {
  // Ideally you'll fetch this from the db
  // Idea here was to show how jwt works with simplicity
  const user = users[req.body.username];
  if (!!user && req.body.passwordHash === user.passwordHash) {
    const token = jwt.sign({
      username: user.username
    }, config.jwtSecret);
    return res.json({
      token,
      username: user.username
    });
  }

  const err = new APIError('Authentication error', httpStatus.UNAUTHORIZED, true);
  return next(err);
}

/**
 * Returns the salt for a given user.
 * @param req
 * @param res
 * @param next
 * @returns {*}
 */
function getSalt(req, res, next) {
  if (req.query.username in users) {
    return res.json({
      salt: users[req.query.username].passwordSalt
    });
  }

  const err = new APIError('User not found', httpStatus.NOT_FOUND, true);
  return next(err);
}

/**
 * This is a protected route. Will return random number only if jwt token is provided in header.
 * @param req
 * @param res
 * @returns {*}
 */
function getRandomNumber(req, res) {
  // req.user is assigned by jwt middleware if valid token is provided
  return res.json({
    num: Math.random() * 100
  });
}

function getToken(req, res, next) {
  const request = new Request(req);
  const response = new Response(res);

  oauth.token(request, response)
    .then(token => res.json(token))
    .catch(err => next(err));
}

function getAuthorize(req, res, next) {
  return Client.findOne({
    clientId: req.query.client_id,
    redirectUri: req.query.redirect_uri,
  })
    .then((client) => {
      if (!client) {
        const err = new APIError('Client not found', httpStatus.NOT_FOUND, true);
        return next(err);
      }
      return res.render('authorize', { client });
    })
    .catch(err => next(err));
}

function postAuthorize(req, res, next) {
  const request = new Request(req);
  const response = new Response(res);

  return oauth.authorize(request, response)
    .then(success => res.json(success))
    .catch(err => next(err));
}

function authenticate(options) {
  return (req, res, next) => {
    const request = new Request({
      headers: { authorization: req.headers.authorization },
      method: req.method,
      query: req.query,
      body: req.body
    });
    const response = new Response(res);

    oauth.authenticate(request, response, options)
      .then((token) => {
        // Request is authorized.
        req.user = token;  // eslint-disable-line no-param-reassign
        next();
      })
      .catch(err => next(err));
  };
}

export default {
  login,
  getAuthorize,
  postAuthorize,
  authenticate,
  getSalt,
  getToken,
  getRandomNumber
};
