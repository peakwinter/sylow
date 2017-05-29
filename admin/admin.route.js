import express from 'express';

import * as authCtrl from '../server/controllers/auth.controller';
import * as OAuth from '../server/helpers/OAuth';


const router = express.Router(); // eslint-disable-line new-cap

router.route('/')
  .get(authCtrl.authenticateUser, (req, res) => res.render('index'));

router.route('/login')
  .get(authCtrl.login)
  .post(authCtrl.authenticate);

router.route('/authorize')
  .get([authCtrl.authenticateUser, ...OAuth.authorization]);

router.route('/decision')
  .post([authCtrl.authenticateUser, OAuth.Server.decision()]);

router.route('/token')
  .all([authCtrl.authenticateClient, OAuth.Server.token(), OAuth.Server.errorHandler()]);

export default router;
