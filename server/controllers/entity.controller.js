import uuidV4 from 'uuid/v4';

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
 * @property {string} req.body.entityname - The entityname of entity.
 * @property {string} req.body.mobileNumber - The mobileNumber of entity.
 * @returns {Entity}
 */
function create(req, res, next) {
  const entity = new Entity({
    id: uuidV4(),
    entityName: req.body.entityName,
    passwordHash: req.body.passwordHash,
    passwordSalt: req.body.passwordSalt,
    keypair: {
      public: req.body.keypair.public,
      private: req.body.keypair.private
    }
  });

  entity.save()
    .then(savedEntity => res.json(savedEntity))
    .catch(e => next(e));
}

/**
 * Update existing entity
 * @property {string} req.body.entityName - The name and domain of entity.
 * @property {string} req.body.passwordHash - The passwordHash of entity.
 * @property {string} req.body.passwordSalt - The passwordSalt of entity.
 * @returns {Entity}
 */
function update(req, res, next) {
  const entity = req.entity;
  if (req.body.passwordHash) {
    entity.passwordHash = req.body.passwordHash;
    entity.passwordSalt = req.body.passwordSalt;
  }
  entity.entityName = req.body.entityName;

  entity.save()
    .then(savedEntity => res.json(savedEntity))
    .catch(e => next(e));
}

/**
 * Get entity list.
 * @property {number} req.query.skip - Number of entities to be skipped.
 * @property {number} req.query.limit - Limit number of entities to be returned.
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
