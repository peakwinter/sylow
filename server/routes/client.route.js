import express from 'express';
import validate from 'express-validation';
import paramValidation from '../../config/param-validation';

import * as authCtrl from '../controllers/auth.controller';
import clientCtrl from '../controllers/client.controller';

const router = express.Router(); // eslint-disable-line new-cap

router.route('/')
  /** GET /api/clients - Get list of clients */
  .get(authCtrl.authenticateOAuth, clientCtrl.list)

  /** POST /api/clients - Create new client */
  .post(authCtrl.authenticateOAuth, validate(paramValidation.createClient), clientCtrl.create);

router.route('/:clientId')
  /** GET /api/clients/:clientId - Get client */
  .get(authCtrl.authenticateOAuth, clientCtrl.get)

  /** PUT /api/clients/:clientId - Update client */
  .put(authCtrl.authenticateOAuth, validate(paramValidation.updateClient), clientCtrl.update)

  /** DELETE /api/clients/:clientId - Delete client */
  .delete(authCtrl.authenticateOAuth, clientCtrl.remove);

/** Load client when API with clientId route parameter is hit */
router.param('clientId', clientCtrl.load);

export default router;
