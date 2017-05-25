import express from 'express';

import * as authCtrl from '../server/controllers/auth.controller';


const router = express.Router(); // eslint-disable-line new-cap

router.route('/')
  .get((req, res) => res.render('index'));

router.route('/login')
  .get(authCtrl.login)
  .post(authCtrl.authenticate);

export default router;
