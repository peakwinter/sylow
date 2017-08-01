import httpStatus from 'http-status';
import uuidV4 from 'uuid/v4';

import Document from '../models/document.model';
import APIError from '../helpers/APIError';

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
 * @returns {Document}
 */
function create(req, res, next) {
  let newDocuments = req.body;
  const entity = req.user.entity;
  const docPromises = [];

  if (!Array.isArray(newDocuments)) {
    newDocuments = [newDocuments];
  }

  newDocuments.forEach((doc) => {
    let docPromise;
    const docId = doc.id || uuidV4();

    if (doc.entityId && entity._id !== doc.entityId) {
      docPromises.push(Promise.reject(
        new APIError('You do not have the right to modify this document', httpStatus.BAD_REQUEST, true)
      ));
    }

    if (doc.id && doc.deleted) {
      docPromise = Document.findOneAndRemove({ _id: docId, entityId: entity._id })
        .then(deletedDoc => ({ id: deletedDoc._id, deleted: true }));
    } else {
      docPromise = Document.findOneAndUpdate({
        _id: docId, entityId: doc.entityId
      }, {
        id: docId,
        entityId: doc.entityId,
        contentType: doc.contentType,
        version: doc.version || 1,
        public: doc.public || false,
        diffed: doc.diffed || false,
        encryption: doc.encryption || 'base64',
        summary: doc.summary || {},
        data: doc.data || {},
        references: doc.references || {},
        mentions: doc.mentions || {},
        tags: doc.tags || {},
        key: doc.key || ''
      }, {
        new: true, upsert: true, setDefaultsOnInsert: true
      });
    }
    docPromises.push(docPromise);
  });

  return Promise.all(docPromises)
    .then(savedDocs => res.json(savedDocs.length === 1 ? savedDocs[0] : savedDocs))
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
  const entity = req.user.entity;
  if (entity.admin || entity._id === document.entityId) {
    document.updated = new Date();
    document.data = req.body.data;
    document.save()
      .then(savedDocument => res.json(savedDocument))
      .catch(e => next(e));
  } else {
    const err = new APIError('Unauthorized action', httpStatus.UNAUTHORIZED, true);
    next(err);
  }
}


/**
 * Delete document.
 * @returns {Document}
 */
function remove(req, res, next) {
  const document = req.document;
  const entity = req.user.entity;
  if (entity.admin || entity._id === document.entityId) {
    document.remove()
      .then(deletedDocument => res.json(deletedDocument))
      .catch(e => next(e));
  } else {
    const err = new APIError('Unauthorized action', httpStatus.UNAUTHORIZED, true);
    next(err);
  }
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
  filter.contentType = query.contentType;

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
    /* istanbul ignore else */
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
    /* istanbul ignore else */
    if (filter.updated) {
      filter.updated.$lt = query.updatedEnd;
    } else {
      filter.updated = { $lt: query.updatedEnd };
    }
  }
  if ('tags' in query) {
    const tags = query.tags;
    const tk = Object.keys(tags);
    for (let i = 0; i < tk.length; i += 1) {
      const key = tk[i];
      filter[`tags.${key}`] = tags[key];
    }
  }
  /* istanbul ignore if */
  if ('page' in query && finder.limit) {
    finder.skip = (finder.limit * (query.page - 1));
  }
  Document.find(filter, null, finder)
    .then(documents => res.json(documents))
    .catch(e => next(e));
}

export default { load, get, create, update, remove, getActions };
