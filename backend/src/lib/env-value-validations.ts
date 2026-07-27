import * as Joi from 'joi';

const DEFAULT_PORT = 3000;

export default Joi.object({
  PORT: Joi.number().default(DEFAULT_PORT),
  JWT_SECRET: Joi.string().min(32).required(),

  REDIS_ENABLED: Joi.boolean().default(true),
  REDIS_HOST: Joi.string().default('127.0.0.1'),
  REDIS_PORT: Joi.number().integer().default(6379),
  REDIS_USER: Joi.string().default('default'),
  REDIS_PASSWORD: Joi.string().default(''),

  DB_HOST: Joi.string().default('127.0.0.1'),
  DB_DATABASE: Joi.string().required(),
  DB_PASSWORD: Joi.string().required(),
  DB_USERNAME: Joi.string().required(),
  DB_SSL_REJECT_UNAUTHORIZED: Joi.boolean().default(true),
  DB_SSL_CA: Joi.string().optional(),
  SOCKETIO_ENDPOINT_ON: Joi.boolean().default(false),

  API_BASE_URL: Joi.string().default('/api'),
  DOCS_URL: Joi.string().default('/docs'),
  SOCKETIO_ENDPOINT: Joi.string().default('/ws'),
  PUBLIC_HOST_WITH_PORT: Joi.string().default(
    `http://localhost:${DEFAULT_PORT}`,
  ),
  FRONTEND_BUILD_PATH: Joi.string().default('public'),
  VERIFICATION_TOKEN_EXPIRY_HOURS: Joi.number().integer().default(24),
  PASSWORD_RESET_TOKEN_EXPIRY_HOURS: Joi.number().integer().default(1),
  OTP_EXPIRY_MINUTES: Joi.number().integer().default(10),
  ENABLE_NOTIFICATION_EMAILS: Joi.boolean().default(false),
  SCHEDULED_TASKS_ENABLED: Joi.boolean().default(false),

  SMTP_HOST: Joi.string().optional(),
  SMTP_PORT: Joi.number().integer().optional(),
  SMTP_SECURE: Joi.boolean().optional(),
  SMTP_USERNAME: Joi.string().optional(),
  SMTP_PASSWORD: Joi.string().optional(),
  MAIL_FROM_ADDRESS: Joi.string().email().optional(),
  MAIL_FROM_NAME: Joi.string().optional(),

  COOKIE_DOMAIN: Joi.string().default('localhost'),
  COOKIE_SECURE: Joi.boolean().default(false),
  BCRYPT_ROUNDS: Joi.number().integer().min(10).max(14).default(12),
  CORS_ORIGIN: Joi.string().default(`http://localhost:${DEFAULT_PORT}`),
});
