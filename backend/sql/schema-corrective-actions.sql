-- Jalankan pada database k3_safety.
-- Jika tabel corrective_actions sudah ada dengan struktur berbeda,
-- jangan drop tabel produksi. Bandingkan kolom terlebih dahulu.

CREATE TABLE IF NOT EXISTS corrective_actions (
  id BIGSERIAL PRIMARY KEY,
  action_code VARCHAR(50) NOT NULL UNIQUE,
  source VARCHAR(80) NOT NULL,
  description TEXT NOT NULL,
  priority VARCHAR(20) NOT NULL CHECK (priority IN ('High','Medium','Low')),
  assignee VARCHAR(120) NOT NULL,
  due_date DATE NOT NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'Open' CHECK (status IN ('Open','In Progress','Closed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_corrective_actions_status ON corrective_actions(status);
CREATE INDEX IF NOT EXISTS idx_corrective_actions_priority ON corrective_actions(priority);
CREATE INDEX IF NOT EXISTS idx_corrective_actions_due_date ON corrective_actions(due_date);
CREATE INDEX IF NOT EXISTS idx_corrective_actions_source ON corrective_actions(source);

-- Contoh data hanya untuk testing lokal. Hapus blok ini jika database sudah berisi data nyata.
-- INSERT INTO corrective_actions (action_code,source,description,priority,assignee,due_date,status)
-- VALUES ('CA-2026-001','Observasi','Contoh tindakan korektif', 'High','Admin K3',CURRENT_DATE + 7,'Open');
