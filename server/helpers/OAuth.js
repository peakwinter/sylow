import httpStatus from 'http-status';

import APIError from './APIError';
import AccessToken from '../models/accessToken.model';
import Client from '../models/client.model';
import Entity from '../models/entity.model';


const authorizationCodes = {};


export function getAccessToken(token) {
  return AccessToken.findOne({ token, tokenType: 'access' })
    .populate('client entity')
    .then((accessToken) => {
      if (!accessToken) return false;
      return {
        accessToken: accessToken.token,
        accessTokenExpiresAt: accessToken.expiresAt,
        scope: accessToken.scope,
        client: accessToken.client.toJSON(),
        user: accessToken.entity.toJSON()
      };
    });
}

export function getRefreshToken(token) {
  return AccessToken.findOne({ token, tokenType: 'refresh' })
    .populate('client entity')
    .then((refreshToken) => {
      if (!refreshToken || !refreshToken.client || !refreshToken.entity) return false;
      return {
        refreshToken: refreshToken.refreshToken,
        scope: refreshToken.scope,
        user: refreshToken.entity,
        client: refreshToken.client
      };
    });
}

export function getAuthorizationCode(code) {
  if (code in authorizationCodes) {
    const authorizationCode = authorizationCodes[code];
    return Promise.all([
      Client.get(authorizationCode.client),
      Entity.get(authorizationCode.entity)
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
    client: client._id,
    entity: entity._id
  });
  promises.push(accessToken.save());

  if (token.refreshToken) {
    const refreshToken = new AccessToken({
      token: token.refreshToken,
      tokenType: 'refresh',
      expiresAt: token.refreshTokenExpiresAt,
      client: client._id,
      entity: entity._id
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
      }
    ));
}

export function saveAuthorizationCode(code, client, entity) {
  const authCode = {
    code: code.authorizationCode,
    expiresAt: code.expiresAt,
    redirectUri: code.redirectUri,
    scope: code.scope,
    client: client._id,
    entity: entity._id
  };
  authorizationCodes[code.authorizationCode] = authCode;

  return {
    authorizationCode: authCode.code,
    expiresAt: authCode.expiresAt,
    redirectUri: authCode.redirectUri,
    scope: authCode.scope,
    client: { id: authCode.client },
    user: { id: authCode.entity }
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
