import express from 'express';
import validate from 'express-validation';
import paramValidation from '../../config/param-validation';
import entityCtrl from '../controllers/entity.controller';

const router = express.Router(); // eslint-disable-line new-cap

router.route('/')
  /** GET /api/entities - Get list of entities */
  .get(entityCtrl.list)

  /** POST /api/entities - Create new entity */
  .post(validate(paramValidation.createEntity), entityCtrl.create);

router.route('/:entityId')
  /** GET /api/entities/:entityId - Get entity */
  .get(entityCtrl.get)

  /** PUT /api/entities/:entityId - Update entity */
  .put(validate(paramValidation.updateEntity), entityCtrl.update)

  /** DELETE /api/entities/:entityId - Delete entity */
  .delete(entityCtrl.remove);

/** Load entity when API with entityId route parameter is hit */
router.param('entityId', entityCtrl.load);

export default router;
