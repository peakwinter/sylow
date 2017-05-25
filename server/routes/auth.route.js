import express from 'express';
import validate from 'express-validation';
import paramValidation from '../../config/param-validation';
import * as authCtrl from '../controllers/auth.controller';
import { authorization, decision, token } from '../helpers/OAuth';


const router = express.Router(); // eslint-disable-line new-cap

router.route('/authorize')
  .get(authorization);

router.route('/decision')
  .post(decision);

router.route('/token')
  .all(token);

/** POST /api/auth/salt - Returns password salt if correct username is provided */
router.route('/salt')
  .get(validate(paramValidation.salt), authCtrl.getSalt);

/** GET /api/auth/random-number - Protected route,
 * needs token returned by the above as header. Authorization: Bearer {token} */
router.route('/random-number')
  .get(authCtrl.authenticateOAuth, authCtrl.getRandomNumber);

export default router;
