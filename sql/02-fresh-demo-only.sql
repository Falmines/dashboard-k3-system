-- HANYA untuk database kosong/demo. Untuk database existing gunakan 01-register-existing.sql.
BEGIN;
CREATE TABLE roles (id SERIAL PRIMARY KEY, name VARCHAR(80) NOT NULL UNIQUE, description TEXT);
CREATE TABLE users (
 id SERIAL PRIMARY KEY, role_id INTEGER NOT NULL REFERENCES roles(id),
 employee_number VARCHAR(50), name VARCHAR(150) NOT NULL,
 username VARCHAR(80) NOT NULL UNIQUE, email VARCHAR(180) NOT NULL UNIQUE,
 password_hash TEXT NOT NULL, phone VARCHAR(40), department VARCHAR(120), position VARCHAR(120),
 photo_url TEXT, status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active','inactive','suspended')),
 last_login TIMESTAMP, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO roles (name, description) VALUES ('Staff','Akses operasional dasar');
CREATE UNIQUE INDEX users_username_ci_register ON users (lower(username));
CREATE UNIQUE INDEX users_email_ci_register ON users (lower(email));
COMMIT;
