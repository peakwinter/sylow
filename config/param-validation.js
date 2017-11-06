import Joi from 'joi';

export default {
  // POST /api/entities
  createEntity: {
    body: {
      entityName: Joi.string(),
      username: Joi.string(),
      domain: Joi.string(),
      contactId: Joi.string().uuid(),
      passwordHash: Joi.string().when('authoritative', { is: true, then: Joi.required() }),
      passwordSalt: Joi.string().when('authoritative', { is: true, then: Joi.required() }),
      keypair: Joi.object({
        public: Joi.string().when('authoritative', { is: false, then: Joi.required() }),
        private: Joi.string(),
        recovery: Joi.string()
      }),
      authoritative: Joi.boolean().default(false),
      admin: Joi.boolean().default(false)
    }
  },

  // GET /api/entities
  listEntities: {
    query: {
      showKeys: Joi.boolean()
    }
  },

  // UPDATE /api/entities/:entityId
  updateEntity: {
    body: {
      entityName: Joi.string(),
      username: Joi.string(),
      domain: Joi.string(),
      contactId: Joi.string().uuid(),
      passwordHash: Joi.string().when('authoritative', { is: true, then: Joi.required() }),
      passwordSalt: Joi.string().when('authoritative', { is: true, then: Joi.required() }),
      keypair: Joi.object({
        public: Joi.string().when('authoritative', { is: false, then: Joi.required() }),
        private: Joi.string(),
        recovery: Joi.string()
      }),
      authoritative: Joi.boolean().default(false),
      admin: Joi.boolean().default(false)
    },
    params: {
      entityId: Joi.string().uuid().required()
    }
  },

  // POST /api/documents
  createDocument: {
    body: Joi.array().items(Joi.object({
      id: Joi.string().uuid(),
      entityId: Joi.string(),
      contentType: Joi.string().when('deleted', { is: true, otherwise: Joi.required() }),
      version: Joi.number(),
      public: Joi.boolean(),
      diffed: Joi.boolean(),
      encryption: Joi.string(),
      summary: Joi.object({
        contentType: Joi.string(),
        encoding: Joi.string(),
        data: Joi.string()
      }),
      data: Joi.object(),
      references: Joi.object(),
      mentions: Joi.object(),
      tags: Joi.object(),
      key: Joi.string().allow(''),
      deleted: Joi.boolean()
    })).single(),
    options: {
      contextRequest: true
    }
  },

  getActions: {
    query: {
      contentType: Joi.string().required(),
      limit: Joi.number(),
      skip: Joi.number(),
      createdStart: Joi.date(),
      createdEnd: Joi.date(),
      updatedStart: Joi.date(),
      updatedEnd: Joi.date(),
      page: Joi.number()
    }
  },

  // PUT /api/documents
  updateDocument: {
    body: {
      entityId: Joi.string(),
      contentType: Joi.string().required(),
      version: Joi.number(),
      public: Joi.boolean(),
      diffed: Joi.boolean(),
      encryption: Joi.string(),
      summary: Joi.object({
        contentType: Joi.string(),
        encoding: Joi.string(),
        data: Joi.string()
      }),
      data: Joi.object(),
      references: Joi.object(),
      mentions: Joi.object(),
      key: Joi.string().allow(''),
      tags: Joi.object(),
    },
    params: {
      documentId: Joi.string().uuid().required()
    }
  },

  // GET /api/auth/salt
  salt: {
    query: {
      username: Joi.string().required()
    }
  },

  // POST /api/auth/login
  login: {
    body: {
      username: Joi.string().required(),
      passwordHash: Joi.string().required()
    }
  },

  // POST /api/clients
  createClient: {
    body: {
      entityId: Joi.string().uuid(),
      clientId: Joi.string().required(),
      clientSecret: Joi.string().required(),
      clientName: Joi.string().required(),
      deviceType: Joi.string().required(),
      redirectUri: Joi.string(),
      grantTypes: Joi.string(),
      scope: Joi.string()
    }
  },

  // UPDATE /api/clients/:clientId
  updateClient: {
    body: {
      entityId: Joi.string().uuid(),
      clientId: Joi.string().required(),
      clientSecret: Joi.string().required(),
      clientName: Joi.string().required(),
      deviceType: Joi.string().required(),
      redirectUri: Joi.string(),
      grantTypes: Joi.string(),
      scope: Joi.string()
    },
    params: {
      clientId: Joi.string().required()
    }
  },

  adminInterface: {
    body: {
      formname: Joi.string().required(),
      username: Joi.string().required(),
      password: Joi.string().required()
    }
  },

  // POST /api/servers
  createServer: {
    body: {
      domain: Joi.string().required(),
      name: Joi.string(),
      description: Joi.string(),
      keypair: Joi.object({
        public: Joi.string(),
        private: Joi.string()
      }),
      authoritative: Joi.boolean().default(false)
    }
  },

  // GET /api/servers
  listServer: {
    query: {
      show_keys: Joi.boolean()
    }
  },

  // UPDATE /api/servers/:serverId
  updateServer: {
    body: {
      domain: Joi.string(),
      name: Joi.string(),
      description: Joi.string(),
      keypair: Joi.object({
        public: Joi.string(),
        private: Joi.string().when('authoritative', { is: true, then: Joi.required() })
      }),
      authoritative: Joi.boolean().default(false)
    },
    params: {
      serverId: Joi.string().required()
    }
  }
};
