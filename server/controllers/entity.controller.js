import uuidV4 from 'uuid/v4';
import httpStatus from 'http-status';

import APIError from '../helpers/APIError';
import config from '../../config/config';
import Entity from '../models/entity.model';

/**
 * Load entity and append to req.
 */
function load(req, res, next, id) {
  Entity.get(id)
    .then((entity) => {
      req.entity = entity; // eslint-disable-line no-param-reassign
      return next();
    })
    .catch(e => next(e));
}

/**
 * Get entity
 * @returns {Entity}
 */
function get(req, res) {
  return res.json(req.entity);
}

/**
 * Create new entity
 * @returns {Entity}
 */
function create(req, res, next) {
  if (!config.allowSignups && req.body.authoritative) {
    const err = new APIError('New signups not allowed', httpStatus.BAD_REQUEST, true);
    return next(err);
  }

  let keypair = {};
  /* istanbul ignore else */
  if (req.body.keypair) {
    keypair = {
      public: req.body.keypair.public,
      private: req.body.keypair.private,
      recovery: req.body.keypair.recovery
    };
  }

  const entity = new Entity({
    id: uuidV4(),
    contactId: req.body.contactId,
    passwordHash: req.body.passwordHash,
    passwordSalt: req.body.passwordSalt,
    keypair,
    authoritative: req.body.authoritative
  });

  if (req.body.entityName) {
    entity.entityName = req.body.entityName;
  } else {
    entity.username = req.body.username;
    entity.domain = req.body.domain;
  }

  return entity.save()
    .then(savedEntity => res.json(savedEntity))
    .catch(e => next(e));
}

/**
 * Update existing entity
 * @returns {Entity}
 */
function update(req, res, next) {
  const entity = req.entity;
  /* istanbul ignore else */
  if (req.body.authoritative && req.body.passwordHash) {
    entity.passwordHash = req.body.passwordHash;
    entity.passwordSalt = req.body.passwordSalt;
  }
  /* istanbul ignore else */
  if (req.body.authoritative && req.body.keypair) {
    entity.keypair.public = req.body.keypair.public;
    entity.keypair.private = req.body.keypair.private;
    entity.keypair.recovery = req.body.keypair.recovery;
  }

  /* istanbul ignore else */
  if (req.body.entityName) {
    entity.entityName = req.body.entityName;
  } else {
    entity.username = req.body.username;
    entity.domain = req.body.domain;
  }
  entity.contactId = req.body.contactId;

  entity.save()
    .then(savedEntity => res.json(savedEntity))
    .catch(e => next(e));
}

/**
 * Get entity list.
 * @returns {Entity[]}
 */
function list(req, res, next) {
  const { limit = 50, skip = 0 } = req.query;
  Entity.list({ limit, skip })
    .then(entities => res.json(entities))
    .catch(e => next(e));
}

/**
 * Delete entity.
 * @returns {Entity}
 */
function remove(req, res, next) {
  const entity = req.entity;
  entity.remove()
    .then(deletedEntity => res.json(deletedEntity))
    .catch(e => next(e));
}

export default { load, get, create, update, list, remove };
