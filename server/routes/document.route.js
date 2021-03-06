import express from 'express';
import validate from 'express-validation';
import paramValidation from '../../config/param-validation';

import * as authCtrl from '../controllers/auth.controller';
import documentCtrl from '../controllers/document.controller';

const router = express.Router(); // eslint-disable-line new-cap

router.route('/')
  /** GET /api/documents - Get list of documents */
  .get(authCtrl.authenticateOAuth, validate(paramValidation.getActions), documentCtrl.getActions)

  /** POST /api/documents - Create new document */
  .post(authCtrl.authenticateOAuth, validate(paramValidation.createDocument), documentCtrl.create);

router.route('/:documentId')
  /** GET /api/documents/:documentId - Get document */
  .get(authCtrl.authenticateOAuth, documentCtrl.get)

  /** PUT /api/documents/:documentId - Update document */
  .put(authCtrl.authenticateOAuth, validate(paramValidation.updateDocument), documentCtrl.update)

  /** DELETE /api/documents/:documentId - Delete document */
  .delete(authCtrl.authenticateOAuth, documentCtrl.remove);

/** Load document when API with documentId route parameter is hit */
router.param('documentId', documentCtrl.load);

export default router;
