import AccessToken from '../models/accessToken.model';
import Device from '../models/device.model';
import Entity from '../models/entity.model';


const authorizationCodes = {};


export function getAccessToken(token) {
  AccessToken.find({ token, tokenType: 'access' })
    .then(accessToken =>
      Promise.all([
        accessToken,
        Device.get(accessToken.deviceId),
        Entity.get(accessToken.entityId)
      ])
    )
    .then(([accessToken, device, entity]) => (
      {
        accessToken: accessToken.token,
        accessTokenExpiresAt: accessToken.expiresAt,
        scope: accessToken.scope,
        client: device,
        user: entity
      }
    ));
}

export function getRefreshToken(token) {
  AccessToken.find({ token, tokenType: 'refresh' })
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
    const codeData = authorizationCodes[code];
    Promise.all([
      codeData,
      Device.get(codeData.deviceId),
      Entity.get(codeData.entityId)
    ])
    .then(([authorizationCode, device, entity]) => (
      {
        code: authorizationCode.code,
        expiresAt: authorizationCode.expiresAt,
        redirectUri: authorizationCode.redirectUri,
        scope: authorizationCode.scope,
        client: device,
        user: entity
      }
    ));
  }
}

export function getClient(clientId, clientSecret) {
  Device.findOne({ clientId, clientSecret })
    .then((device) => {
      if (!device) return new Error('Client not found');
      return {
        id: device.id,
        redirectUris: [device.redirectUri],
        grants: ['authorization_code', 'password', 'refresh_token', 'client_credentials']
      };
    });
}

export function getUser(username, passwordHash) {
  return Entity.findOne({ username })
    .then((entity) => {
      if (passwordHash === entity.passwordHash) {
        return Entity;
      }
      return undefined;
    });
}

export function getUserFromClient(device) {
  return Entity.get(device.entityId);
}

export function saveToken(token, device, entity) {
  const accessToken = new AccessToken({
    token: token.accessToken,
    expiresAt: token.accessTokenExpiresAt,
    scope: token.scope,
    deviceId: device.id,
    entityId: entity.id
  });
  const refreshToken = new AccessToken({
    token: token.refreshToken,
    entityId: device.id,
    deviceId: entity.id
  });

  return Promise.all([accessToken.save(), refreshToken.save()])
    .then(([savedAccessToken, savedRefreshToken]) => (
      {
        accessToken: savedAccessToken.token,
        accessTokenExpiresAt: savedAccessToken.expiresAt,
        refreshToken: savedRefreshToken.token,
        scope: savedAccessToken.scope,
        client: { id: savedAccessToken.deviceId },
        user: { id: savedAccessToken.entityId }
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
  authorizationCodes[code] = authCode;

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
  if (!(code in authorizationCodes)) {
    return false;
  }
  delete authorizationCodes[code];
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
