import * as Joi from 'joi';

export const JoiValidationSchema = Joi.object({
  DB_PASSWORD: Joi.string().required(),
  DB_NAME: Joi.string().required(),
  DB_HOST: Joi.string().default('localhost'),
  DB_PORT: Joi.number().default(5432),
  DB_USERNAME: Joi.string().default('postgres'),
  PORT: Joi.number().default(3000),
  NODE_ENV: Joi.string().valid('dev', 'prod', 'test').default('dev'),
  HOST_API: Joi.string().uri().default('http://localhost:3000/api'),
  CLD_CLOUD_NAME: Joi.string().required(),
  CLD_API_KEY: Joi.string().required(),
  CLD_API_SECRET: Joi.string().required(),
});
