import chai from 'chai';

import config from '../config/config';
import AccessToken from '../server/models/accessToken.model';
import Client from '../server/models/client.model';
import Entity from '../server/models/entity.model';
import Document from '../server/models/document.model';
import Server from '../server/models/server.model';

chai.config.includeStack = true;

before('Clean up test data', () => {
  if (config.env !== 'test') {
    return Promise.reject('Not in a test environment');
  }
  return Promise.all([
    AccessToken.remove(),
    Client.remove(),
    Entity.remove(),
    Document.remove(),
    Server.remove()
  ]);
});
