import pg from "pg";
import dotenv from "dotenv";
import path from "path";

// dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const { Pool } = pg;

export const pool = new Pool({
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "",
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT) || 5432,
  database: process.env.DB_DATABASE || "worldcup",
});

pool.on("error", (err) => {
  console.error("Unexpected error on idle client", err);
  process.exit(-1);
});