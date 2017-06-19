import express from 'express';
import validate from 'express-validation';
import paramValidation from '../../config/param-validation';

import * as authCtrl from '../controllers/auth.controller';
import entityCtrl from '../controllers/entity.controller';

const router = express.Router(); // eslint-disable-line new-cap

router.route('/')
  /** GET /api/entities - Get list of entities */
  .get(authCtrl.authenticateOAuth, entityCtrl.list)

  /** POST /api/entities - Create new entity */
  .post(authCtrl.authenticateOAuth, validate(paramValidation.createEntity), entityCtrl.create);

router.route('/:entityId')
  /** GET /api/entities/:entityId - Get entity */
  .get(authCtrl.authenticateOAuth, entityCtrl.get)

  /** PUT /api/entities/:entityId - Update entity */
  .put(authCtrl.authenticateOAuth, validate(paramValidation.updateEntity), entityCtrl.update)

  /** DELETE /api/entities/:entityId - Delete entity */
  .delete(authCtrl.authenticateOAuth, entityCtrl.remove);

/** Load entity when API with entityId route parameter is hit */
router.param('entityId', entityCtrl.load);

export default router;
