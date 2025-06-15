import 'dotenv/config';

const env = {
  PORT: process.env.PORT || 3000,
  GOOGLE_API_KEY: process.env.GOOGLE_API_KEY,
  NODE_ENV: process.env.NODE_ENV || 'development',
};

export default env;