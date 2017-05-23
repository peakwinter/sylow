import httpStatus from 'http-status';

import APIError from './APIError';
import AccessToken from '../models/accessToken.model';
import Client from '../models/client.model';
import Entity from '../models/entity.model';


const authorizationCodes = {};


export function getAccessToken(token) {
  return AccessToken.findOne({ token, tokenType: 'access' })
    .then((accessToken) => {
      if (!accessToken) return false;
      return Promise.all([
        accessToken,
        Client.get(accessToken.clientId),
        Entity.get(accessToken.entityId)
      ]);
    })
    .then(([accessToken, client, entity]) => {
      if (!accessToken || !client || !entity) return false;
      return {
        accessToken: accessToken.token,
        accessTokenExpiresAt: accessToken.expiresAt,
        scope: accessToken.scope,
        client: client.toJSON(),
        user: entity.toJSON()
      };
    });
}

export function getRefreshToken(token) {
  return AccessToken.findOne({ token, tokenType: 'refresh' })
    .then(refreshToken =>
      Promise.all([
        refreshToken,
        Client.get(refreshToken.clientId),
        Entity.get(refreshToken.entityId)
      ])
    )
    .then(([refreshToken, client, entity]) => (
      {
        refreshToken: refreshToken.refreshToken,
        scope: refreshToken.scope,
        user: entity,
        client
      }
    ));
}

export function getAuthorizationCode(code) {
  if (code in authorizationCodes) {
    const authorizationCode = authorizationCodes[code];
    return Promise.all([
      Client.get(authorizationCode.clientId),
      Entity.get(authorizationCode.entityId)
    ])
      .then(([client, entity]) => (
        {
          code: authorizationCode.code,
          expiresAt: authorizationCode.expiresAt,
          redirectUri: authorizationCode.redirectUri,
          scope: authorizationCode.scope,
          client: client.toJSON(),
          user: entity.toJSON()
        }
      ));
  }
  return undefined;
}

export function getClient(clientId, clientSecret) {
  const query = { clientId };
  if (clientSecret) {
    query.clientSecret = clientSecret;
  }
  return Client.findOne(query)
    .then((client) => {
      if (!client) {
        const err = new APIError('Client not found', httpStatus.NOT_FOUND, true);
        return Promise.reject(err);
      }
      const data = client.toJSON();
      data.grants = ['authorization_code', 'password', 'refresh_token', 'client_credentials'];
      data.redirectUris = [client.redirectUri];
      delete data.redirectUri;
      return data;
    });
}

export function getUser(username, password) {
  return Entity.findOne({ username })
    .then((entity) => {
      if (!entity) {
        const err = new APIError('Entity not found', httpStatus.NOT_FOUND, true);
        return Promise.reject(err);
      }
      if (password === entity.passwordHash) {
        return entity.toJSON();
      }
      return undefined;
    });
}

export function getUserFromClient(client) {
  return Entity.get(client.entityId)
    .then(entity => entity.toJSON());
}

export function saveToken(token, client, entity) {
  const promises = [];
  const accessToken = new AccessToken({
    token: token.accessToken,
    expiresAt: token.accessTokenExpiresAt,
    scope: token.scope,
    clientId: client.id,
    entityId: entity.id
  });
  promises.push(accessToken.save());

  if (token.refreshToken) {
    const refreshToken = new AccessToken({
      token: token.refreshToken,
      tokenType: 'refresh',
      expiresAt: token.refreshTokenExpiresAt,
      clientId: client.id,
      entityId: entity.id
    });
    promises.push(refreshToken.save());
  }

  return Promise.all(promises)
    .then(() => (
      {
        client,
        user: entity,
        accessToken: token.accessToken, // proxy
        refreshToken: token.refreshToken, // proxy
        access_token: token.accessToken,
        refresh_token: token.refresh_token,
      }
    ));
}

export function saveAuthorizationCode(code, client, entity) {
  const authCode = {
    code: code.authorizationCode,
    expiresAt: code.expiresAt,
    redirectUri: code.redirectUri,
    scope: code.scope,
    clientId: client.id,
    entityId: entity.id
  };
  authorizationCodes[code.authorizationCode] = authCode;

  return {
    authorizationCode: authCode.code,
    expiresAt: authCode.expiresAt,
    redirectUri: authCode.redirectUri,
    scope: authCode.scope,
    client: { id: authCode.clientId },
    user: { id: authCode.entityId }
  };
}

export function revokeToken(token) {
  return AccessToken.find({ token, tokenType: 'refresh' })
    .then(accessToken =>
      accessToken.remove()
        .then(() => true)
        .catch(() => false)
    );
}

export function revokeAuthorizationCode(code) {
  if (!(code.code in authorizationCodes)) {
    return false;
  }
  delete authorizationCodes[code.code];
  return true;
}

export function verifyScope(token, scope) {
  if (!token.scope) {
    return false;
  }
  const requestedScopes = scope.split(' ');
  const authorizedScopes = token.scope.split(' ');
  return requestedScopes.every(s => authorizedScopes.includes(s));
}
