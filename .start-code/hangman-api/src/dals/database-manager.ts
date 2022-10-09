import { knex, Knex } from 'knex';
import config from '../config';

const { database } = config;

let db: Knex;

export const startConnection = () => {
  try {
    db = knex({
      client: 'pg',
      connection: {
        host: database.host,
        port: database.port,
        user: database.user,
        password: database.password,
      },
      pool: {
        min: database.poolMin,
        max: database.poolMax,
      },
    });
  } catch (error) {
    throw error;
  }
};

export const closeConnection = async () => {
  try {
    await db.destroy();
  } catch (error) {
    throw error;
  }
};
