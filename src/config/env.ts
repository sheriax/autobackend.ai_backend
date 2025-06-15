import dotenv from 'dotenv';
dotenv.config();

export default {
  GOOGLE_GENERATIVE_AI_API_KEY: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
  GOOGLE_API_KEY: process.env.GOOGLE_API_KEY,
  PORT: process.env.PORT || 3000,
  NODE_ENV: process.env.NODE_ENV || 'development'
};