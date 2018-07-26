import httpStatus from 'http-status';
import oauth2orize from 'oauth2orize';

import APIError from './APIError';
import { randomStr } from '../utils/random';
import AccessToken from '../models/accessToken.model';
import Client from '../models/client.model';
import Entity from '../models/entity.model';


const oauth = oauth2orize.createServer({ userProperty: 'oauthClient' });
const authorizationCodes = {};

export { oauth as Server };

export function serializeClient(client, done) {
  return done(null, client.clientId);
}

export function deserializeClient(clientId, done) {
  return Client.findOne({ clientId })
    .then((client) => {
      /* istanbul ignore if */
      if (!client) {
        const err = new APIError('Client not found', httpStatus.NOT_FOUND, true);
        return done(err);
      }
      return done(null, client);
    });
}

export function grantAuthorizationCode(client, redirectUri, entity, ares, done) {
  const code = randomStr(16);
  const authCode = {
    clientId: client._id,
    entityId: entity._id,
    scope: ares.scope,
    redirectUri
  };
  authorizationCodes[code] = authCode;
  return done(null, code);
}

export function exchangeAuthorizationCode(client, code, redirectUri, done) {
  if (code in authorizationCodes) {
    const authCode = authorizationCodes[code];
    /* istanbul ignore if */
    if (client.id !== authCode.clientId.toHexString()) return done(null, false);
    if (redirectUri !== authCode.redirectUri) return done(null, false);

    const token = randomStr(256);
    const accessToken = new AccessToken({
      token,
      client: authCode.clientId,
      entity: authCode.entityId,
      scope: authCode.scope
    });

    return accessToken.save()
      .then(() => done(null, token))
      .catch(err => done(err));
  }
  return done(null);
}

export function implicitlyGrantToken(client, entity, ares, done) {
  const token = randomStr(256);
  const accessToken = new AccessToken({
    token,
    entity: entity._id,
    client: client._id
  });

  return accessToken.save()
    .then(() => done(null, token))
    .catch(err => done(err));
}

export function exchangePassword(client, username, passwordHash, scope, done) {
  return Client.findOne({ clientId: client.clientId })
    .then((thisClient) => {
      if (!thisClient) return done(null, false);
      if (thisClient.clientSecret !== client.clientSecret) return done(null, false);
      return Entity.findOne({ username })
        .then((entity) => {
          if (!entity) return done(null, false);
          if (passwordHash !== entity.passwordHash) return done(null, false);
          const token = randomStr(256);
          const accessToken = new AccessToken({
            token,
            entity: entity._id,
            client: client._id
          });
          return accessToken.save()
            .then(() => done(null, token))
            .catch(err => done(err));
        });
    });
}


export const authorization = [
  oauth.authorization((clientId, redirectUri, done) =>
    Client.findOne({ clientId })
      .then((client) => {
        if (!client) return done(null, null, null);
        if (client.redirectUri !== redirectUri) return done(null, null, redirectUri);
        return done(null, client, redirectUri);
      })
      .catch(err => done(err)),
  (client, entity, done) =>
    // if (client.isTrusted) return done(null, true);
    AccessToken.findOne({ entity: entity._id, client: client._id })
      .then((token) => {
        if (token) return done(null, true);
        return done(null, false);
      })
      .catch(err => done(err))
  ),
  (req, res) => {
    res.render('authorize', { transactionId: req.oauth2.transactionID, user: req.user, client: req.oauth2.client });
  },
];

export const decision = [
  oauth.decision((req, done) => done(null, { scope: req.scope }))
];


oauth.serializeClient(serializeClient);
oauth.deserializeClient(deserializeClient);

oauth.grant(oauth2orize.grant.code(grantAuthorizationCode));
oauth.grant(oauth2orize.grant.token(implicitlyGrantToken));
oauth.exchange(oauth2orize.exchange.code(exchangeAuthorizationCode));
oauth.exchange(oauth2orize.exchange.password(exchangePassword));
