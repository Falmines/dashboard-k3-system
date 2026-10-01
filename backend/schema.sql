CREATE TABLE IF NOT EXISTS roles (
  id SERIAL PRIMARY KEY,
  name VARCHAR(80) NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  employee_number VARCHAR(50),
  name VARCHAR(150) NOT NULL,
  username VARCHAR(80) NOT NULL UNIQUE,
  email VARCHAR(180) NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  phone VARCHAR(40),
  department VARCHAR(120),
  position VARCHAR(120),
  photo_url TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  role_id INTEGER REFERENCES roles(id) ON DELETE SET NULL,
  last_login TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CHECK (status IN ('active', 'inactive', 'pending'))
);

CREATE TABLE IF NOT EXISTS incidents (
  id SERIAL PRIMARY KEY,
  title VARCHAR(180) NOT NULL,
  category VARCHAR(100),
  location VARCHAR(180),
  reporter VARCHAR(150),
  incident_date TIMESTAMPTZ,
  status VARCHAR(40) NOT NULL DEFAULT 'Open',
  description TEXT,
  created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS observations (
  id SERIAL PRIMARY KEY,
  type VARCHAR(100),
  location VARCHAR(180),
  created_by VARCHAR(150),
  observation_date TIMESTAMPTZ,
  findings TEXT,
  follow_up TEXT,
  status VARCHAR(40) NOT NULL DEFAULT 'Open',
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS inspections (
  id SERIAL PRIMARY KEY,
  title VARCHAR(180),
  location VARCHAR(180),
  inspector VARCHAR(150),
  inspection_date TIMESTAMPTZ,
  findings TEXT,
  status VARCHAR(40) NOT NULL DEFAULT 'Open',
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS work_permits (
  id SERIAL PRIMARY KEY,
  work_type VARCHAR(120) NOT NULL,
  location VARCHAR(180),
  applicant VARCHAR(150),
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  status VARCHAR(40) NOT NULL DEFAULT 'Pending',
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS trainings (
  id SERIAL PRIMARY KEY,
  name VARCHAR(180) NOT NULL,
  category VARCHAR(100),
  trainer VARCHAR(150),
  capacity INTEGER DEFAULT 0,
  scheduled_at TIMESTAMPTZ,
  duration VARCHAR(80),
  status VARCHAR(40) NOT NULL DEFAULT 'Scheduled',
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ppe_equipment (
  id SERIAL PRIMARY KEY,
  name VARCHAR(180) NOT NULL,
  category VARCHAR(100),
  code VARCHAR(80),
  location VARCHAR(180),
  status VARCHAR(40) NOT NULL DEFAULT 'Tersedia',
  quantity INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS documents (
  id SERIAL PRIMARY KEY,
  name VARCHAR(180) NOT NULL,
  description TEXT,
  category VARCHAR(100),
  file_type VARCHAR(50),
  version VARCHAR(30),
  status VARCHAR(40) NOT NULL DEFAULT 'Active',
  file_url TEXT,
  uploaded_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS audits (
  id SERIAL PRIMARY KEY,
  name VARCHAR(180) NOT NULL,
  type VARCHAR(100),
  location VARCHAR(180),
  auditor VARCHAR(150),
  audit_date TIMESTAMPTZ,
  status VARCHAR(40) NOT NULL DEFAULT 'Planned',
  findings TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS corrective_actions (
  id SERIAL PRIMARY KEY,
  source VARCHAR(120),
  description TEXT NOT NULL,
  priority VARCHAR(40) NOT NULL DEFAULT 'Medium',
  assignee VARCHAR(150),
  due_date DATE,
  status VARCHAR(40) NOT NULL DEFAULT 'Open',
  resolution TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS risk_register (
  id SERIAL PRIMARY KEY,
  description TEXT NOT NULL,
  category VARCHAR(100),
  location VARCHAR(180),
  likelihood INTEGER,
  impact INTEGER,
  risk_score INTEGER,
  risk_level VARCHAR(40),
  status VARCHAR(40) NOT NULL DEFAULT 'Open',
  owner VARCHAR(150),
  mitigation TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS reports (
  id SERIAL PRIMARY KEY,
  type VARCHAR(100),
  description TEXT,
  location VARCHAR(180),
  reporter VARCHAR(150),
  report_date TIMESTAMPTZ,
  status VARCHAR(40) NOT NULL DEFAULT 'Open',
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS settings (
  id SERIAL PRIMARY KEY,
  setting_key VARCHAR(120) NOT NULL,
  setting_value TEXT,
  setting_group VARCHAR(80),
  description TEXT,
  is_public BOOLEAN NOT NULL DEFAULT FALSE,
  updated_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO roles (name, description) VALUES
  ('Super Admin', 'Akses penuh sistem'),
  ('Admin', 'Administrasi sistem'),
  ('Safety Officer', 'Pengelolaan keselamatan kerja'),
  ('Supervisor', 'Pemantauan dan persetujuan operasional'),
  ('Staff', 'Akses operasional dasar')
ON CONFLICT (name) DO NOTHING;

INSERT INTO settings (setting_key, setting_value) VALUES
  ('company_name', 'K3 Safety'),
  ('system_name', 'K3 Safety Management System'),
  ('admin_email', ''),
  ('company_address', ''),
  ('timezone', 'Asia/Jakarta (GMT +07:00)'),
  ('language', 'Bahasa Indonesia'),
  ('date_format', 'DD/MM/YYYY'),
  ('notify_incidents', 'true'),
  ('notify_corrective_actions', 'true'),
  ('notify_training', 'true'),
  ('notification_digest', 'Harian'),
  ('smtp_port', '587'),
  ('smtp_secure', 'true'),
  ('backup_enabled', 'true'),
  ('backup_time', '02:00'),
  ('backup_retention_days', '30'),
  ('api_enabled', 'false'),
  ('session_timeout', '60'),
  ('password_min_length', '8'),
  ('max_login_attempts', '5'),
  ('require_2fa', 'false'),
  ('dashboard_theme', 'Terang'),
  ('dashboard_density', 'Nyaman'),
  ('show_sidebar', 'true'),
  ('show_dashboard_cards', 'true')
ON CONFLICT DO NOTHING;

CREATE INDEX IF NOT EXISTS incidents_status_idx ON incidents(status);
CREATE INDEX IF NOT EXISTS incidents_date_idx ON incidents(incident_date);
CREATE INDEX IF NOT EXISTS observations_status_idx ON observations(status);
CREATE INDEX IF NOT EXISTS work_permits_status_idx ON work_permits(status);
CREATE INDEX IF NOT EXISTS trainings_status_idx ON trainings(status);
CREATE INDEX IF NOT EXISTS corrective_actions_status_idx ON corrective_actions(status);
CREATE INDEX IF NOT EXISTS risk_register_status_idx ON risk_register(status);
CREATE INDEX IF NOT EXISTS reports_status_idx ON reports(status);
CREATE UNIQUE INDEX IF NOT EXISTS settings_key_unique_idx ON settings(setting_key);
