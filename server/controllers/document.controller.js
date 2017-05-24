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
 * Delete document.
 * @returns {Document}
 */
function remove(req, res, next) {
  const document = req.document;
  document.remove()
    .then(deletedDocument => res.json(deletedDocument))
    .catch(e => next(e));
}

/**
 * Retrieve a set of Documents according to the url parameters
 * @property {string} req.query.contentType - A document content Type
 * @property {string} req.query.skip - The number of tuple to skip
 * @property {string} req.query.limit - The mac number of tuple to return
 * @property {string} req.query.createdStart - The document creation lower limit datetime
 * @property {string} req.query.createdEnd - The document creation upper limit datetime
 * @property {string} req.query.updatedStart - The document update lower limit datetime
 * @property {string} req.query.updatedEnd - The document update upper limit datetime
 * @property {string} req.query.tags - A set of tags
 * @property {string} req.query.page - The page number
 * @returns {Document[]}
 */

function getActions(req, res, next) {
  const filter = {};
  const finder = {};
  const query = req.query;

  if ('contentType' in query) {
    filter.contentType = query.contentType;
  }
  if ('skip' in query) {
    finder.skip = query.skip;
  }
  if ('limit' in query) {
    finder.limit = query.limit;
  }
  if ('createdStart' in query) {
    filter.created = { $gt: query.createdStart };
  }
  if ('createdEnd' in query) {
    if (filter.created) {
      filter.created.$lt = query.createdEnd;
    } else {
      filter.created = { $lt: query.createdEnd };
    }
  }
  if ('updatedStart' in query) {
    filter.updated = { $gt: query.updatedStart };
  }
  if ('updatedEnd' in query) {
    if (filter.updated) {
      filter.updated.$lt = query.updatedEnd;
    } else {
      filter.updated = { $lt: query.updatedEnd };
    }
  }
  if ('tags' in query) {
    filter.tags = { $in: query.tags };
  }
  if ('page' in query && finder.limit) {
    finder.skip = (finder.limit * (query.page - 1));
  }

  Document.find(filter, null, finder)
    .then(documents => res.json(documents))
    .catch(e => next(e));
}

export default { load, get, create, update, remove, getActions };
