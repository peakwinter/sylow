import express from 'express';
import validate from 'express-validation';
import paramValidation from '../../config/param-validation';
import authCtrl from '../controllers/auth.controller';


const router = express.Router(); // eslint-disable-line new-cap

router.route('/token')
  .all(authCtrl.getToken);

router.route('/authorize')
  .get(authCtrl.getAuthorize)
  .post(authCtrl.postAuthorize);

/** POST /api/auth/salt - Returns password salt if correct username is provided */
router.route('/salt')
  .get(validate(paramValidation.salt), authCtrl.getSalt);

/** GET /api/auth/random-number - Protected route,
 * needs token returned by the above as header. Authorization: Bearer {token} */
router.route('/random-number')
  .get(authCtrl.authenticate(), authCtrl.getRandomNumber);

export default router;
