import Server from '../models/server.model';

/**
 * Load server and append to req.
 */
function load(req, res, next, id) {
  Server.get(id)
    .then((server) => {
      req.server = server; // eslint-disable-line no-param-reassign
      return next();
    })
    .catch(e => next(e));
}

/**
 * Get server
 */
function get(req, res) {
  return res.json(req.server);
}


/**
 * Create a new server
 * @returns {server}
 */
function create(req, res, next) {
  let keypair = { public: null, private: null };

  /* istanbul ignore else */
  if (req.body.keypair) {
    keypair = {
      public: req.body.keypair.public,
      private: req.body.keypair.private
    };
  }

  const server = new Server({
    domain: req.body.domain,
    name: req.body.name || req.body.domain,
    description: req.body.description,
    keypair,
    authoritative: req.body.authoritative,
    contacted: new Date()
  });

  server.save()
    .then(savedServer => res.json(savedServer))
    .catch(e => next(e));
}

/**
 * Update existing server
 * @property {string} req.body.name - The server's name.
 * @property {string} req.body.domain - The server's domain.
 * @property {string} req.body.desciption - The server's description.
 * @returns {server}
 */
function update(req, res, next) {
  const server = req.server;

  server.name = req.body.name;
  server.domain = req.body.domain;
  server.description = req.body.description;
  server.updated = new Date();
  server.authoritative = req.body.authoritative;
  server.contacted = new Date();
  server.save()
    .then(savedServer => res.json(savedServer))
    .catch(e => next(e));
}

/**
 * Delete server.
 * @returns {Server}
 */
function remove(req, res, next) {
  const server = req.server;
  server.remove()
    .then(deletedServer => res.json(deletedServer))
    .catch(e => next(e));
}

/**
 * Get server list.
 * @returns {Server[]}
 */
function list(req, res, next) {
  const { limit = 50, skip = 0 } = req.query;
  Server.list({ limit, skip })
    .then(servers => res.json(servers))
    .catch(e => next(e));
}

export default { load, get, list, create, update, remove };
