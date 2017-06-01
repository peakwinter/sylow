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
        public: Joi.string().required(),
        private: Joi.string().when('authoritative', { is: true, then: Joi.required() }),
        recovery: Joi.string()
      }).required(),
      authoritative: Joi.boolean().default(false),
      admin: Joi.boolean().default(false)
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
        public: Joi.string().required(),
        private: Joi.string(),
        recovery: Joi.string()
      }).when('authoritative', { is: true, then: Joi.required() }),
      authoritative: Joi.boolean().default(false),
      admin: Joi.boolean().default(false)
    },
    params: {
      entityId: Joi.string().uuid().required()
    }
  },

  // POST /api/documents
  createDocument: {
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
      tags: Joi.array(),
      key: Joi.string()
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
      tags: Joi.array(),
      page: Joi.number()
    }
  },

  // POST /api/documents
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
      tags: Joi.array(),
      key: Joi.string()
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
      entityId: Joi.string().uuid().required(),
      clientId: Joi.string().required(),
      clientSecret: Joi.string().required(),
      clientName: Joi.string().required(),
      deviceType: Joi.string().required(),
      redirectUri: Joi.string().required(),
      grantTypes: Joi.string(),
      scope: Joi.string()
    }
  },

  // UPDATE /api/clients/:clientId
  updateClient: {
    body: {
      entityId: Joi.string().uuid().required(),
      clientId: Joi.string().required(),
      clientSecret: Joi.string().required(),
      clientName: Joi.string().required(),
      deviceType: Joi.string().required(),
      redirectUri: Joi.string().required(),
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
  }
};
