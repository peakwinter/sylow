import Joi from 'joi';
import dotenv from 'dotenv';
import dotenvExpand from 'dotenv-expand';

const myEnv = dotenv.config();
dotenvExpand(myEnv);
const envConfig = Object.create(myEnv.parsed);

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
  SY_DOMAIN: Joi.string().required()
    .description('Domain on which entities should be based'),
  SY_ALLOW_SIGNUPS: Joi.boolean().default(true),
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
  domain: envVars.SY_DOMAIN,
  allowSignups: envVars.SY_ALLOW_SIGNUPS,
  schemaDomainWhitelist: envVars.SY_SCHEMA_DOMAIN_WHITELIST
};

const unvariableConfig = ['env', 'port', 'mongooseDebug', 'jwtSecret', 'mongo'];

export { config as default, unvariableConfig };
