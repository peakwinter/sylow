import Joi from 'joi';

export default {
  // POST /api/entities
  createEntity: {
    body: {
      entityName: Joi.string().required(),
      // contact: Joi.string().uuid().required(),
      passwordHash: Joi.string().required(),
      passwordSalt: Joi.string().required(),
      keypair: Joi.object({
        public: Joi.string().required(),
        private: Joi.string()
      }).required()
    }
  },

  // UPDATE /api/entities/:entityId
  updateEntity: {
    body: {
      entityName: Joi.string().required(),
      // contact: Joi.string().uuid().required(),
      passwordHash: Joi.string(),
      passwordSalt: Joi.string(),
      keypair: Joi.object({
        public: Joi.string().required(),
        private: Joi.string()
      }).required()
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
  }
};
