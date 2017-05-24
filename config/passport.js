import { Strategy as LocalStrategy } from 'passport-local';

import Entity from '../server/models/entity.model';


export default new LocalStrategy({ passwordField: 'passwordHash' },
  (username, passwordHash, done) => {
    Entity.findOne({ username }, (err, entity) => {
      if (err) { return done(err); }
      if (!entity) {
        return done(null, false, { message: 'Incorrect username.' });
      }
      if (passwordHash !== entity.passwordHash) {
        return done(null, false, { message: 'Incorrect password.' });
      }
      return done(null, entity);
    });
  }
);
