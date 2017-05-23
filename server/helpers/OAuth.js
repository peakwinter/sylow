import httpStatus from 'http-status';

import APIError from './APIError';
import AccessToken from '../models/accessToken.model';
import Device from '../models/device.model';
import Entity from '../models/entity.model';


const authorizationCodes = {};


export function getAccessToken(token) {
  return AccessToken.findOne({ token, tokenType: 'access' })
    .then(accessToken =>
      Promise.all([
        accessToken,
        Device.get(accessToken.deviceId),
        Entity.get(accessToken.entityId)
      ])
    )
    .then(([accessToken, device, entity]) => {
      if (!accessToken || !device || !entity) return false;
      return {
        accessToken: accessToken.token,
        accessTokenExpiresAt: accessToken.expiresAt,
        scope: accessToken.scope,
        client: device.toJSON(),
        user: entity.toJSON()
      };
    });
}

export function getRefreshToken(token) {
  return AccessToken.findOne({ token, tokenType: 'refresh' })
    .then(refreshToken =>
      Promise.all([
        refreshToken,
        Device.get(refreshToken.deviceId),
        Entity.get(refreshToken.entityId)
      ])
    )
    .then(([refreshToken, device, entity]) => (
      {
        refreshToken: refreshToken.refreshToken,
        scope: refreshToken.scope,
        client: device,
        user: entity
      }
    ));
}

export function getAuthorizationCode(code) {
  if (code in authorizationCodes) {
    const authorizationCode = authorizationCodes[code];
    return Promise.all([
      Device.get(authorizationCode.deviceId),
      Entity.get(authorizationCode.entityId)
    ])
      .then(([device, entity]) => (
        {
          code: authorizationCode.code,
          expiresAt: authorizationCode.expiresAt,
          redirectUri: authorizationCode.redirectUri,
          scope: authorizationCode.scope,
          client: device.toJSON(),
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
  return Device.findOne(query)
    .then((device) => {
      if (!device) {
        const err = new APIError('Client not found', httpStatus.NOT_FOUND, true);
        return Promise.reject(err);
      }
      const data = device.toJSON();
      data.grants = ['authorization_code', 'password', 'refresh_token', 'client_credentials'];
      data.redirectUris = [device.redirectUri];
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

export function getUserFromClient(device) {
  return Entity.get(device.entityId)
    .then(entity => entity.toJSON());
}

export function saveToken(token, device, entity) {
  const promises = [];
  const accessToken = new AccessToken({
    token: token.accessToken,
    expiresAt: token.accessTokenExpiresAt,
    scope: token.scope,
    deviceId: device.id,
    entityId: entity.id
  });
  promises.push(accessToken.save());

  if (token.refreshToken) {
    const refreshToken = new AccessToken({
      token: token.refreshToken,
      tokenType: 'refresh',
      expiresAt: token.refreshTokenExpiresAt,
      deviceId: device.id,
      entityId: entity.id
    });
    promises.push(refreshToken.save());
  }

  return Promise.all(promises)
    .then(() => (
      {
        client: device,
        user: entity,
        accessToken: token.accessToken, // proxy
        refreshToken: token.refreshToken, // proxy
        access_token: token.accessToken,
        refresh_token: token.refresh_token,
      }
    ));
}

export function saveAuthorizationCode(code, device, entity) {
  const authCode = {
    code: code.authorizationCode,
    expiresAt: code.expiresAt,
    redirectUri: code.redirectUri,
    scope: code.scope,
    deviceId: device.id,
    entityId: entity.id
  };
  authorizationCodes[code.authorizationCode] = authCode;

  return {
    authorizationCode: authCode.code,
    expiresAt: authCode.expiresAt,
    redirectUri: authCode.redirectUri,
    scope: authCode.scope,
    client: { id: authCode.deviceId },
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
