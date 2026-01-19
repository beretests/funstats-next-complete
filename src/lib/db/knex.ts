import createKnex, { Knex } from "knex";

const connectionString = process.env.PG_CONNECTION_STRING;

const config: Knex.Config = {
  client: "pg",
  connection: connectionString
    ? { connectionString }
    : {
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 5432,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_DATABASE,
        ssl: false
      },
  pool: {
    min: 2,
    max: 15
  }
};

const globalForKnex = globalThis as typeof globalThis & {
  knex?: Knex;
};

const knex = globalForKnex.knex ?? createKnex(config);

if (process.env.NODE_ENV !== "production") {
  globalForKnex.knex = knex;
}

export default knex;
