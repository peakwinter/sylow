import httpStatus from 'http-status';

import Document from '../models/document.model';
import Entity from '../models/entity.model';

import AdminError from '../helpers/AdminError';


export function index(req, res, next) {
  Document.aggregate([
    {
      $sortByCount: '$contentType'
    }
  ])
    .then(results => res.render('index', { active: 'index', contentTypes: results }))
    .catch(next);
}

export function listEntities(req, res) {
  return Entity.find({ authoritative: true })
    .then(entities => res.render('entities', { ctrl: 'entity', active: 'entities', entities }))
    .catch(message => res.render('error', { ctrl: 'entity', message }));
}

export function createEntity(req, res) {
  const entity = new Entity({
    username: req.body.username,
    passwordHash: req.body.passwordHash,
    passwordSalt: req.body.passwordSalt,
    authoritative: true,
    admin: req.body.admin
  });

  return entity.save()
    .then(() => {
      req.flash('success', 'Entity created');
      return res.redirect('/entities');
    })
    .catch((err) => {
      req.flash('error', err.toString());
      return res.redirect('/entities');
    });
}

export function deleteEntity(req, res, next) {
  const _id = req.params.entityId;
  if (!_id) {
    const err = new AdminError('Entity ID required', httpStatus.BAD_REQUEST, true);
    return next(err);
  }
  return Entity.remove({ _id })
    .then((entity) => {
      if (!entity) {
        const err = new AdminError('Entity does not exist', httpStatus.NOT_FOUND, true);
        return next(err);
      }
      return res.sendStatus(httpStatus.NO_CONTENT);
    })
    .catch(next);
}
