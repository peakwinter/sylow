import uuidV4 from 'uuid/v4';

import Document from '../models/document.model';

/**
 * Load entity and append to req.
 */
function load(req, res, next, id) {
  Document.get(id)
    .then((document) => {
      req.document = document; // eslint-disable-line no-param-reassign
      return next();
    })
    .catch(e => next(e));
}

/**
 * Get document
 * @returns {Document}
 */
function get(req, res) {
  return res.json(req.document);
}

/**
 * Create new document
 * @property {string} req.body.documentname - The documentname of document.
 * @property {string} req.body.mobileNumber - The mobileNumber of document.
 * @returns {Document}
 */
function create(req, res, next) {
  const document = new Document({
    id: uuidV4(),
    // entityId: req.entity.id,
    entityId: req.body.entityId,
    contentType: req.body.contentType,
    version: req.body.version,
    public: req.body.public,
    diffed: req.body.diffed,
    encryption: req.body.encryption,
    summary: req.body.summary || {},
    data: req.body.data || {},
    references: req.body.references || {},
    mentions: req.body.mentions || {},
    tags: req.body.tags || [],
    key: req.body.key
  });

  document.save()
    .then(savedDocument => res.json(savedDocument))
    .catch(e => next(e));
}

/**
 * Update existing document
 * @property {string} req.body.documentName - The name and domain of document.
 * @property {string} req.body.passwordHash - The passwordHash of document.
 * @property {string} req.body.passwordSalt - The passwordSalt of document.
 * @returns {Document}
 */
function update(req, res, next) {
  const document = req.document;
  document.updated = Date.now();
  document.data = req.body.data;
  document.save()
    .then(savedDocument => res.json(savedDocument))
    .catch(e => next(e));
}

/**
 * Get document list.
 * @property {number} req.query.skip - Number of documents to be skipped.
 * @property {number} req.query.limit - Limit number of documents to be returned.
 * @returns {Document[]}
 */
function list(req, res, next) {
  const { limit = 50, skip = 0 } = req.query;
  Document.list({ limit, skip })
    .then(documents => res.json(documents))
    .catch(e => next(e));
}

/**
 * Delete document.
 * @returns {Document}
 */
function remove(req, res, next) {
  const document = req.document;
  document.remove()
    .then(deletedDocument => res.json(deletedDocument))
    .catch(e => next(e));
}

export default { load, get, create, update, list, remove };
