import Joi from 'joi';

export default {
  // POST /api/entities
  createEntity: {
    body: {
      entityName: Joi.string().required(),
      contactId: Joi.string().uuid(),
      passwordHash: Joi.string().when('authoritative', { is: true, then: Joi.required() }),
      passwordSalt: Joi.string().when('authoritative', { is: true, then: Joi.required() }),
      keypair: Joi.object({
        public: Joi.string().required(),
        private: Joi.string().when('authoritative', { is: true, then: Joi.required() }),
        recovery: Joi.string()
      }).required(),
      authoritative: Joi.boolean().default(false)
    }
  },

  // UPDATE /api/entities/:entityId
  updateEntity: {
    body: {
      entityName: Joi.string().required(),
      contactId: Joi.string().uuid(),
      passwordHash: Joi.string().when('authoritative', { is: true, then: Joi.required() }),
      passwordSalt: Joi.string().when('authoritative', { is: true, then: Joi.required() }),
      keypair: Joi.object({
        public: Joi.string().required(),
        private: Joi.string(),
        recovery: Joi.string()
      }).when('authoritative', { is: true, then: Joi.required() }),
      authoritative: Joi.boolean().default(false)
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
      contentType: Joi.string(),
      limit: Joi.number(),
      skip: Joi.number(),
      creationStart: Joi.date(),
      creationEnd: Joi.date(),
      updatedStart: Joi.date(),
      updatedEnd: Joi.date(),
      tags: Joi.array()
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

  // POST /api/devices
  createDevice: {
    body: {
      entityId: Joi.string().uuid().required(),
      deviceType: Joi.string().required(),
      deviceName: Joi.string().required(),
    }
  },

  // UPDATE /api/devices/:deviceId
  updateDevice: {
    body: {
      entityId: Joi.string().uuid().required(),
      deviceType: Joi.string().required(),
      deviceName: Joi.string().required()
    },
    params: {
      deviceId: Joi.string().uuid().required()
    }
  }
};
