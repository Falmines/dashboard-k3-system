require("dotenv").config();

const fs = require("fs");
const path = require("path");
const pool = require("./config/db");

async function migrate() {
  const schemaPath = path.join(__dirname, "schema.sql");
  const schema = fs.readFileSync(schemaPath, "utf8");

  await pool.query(schema);
  console.log("Database schema berhasil diterapkan.");
}

migrate()
  .catch((error) => {
    console.error("Migrasi database gagal:", error.message);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
