export const EnvConfiguration = () => ({
  environment: process.env.NODE_ENV || 'dev',
  dbPassword: process.env.DB_PASSWORD,
  dbName: process.env.DB_NAME,
  dbHost: process.env.DB_HOST || 'localhost',
  dbPort: +process.env.DB_PORT || 5432,
  dbUser: process.env.DB_USERNAME || 'postgres',
  port: process.env.PORT || 3000,
  hostApi: process.env.HOST_API || 'http://localhost:3000/api',
  cloudName: process.env.CLD_CLOUD_NAME,
  apiKey: process.env.CLD_API_KEY,
  apiSecret: process.env.CLD_API_SECRET,
});
