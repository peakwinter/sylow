import httpStatus from 'http-status';
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { BasicStrategy } from 'passport-http';
import { Strategy as ClientPasswordStrategy } from 'passport-oauth2-client-password';
import { Strategy as BearerStrategy } from 'passport-http-bearer';

import AccessToken from '../models/accessToken.model';
import Client from '../models/client.model';
import Entity from '../models/entity.model';
import APIError from '../helpers/APIError';


// sample user, used for authentication
const users = {
  react: {
    username: 'react',
    passwordHash: '0f04a285f6554e97fbbd2d0faf180eeb9db3e90388d0f3570ab8e6e1db7ba9ac088b41e1ba66e65ab39aa6124f69879d48ef8f771c475a945687f55d1a5695bd',
    passwordSalt: '9b02e8d16d99533a1063b9fb554d8380'
  }
};

export function login(req, res) {
  return res.render('login');
}

/**
 * Returns the salt for a given user.
 * @param req
 * @param res
 * @param next
 * @returns {*}
 */
export function getSalt(req, res, next) {
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
export function getRandomNumber(req, res) {
  // req.user is assigned by jwt middleware if valid token is provided
  return res.json({
    num: Math.random() * 100
  });
}

passport.use(new LocalStrategy({ passwordField: 'passwordHash' },
  (username, passwordHash, done) => {
    Entity.findOne({ username }, (err, entity) => {
      if (err) { return done(err); }
      if (!entity) {
        return done(null, false, { message: 'Incorrect username.' });
      }
      if (passwordHash !== entity.passwordHash) {
        return done(null, false, { message: 'Incorrect password.' });
      }
      return done(null, entity);
    });
  }
));

passport.use(new BasicStrategy((username, passwordHash, done) => {
  Entity.findOne({ username })
    .then((entity) => {
      if (!entity || entity.passwordHash !== passwordHash) {
        return done(null, false);
      }
      return done(null, entity);
    });
}));

passport.use(new ClientPasswordStrategy((clientId, clientSecret, done) => {
  Client.findOne({ clientId })
    .then((client) => {
      if (!client || client.clientSecret !== clientSecret) {
        return done(null, null);
      }
      return done(null, client);
    })
    .catch(err => done(err));
}));

passport.use(new BearerStrategy((token, done) => {
  AccessToken.findOne({ token })
    .populate('client')
    .then((accessToken) => {
      if (!accessToken || !accessToken.client) return done(null, null);
      return done(null, accessToken.client, { scope: '*', isClient: true });
    })
    .catch(err => done(err));
}));

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

export function isLoggedIn(req, res, next) {
  if (req.isAuthenticated && req.isAuthenticated()) {
    return next();
  }
  return res.redirect('/login');
}

export const authenticate = passport.authenticate(['basic', 'local'], { successReturnToOrRedirect: '/', failureRedirect: '/login' });
export const authenticateOAuth = passport.authenticate('bearer', { session: false });
export const authenticateClient = passport.authenticate(['basic', 'oauth2-client-password'], { session: false });
