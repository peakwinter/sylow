import config from '../../config/config';
import AccessToken from '../../server/models/accessToken.model';
import Client from '../../server/models/client.model';
import Entity from '../../server/models/entity.model';
import { randomStr } from '../../server/utils/random';

let adminEntity = {
  entityName: 'testuser@testdomain.xyz',
  passwordHash: '33f1ba50d3acdfe04fadbfcdc50edd84a3af0f9d377872003eaedbb68f8e6d7146e87c35e5f3338341d91b84c1371a6a9db054c4104797e99848f4d2d8a2b91e',
  passwordSalt: '694658b93aa9c2f245cca37da3b4d7cc',
  keypair: {
    public: 'xxxxx'
  },
  authoritative: true,
  admin: true
};

let nonAdminEntity = {
  entityName: 'notadmin@testdomain.xyz',
  passwordHash: '33f1ba50d3acdfe04fadbfcdc50edd84a3af0f9d377872003eaedbb68f8e6d7146e87c35e5f3338341d91b84c1371a6a9db054c4104797e99848f4d2d8a2b91e',
  passwordSalt: '694658b93aa9c2f245cca37da3b4d7cc',
  keypair: {
    public: 'xxxxx'
  },
  authoritative: true,
  admin: false
};

let client = {
  clientId: 'testuser',
  clientSecret: 'testuserSecret',
  clientName: 'testuser',
  deviceType: 'other',
  redirectUri: 'http://localhost/cb'
};

const adminAccessToken = {
  tokenType: 'access',
  token: randomStr(256)
};

const nonAdminAccessToken = {
  tokenType: 'access',
  token: randomStr(256)
};

function beforeTest() {
  if (config.env !== 'test') {
    return Promise.reject('Not in a test environment');
  }
  return Promise.all([
    AccessToken.remove(),
    Entity.remove(),
    Client.remove()
  ]).then(() =>
    Entity.create([adminEntity, nonAdminEntity])
      .then(([adminRes, nonAdminRes]) => {
        adminEntity = adminRes;
        nonAdminEntity = nonAdminRes;
        adminAccessToken.entity = adminEntity._id;
        nonAdminAccessToken.entity = nonAdminEntity._id;
        const newClient = new Client(client);
        return newClient.save()
          .then((clientRes) => {
            client = clientRes;
            adminAccessToken.client = client._id;
            nonAdminAccessToken.client = client._id;
            return AccessToken.create([adminAccessToken, nonAdminAccessToken]);
          });
      })
  );
}

export { beforeTest, adminAccessToken as accessToken, nonAdminAccessToken };
