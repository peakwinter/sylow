import express from 'express';

import * as adminCtrl from '../controllers/admin.controller';
import * as authCtrl from '../controllers/auth.controller';
import * as OAuth from '../helpers/OAuth';


const router = express.Router(); // eslint-disable-line new-cap

router.route('/')
  .get(authCtrl.authenticateUser, authCtrl.ensureAdmin, adminCtrl.index);

router.route('/entities')
  .get(authCtrl.authenticateUser, authCtrl.ensureAdmin, adminCtrl.listEntities)
  .post(authCtrl.authenticateUser, authCtrl.ensureAdmin, adminCtrl.createEntity);

router.route('/entities/:entityId')
  .get(authCtrl.authenticateUser, authCtrl.ensureAdmin, adminCtrl.showEntity)
  .post(authCtrl.authenticateUser, authCtrl.ensureAdmin, adminCtrl.updateEntity)
  .delete(authCtrl.authenticateUser, authCtrl.ensureAdmin, adminCtrl.deleteEntity);

router.route('/clients')
  .get(authCtrl.authenticateUser, authCtrl.ensureAdmin, adminCtrl.listClients)
  .post(authCtrl.authenticateUser, authCtrl.ensureAdmin, adminCtrl.createClient);

router.route('/clients/:clientId')
  .get(authCtrl.authenticateUser, authCtrl.ensureAdmin, adminCtrl.showClient)
  .post(authCtrl.authenticateUser, authCtrl.ensureAdmin, adminCtrl.updateClient)
  .delete(authCtrl.authenticateUser, authCtrl.ensureAdmin, adminCtrl.deleteClient);

router.route('/tokens/:tokenId')
  .delete(authCtrl.authenticateUser, authCtrl.ensureAdmin, adminCtrl.revokeToken);

router.route('/login')
  .get(authCtrl.login)
  .post(authCtrl.authenticate);

router.route('/logout')
  .get(authCtrl.logout);

router.route('/authorize')
  .get([authCtrl.authenticateUser, ...OAuth.authorization]);

router.route('/decision')
  .post([authCtrl.authenticateUser, ...OAuth.decision]);

router.route('/token')
  .all([authCtrl.authenticateClient, OAuth.Server.token(), OAuth.Server.errorHandler()]);

router.route('/settings')
  .get(authCtrl.authenticateUser, authCtrl.ensureAdmin, adminCtrl.listSettings)
  .post(authCtrl.authenticateUser, authCtrl.ensureAdmin, adminCtrl.updateSettings);

router.route('/servers')
  .get(authCtrl.authenticateUser, authCtrl.ensureAdmin, adminCtrl.listServers);

router.route('/servers/:serverId')
  .get(authCtrl.authenticateUser, authCtrl.ensureAdmin, adminCtrl.showServer)
  .post(authCtrl.authenticateUser, authCtrl.ensureAdmin, adminCtrl.updateServer)
  .delete(authCtrl.authenticateUser, authCtrl.ensureAdmin, adminCtrl.deleteServer);

router.route('/servers/:serverId/export')
  .get(adminCtrl.exportServer);
export default router;
