import express from 'express';
import validate from 'express-validation';
import paramValidation from '../../config/param-validation';
import documentCtrl from '../controllers/document.controller';

const router = express.Router(); // eslint-disable-line new-cap

router.route('/')
  /** GET /api/documents - Get list of documents */
  .get(documentCtrl.list)

  /** POST /api/documents - Create new document */
  .post(validate(paramValidation.createDocument), documentCtrl.create);

router.route('/:documentId')
  /** GET /api/documents/:documentId - Get document */
  .get(documentCtrl.get)

  /** PUT /api/documents/:documentId - Update document */
  .put(validate(paramValidation.updateDocument), documentCtrl.update)

  /** DELETE /api/documents/:documentId - Delete document */
  .delete(documentCtrl.remove);

/** Load document when API with documentId route parameter is hit */
router.param('documentId', documentCtrl.load);

export default router;
