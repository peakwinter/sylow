import express from 'express';

import * as authCtrl from '../server/controllers/auth.controller';
import { authorizationClient, decisionClient, token } from '../server/helpers/OAuth';


const router = express.Router(); // eslint-disable-line new-cap

router.route('/')
  .get((req, res) => res.render('index'));

router.route('/login')
  .get(authCtrl.login)
  .post(authCtrl.authenticate);

router.route('/authorize')
  .get(authorizationClient);

router.route('/decision')
  .post(decisionClient);

router.route('/token')
  .all(token);

export default router;
