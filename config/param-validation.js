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

  // POST /api/auth/login
  login: {
    body: {
      username: Joi.string().required(),
      password: Joi.string().required()
    }
  }
};
