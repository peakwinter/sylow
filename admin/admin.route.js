import express from 'express';
import passport from 'passport';

import authCtrl from '../server/controllers/auth.controller';


const router = express.Router(); // eslint-disable-line new-cap

router.route('/')
  .get((req, res) => res.render('index'));

router.route('/login')
  .get(authCtrl.login)
  .post(passport.authenticate('local'));

export default router;
