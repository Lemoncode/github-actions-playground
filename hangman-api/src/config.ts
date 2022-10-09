import { config } from 'dotenv';

// TODO: Use connection string
config({
  path: '.env',
});

export default {
  database: {
    isActive: process.env.DATA_BASE_ACTIVE,
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    port: +process.env.DATABASE_PORT!,
    database: process.env.DATABASE_NAME,
    poolMin: +process.env.DATABASE_POOL_MIN!,
    poolMax: +process.env.DATABASE_POOL_MAX!,
  },
};
