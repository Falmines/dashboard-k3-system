-- Jalankan pada database k3_safety.
-- Tabel users mengikuti struktur yang diminta.
CREATE TABLE IF NOT EXISTS users (
 id SERIAL PRIMARY KEY,
 role_id INTEGER NOT NULL,
 employee_number VARCHAR(50),
 name VARCHAR(120) NOT NULL,
 username VARCHAR(60) UNIQUE NOT NULL,
 email VARCHAR(150) UNIQUE NOT NULL,
 password_hash VARCHAR(255) NOT NULL,
 phone VARCHAR(30),
 department VARCHAR(100),
 position VARCHAR(100),
 photo_url TEXT,
 status VARCHAR(20) NOT NULL DEFAULT 'active',
 created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
 updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS incidents (
 id SERIAL PRIMARY KEY,title VARCHAR(200) NOT NULL,description TEXT NOT NULL,
 location VARCHAR(200) NOT NULL,incident_date DATE NOT NULL,severity VARCHAR(30) DEFAULT 'Low',
 status VARCHAR(30) DEFAULT 'Open',reported_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
 created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS observations (
 id SERIAL PRIMARY KEY,title VARCHAR(200) NOT NULL,description TEXT NOT NULL,location VARCHAR(200),
 event_date DATE,status VARCHAR(30) DEFAULT 'Open',reported_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
 created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS near_misses (
 id SERIAL PRIMARY KEY,title VARCHAR(200) NOT NULL,description TEXT NOT NULL,location VARCHAR(200),
 event_date DATE,status VARCHAR(30) DEFAULT 'Open',reported_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
 created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Setelah generate bcrypt hash, buat Admin seperti:
-- INSERT INTO users(role_id,employee_number,name,username,email,password_hash,department,position)
-- VALUES(1,'ADM001','Administrator','admin','admin@example.com','$2b$10$GANTI_DENGAN_HASH','IT','Administrator');
