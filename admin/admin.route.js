import express from 'express';
import validate from 'express-validation';
import expressJwt from 'express-jwt';
import paramValidation from '../config/param-validation';
import adminCtrl from './admin.controller';
import config from '../config/config';

const router = express.Router(); // eslint-disable-line new-cap

router.route('/')
  .get(adminCtrl.init)

  .post(validate(paramValidation.adminInterface), adminCtrl.postActions);

export default router;
