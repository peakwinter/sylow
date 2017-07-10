import express from 'express';
import validate from 'express-validation';
import paramValidation from '../../config/param-validation';
import serverCtrl from '../controllers/server.controller';

const router = express.Router(); // esling-disable-line new-cap

router.route('/')
  /** GET /api/servers - Get list of servers */
  .get(serverCtrl.list)

  /** POST /api/servers - Create new server */
  .post(validate(paramValidation.createServer), serverCtrl.create);

router.route('/:serverId')
  /** GET /api/servers/:serverId - Get server */
  .get(serverCtrl.get)

  /** PUT /api/servers/:serverId -  Update server */
  .put(validate(paramValidation.updateServer), serverCtrl.update)

  /** DELETE /api/servers/:serverId - Delete server */
  .delete(serverCtrl.remove);

router.param('serverId', serverCtrl.load);

export default router;
