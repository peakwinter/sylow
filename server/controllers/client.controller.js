import Client from '../models/client.model';

/**
 * Load client and append to req.
 */
function load(req, res, next, id) {
  Client.get(id)
    .then((client) => {
      req.client = client; // eslint-disable-line no-param-reassign
      return next();
    })
    .catch(e => next(e));
}

/**
 * Get client
 */
function get(req, res) {
  return res.json(req.client);
}

/**
 * Create new client
 * @returns {Client}
 */
function create(req, res, next) {
  const client = new Client({
    clientName: req.body.clientName,
    deviceType: req.body.deviceType,
    clientId: req.body.clientId,
    clientSecret: req.body.clientSecret,
    redirectUri: req.body.redirectUri,
    grantTypes: req.body.grantTypes,
    scope: req.body.scope
  });

  client.save()
    .then(savedClient => res.json(savedClient))
    .catch(e => next(e));
}

/**
 * Update existing client
 * @returns {Client}
 */
function update(req, res, next) {
  const client = req.client;
  client.clientName = req.body.clientName;
  client.deviceType = req.body.deviceType;
  client.clientId = req.body.clientId;
  client.clientSecret = req.body.clientSecret;
  client.redirectUri = req.body.redirectUri;
  client.grantTypes = req.body.grantTypes;
  client.scope = req.body.scope;

  client.save()
    .then(savedClient => res.json(savedClient))
    .catch(e => next(e));
}


/**
 * Get client list.
 * @property {number} req.query.skip - Number of clients to be skipped.
 * @property {number} req.query.limit - Limit number of clients to be returned.
 * @return {Client}
 */
function list(req, res, next) {
  const { limit = 50, skip = 0 } = req.query;
  Client.list({ limit, skip })
    .then(clients => res.json(clients))
    .catch(e => next(e));
}

/**
 * Delete client.
 * @return {Client}
 */
function remove(req, res, next) {
  const client = req.client;
  client.remove()
    .then(deletedClient => res.json(deletedClient))
    .catch(e => next(e));
}

export default { load, get, list, create, update, remove };
