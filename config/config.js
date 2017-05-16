import Joi from 'joi';
import dotenv from 'dotenv';

dotenv.config();
const envConfig = Object.create(process.env);

if (envConfig.SY_SCHEMA_DOMAIN_WHITELIST && typeof envConfig.SY_SCHEMA_DOMAIN_WHITELIST === 'string') {
  envConfig.SY_SCHEMA_DOMAIN_WHITELIST = envConfig.SY_SCHEMA_DOMAIN_WHITELIST.split(' ');
}

// define validation for all the env vars
const envVarsSchema = Joi.object({
  NODE_ENV: Joi.string()
    .allow(['development', 'production', 'test', 'provision'])
    .default('development'),
  PORT: Joi.number()
    .default(4040),
  MONGOOSE_DEBUG: Joi.boolean()
    .when('NODE_ENV', {
      is: Joi.string().equal('development'),
      then: Joi.boolean().default(true),
      otherwise: Joi.boolean().default(false)
    }),
  JWT_SECRET: Joi.string().required()
    .description('JWT Secret required to sign'),
  MONGO_HOST: Joi.string().required()
    .description('Mongo DB host url'),
  MONGO_PORT: Joi.number()
    .default(27017),
  SY_SCHEMA_DOMAIN_WHITELIST: Joi.array()
    .items(Joi.string().valid('sylow.network').required(), Joi.string().hostname())
}).unknown()
  .required();

const { error, value: envVars } = Joi.validate(envConfig, envVarsSchema);
if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

const config = {
  env: envVars.NODE_ENV,
  port: envVars.PORT,
  mongooseDebug: envVars.MONGOOSE_DEBUG,
  jwtSecret: envVars.JWT_SECRET,
  mongo: {
    host: envVars.MONGO_HOST,
    port: envVars.MONGO_PORT
  },
  sySchemaDomainWhitelist: envVars.SY_SCHEMA_DOMAIN_WHITELIST
};

export default config;
