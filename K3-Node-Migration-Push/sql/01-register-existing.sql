-- Jalankan di database K3 yang sudah berisi tabel roles dan users.
-- Tidak membuat ulang atau menghapus tabel/data.
BEGIN;
INSERT INTO roles (name, description) VALUES ('Staff', 'Akses operasional dasar') ON CONFLICT (name) DO NOTHING;
-- Indeks case-insensitive menangani request bersamaan dan variasi huruf besar/kecil.
-- Jika ada data duplikat lama, seluruh transaksi dibatalkan. Audit dengan 00-precheck.sql.
CREATE UNIQUE INDEX IF NOT EXISTS users_username_ci_register ON users (lower(username));
CREATE UNIQUE INDEX IF NOT EXISTS users_email_ci_register ON users (lower(email));
COMMIT;
