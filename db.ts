import mariadb from "mariadb";
import dotenv from "dotenv";

dotenv.config();

const pool = mariadb.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "Diogo1q2w",
  database: process.env.DB_DATABASE || "produtosAPI",
  connectionLimit: 5,
});

export default pool;
