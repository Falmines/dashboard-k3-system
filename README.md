# Dashboard K3 Safety — HTML/CSS/JS + Node.js + PostgreSQL

## Arsitektur
Browser (HTML/CSS/JS) -> REST API Express -> PostgreSQL.
Frontend **tidak** terhubung langsung ke PostgreSQL; koneksi database hanya dilakukan backend.

## Setup Database
1. Buat database `k3_safety` di PostgreSQL.
2. Jalankan `backend/sql/schema.sql`.

## Setup Backend
```bash
cd backend
npm install
copy .env.example .env
```
Edit `.env`, terutama `DB_PASSWORD` dan `JWT_SECRET`.

Generate hash Admin:
```bash
npm run hash -- "Admin123!"
```
Salin hash ke contoh INSERT Admin pada `sql/schema.sql`, lalu jalankan INSERT tersebut.

Start:
```bash
npm run dev
```

Tes: buka `http://localhost:5000/api/health`.

## Setup Frontend
Jalankan frontend melalui Live Server/HTTP server (jangan hanya bergantung pada file://).
Contoh VS Code: klik kanan `frontend/index.html` -> Open with Live Server.

API default frontend: `http://localhost:5000/api`.

Login contoh setelah Admin dibuat:
- username: admin
- password: Admin123!

## Endpoint
- POST `/api/auth/login`
- GET/POST/PUT/DELETE `/api/users`
- GET/POST/PUT/DELETE `/api/incidents`
- GET/POST/PUT/DELETE `/api/observations`
- GET/POST/PUT/DELETE `/api/near-miss`
- GET `/api/dashboard/summary`
- GET `/api/dashboard/monthly`

Catatan: untuk produksi, batasi CORS, gunakan HTTPS, secret kuat, validasi lebih ketat, rate limiting, dan migrasi database.
