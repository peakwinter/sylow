import httpStatus from 'http-status';

import Client from '../models/client.model';
import Document from '../models/document.model';
import Entity from '../models/entity.model';

import config from '../../config/config';
import APIError from '../helpers/APIError';


export function index(req, res, next) {
  const docTypes = Document.aggregate([{ $sortByCount: '$contentType' }]);
  const [docCount, entityCount, clientCount] = [Document.count(), Entity.count(), Client.count()];

  Promise.all([docTypes, docCount, entityCount, clientCount])
    .then(([contentTypes, documents, entities, clients]) => res.render('index', {
      active: 'index', contentTypes, documents, entities, clients
    }))
    .catch(next);
}

export function showEntity(req, res) {
  return Promise.all([
    Entity.get(req.params.entityId), Client.find({ entityId: req.params.entityId })
  ])
    .then(([entity, clients]) => res.render('entity', {
      ctrl: 'entity', active: 'entities', entity, clients
    }))
    .catch((err) => {
      req.flash('error', err.toString());
      return res.redirect('/entities');
    });
}

export function listEntities(req, res) {
  return Entity.find({ authoritative: true }).sort({ username: 1 })
    .then(entities => res.render('entities', { ctrl: 'entity', active: 'entities', entities }))
    .catch((err) => {
      req.flash('error', err.toString());
      return res.render('entities', { ctrl: 'entity', active: 'entities', entities: [] });
    });
}

export function createEntity(req, res) {
  if (!req.body.username || !req.body.passwordHash || !req.body.passwordSalt) {
    req.flash('error', 'Missing values');
    return res.redirect('/entities');
  }

  const entity = new Entity({
    username: req.body.username,
    domain: req.body.domain || config.domain,
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

export function updateEntity(req, res) {
  const data = {
    username: req.body.username,
    admin: req.body.admin
  };
  if (req.body.passwordHash && req.body.passwordSalt) {
    data.passwordHash = req.body.passwordHash;
    data.passwordSalt = req.body.passwordSalt;
  }

  return Entity.findByIdAndUpdate(req.params.entityId, { $set: data }, { new: true })
    .then((entity) => {
      req.flash('success', 'Entity updated');
      return res.redirect(`/entities/${entity._id}`);
    })
    .catch((err) => {
      req.flash('error', err.toString());
      return res.redirect('/entities');
    });
}

export function deleteEntity(req, res, next) {
  const _id = req.params.entityId;
  return Entity.remove({ _id })
    .then((entity) => {
      if (!entity || !entity.result.n) {
        const err = new APIError('Entity does not exist', httpStatus.NOT_FOUND, true);
        return next(err);
      }
      return res.sendStatus(httpStatus.NO_CONTENT);
    })
    .catch(next);
}

export function revokeClient(req, res, next) {
  const _id = req.params.clientId;
  return Client.remove({ _id })
    .then((client) => {
      if (!client || !client.result.n) {
        const err = new APIError('Client does not exist', httpStatus.NOT_FOUND, true);
        return next(err);
      }
      return res.sendStatus(httpStatus.NO_CONTENT);
    })
    .catch(next);
}
