import httpStatus from 'http-status';
import passport from 'passport';
import ceLogin from 'connect-ensure-login';
import { Strategy as LocalStrategy } from 'passport-local';
import { BasicStrategy } from 'passport-http';
import { Strategy as ClientPasswordStrategy } from 'passport-oauth2-client-password';
import { Strategy as BearerStrategy } from 'passport-http-bearer';

import AccessToken from '../models/accessToken.model';
import Client from '../models/client.model';
import Entity from '../models/entity.model';
import AdminError from '../helpers/AdminError';
import APIError from '../helpers/APIError';


passport.use(new LocalStrategy({ passwordField: 'passwordHash' },
  (username, passwordHash, done) =>
    Entity.findOne({ username })
      .then((entity) => {
        if (!entity) {
          return done(null, false);
        }
        if (passwordHash !== entity.passwordHash) {
          return done(null, false);
        }
        return done(null, entity);
      })
      .catch(err => done(err))
));

passport.use(new BasicStrategy((username, passwordHash, done) =>
  Entity.findOne({ username })
    .then((entity) => {
      if (!entity || entity.passwordHash !== passwordHash) {
        return done(null, false);
      }
      return done(null, entity);
    })
));

passport.use(new ClientPasswordStrategy((clientId, clientSecret, done) =>
  Client.findOne({ clientId })
    .then((client) => {
      if (!client || client.clientSecret !== clientSecret) {
        return done(null, null);
      }
      return done(null, client);
    })
    .catch(err => done(err))
));

passport.use(new BearerStrategy((token, done) =>
  AccessToken.findOne({ token })
    .populate('client')
    .then((accessToken) => {
      if (!accessToken || !accessToken.client) return done(null, null);
      return done(null, accessToken.client, { scope: '*', isClient: true });
    })
    .catch(err => done(err))
));

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

export function ensureAdmin(req, res, next) {
  if (!req.user || !req.user.admin) {
    const err = new AdminError('Entity does not have sufficient rights', httpStatus.FORBIDDEN, true);
    return next(err);
  }
  return next();
}

export const authenticate = passport.authenticate(['basic', 'local'], {
  successReturnToOrRedirect: '/', failureRedirect: '/login', failureFlash: 'Invalid username or password.'
});
export const authenticateBasic = passport.authenticate('basic');
export const authenticateBasicNoSession = passport.authenticate('basic', { session: false });
export const authenticateUser = ceLogin.ensureLoggedIn();
export const authenticateOAuth = passport.authenticate('bearer', { session: false });
export const authenticateClient = passport.authenticate(['basic', 'oauth2-client-password'], { session: false });

export function login(req, res) {
  return res.render('login');
}

export function logout(req, res) {
  req.logout();
  res.redirect('/');
}

/**
 * Returns the salt for a given user.
 * @param req
 * @param res
 * @param next
 * @returns {*}
 */
export function getSalt(req, res, next) {
  Entity.findOne({ username: req.query.username })
    .then((entity) => {
      if (entity) {
        return res.json({
          salt: entity.passwordSalt
        });
      }
      const err = new APIError('Entity not found', httpStatus.NOT_FOUND, true);
      return next(err);
    });
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
