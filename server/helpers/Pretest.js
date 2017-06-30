import config from '../../config/config';
import AccessToken from '../../server/models/accessToken.model';
import Client from '../../server/models/client.model';
import Entity from '../../server/models/entity.model';
import { randomStr } from '../../server/utils/random';

function generateEntity(admin = true) {
  return {
    entityName: `${randomStr(12)}@testdomain.xyz`,
    passwordHash: '33f1ba50d3acdfe04fadbfcdc50edd84a3af0f9d377872003eaedbb68f8e6d7146e87c35e5f3338341d91b84c1371a6a9db054c4104797e99848f4d2d8a2b91e',
    passwordSalt: '694658b93aa9c2f245cca37da3b4d7cc',
    keypair: {
      public: 'xxxxx'
    },
    authoritative: true,
    admin
  };
}

function generateClient() {
  return {
    clientId: randomStr(12),
    clientSecret: randomStr(12),
    clientName: randomStr(12),
    deviceType: 'other',
    redirectUri: 'http://localhost/cb'
  };
}

function generateAccessToken(entity) {
  return {
    entity,
    tokenType: 'access',
    token: randomStr(256)
  };
}

function beforeTest() {
  let client;
  let adminEntity;
  let nonAdminEntity;
  let adminAccessToken;
  let nonAdminAccessToken;

  if (config.env !== 'test') {
    return Promise.reject('Not in a test environment');
  }

  return Entity.create([generateEntity(), generateEntity(false)])
    .then(([adminRes, nonAdminRes]) => {
      adminEntity = adminRes;
      nonAdminEntity = nonAdminRes;
      adminAccessToken = generateAccessToken(adminRes._id);
      nonAdminAccessToken = generateAccessToken(nonAdminRes._id);
      return Client.create(generateClient());
    })
    .then((clientRes) => {
      client = clientRes;
      adminAccessToken.client = clientRes._id;
      nonAdminAccessToken.client = clientRes._id;
      return AccessToken.create([adminAccessToken, nonAdminAccessToken]);
    })
    .then(([adminRes, nonAdminRes]) =>
      Promise.resolve({
        client,
        adminEntity,
        nonAdminEntity,
        adminAccessToken: adminRes,
        nonAdminAccessToken: nonAdminRes
      })
    );
}

export { beforeTest as default };
