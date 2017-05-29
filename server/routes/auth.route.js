import express from 'express';
import validate from 'express-validation';
import paramValidation from '../../config/param-validation';
import * as authCtrl from '../controllers/auth.controller';
import * as OAuth from '../helpers/OAuth';


const router = express.Router(); // eslint-disable-line new-cap

router.route('/authorize')
  .get([authCtrl.authenticateBasic, ...OAuth.authorization]);

router.route('/decision')
  .post(authCtrl.authenticateBasicNoSession, OAuth.Server.decision());

router.route('/token')
  .all([authCtrl.authenticateClient, OAuth.Server.token(), OAuth.Server.errorHandler()]);

/** POST /api/auth/salt - Returns password salt if correct username is provided */
router.route('/salt')
  .get(validate(paramValidation.salt), authCtrl.getSalt);

/** GET /api/auth/random-number - Protected route,
 * needs token returned by the above as header. Authorization: Bearer {token} */
router.route('/random-number')
  .get(authCtrl.authenticateOAuth, authCtrl.getRandomNumber);

export default router;
