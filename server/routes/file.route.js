import express from 'express';

import * as authCtrl from '../controllers/auth.controller';
import * as fileCtrl from '../controllers/file.controller';


const router = express.Router(); // eslint-disable-line new-cap

router.route('/')
  /** POST /api/files - Create new file authorization */
  .post(authCtrl.authenticateOAuth, fileCtrl.createFile);

router.route('/:entityId/:fileCode')
  /** PUT /api/files/:entityId/:fileCode - Upload locally stored file */
  .post(authCtrl.authenticateOAuth, fileCtrl.uploadFile);

export default router;
