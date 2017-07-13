import express from 'express';
import validate from 'express-validation';
import paramValidation from '../../config/param-validation';

import serverCtrl from '../controllers/server.controller';
import * as authCtrl from '../controllers/auth.controller';

const router = express.Router();  // eslint-disable-line new-cap

router.route('/')
  /** GET /api/servers - Get list of servers */
  .get(authCtrl.authenticateOAuth, serverCtrl.list)

  /** POST /api/servers - Create new server */
  .post(authCtrl.authenticateOAuth, validate(paramValidation.createServer), serverCtrl.create);

router.route('/:serverId')
  /** GET /api/servers/:serverId - Get server */
  .get(authCtrl.authenticateOAuth, serverCtrl.get)

  /** PUT /api/servers/:serverId -  Update server */
  .put(authCtrl.authenticateOAuth, validate(paramValidation.updateServer), serverCtrl.update)

  /** DELETE /api/servers/:serverId - Delete server */
  .delete(authCtrl.authenticateOAuth, serverCtrl.remove);

router.param('serverId', serverCtrl.load);

export default router;
