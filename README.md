<<<<<<< HEAD
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
=======
# Register PT. JASIL — Dashboard K3 Safety

Modul HTML/CSS/JavaScript + Express/PostgreSQL sesuai kolom `users` pada lampiran. Identitas visual navy–hijau adalah konsep, bukan klaim logo resmi PT. JASIL. Tidak memuat password atau .env asli Anda.

## Isi dan perilaku

- Halaman responsif, pesan error per kolom, tampil/sembunyikan password, status loading dan konfirmasi sukses.
- Wajib: nama, nomor karyawan, username, email, password, konfirmasi password. Telepon, departemen dan jabatan opsional.
- Endpoint POST /api/auth/register; password bcrypt cost 12; role dari nama `Staff` di database, status `active`; nilai role/status client diabaikan.
- Username/email dinormalisasi huruf kecil; indeks unik menjaga duplikat termasuk request bersamaan. Nomor karyawan belum divalidasi terhadap master HR karena tabel tersebut tidak disediakan.
- Pembatasan 10 permintaan/15 menit per IP, satu proses Node. Untuk multi-instance gunakan limiter dengan shared store dan konfigurasi proxy sesuai infrastruktur.
- Akun Staff langsung aktif, sesuai alur register yang diminta. Ini bukan verifikasi kepegawaian/email. Jika sistem hanya untuk karyawan terverifikasi, integrasikan undangan/master HR atau persetujuan admin sebelum membuka pendaftaran ke internet.

## A. Jalankan sebagai modul terpisah

1. Ekstrak ZIP. Buka terminal pada folder `jasil-register`.
2. Jalankan `npm install`.
3. Salin `.env.example` menjadi `.env` lalu isi koneksi PostgreSQL Anda. Windows CMD: `copy .env.example .env`; Bash: `cp .env.example .env`.
4. Pada pgAdmin, buka database K3 yang benar. Jalankan `sql/00-precheck.sql`. Jika ada username/email duplikat, selesaikan duplikat tersebut terlebih dahulu tanpa menghapus data sembarangan.
5. Jalankan `sql/01-register-existing.sql`. Ini tidak menghapus tabel dan tidak mengubah status constraint.
6. Jalankan `npm start`.
7. Buka http://localhost:5001/register.html. Jangan membuka HTML dengan klik ganda untuk mengirim register.

Untuk database demo KOSONG, gunakan `sql/02-fresh-demo-only.sql` sebagai pengganti langkah 4–5. Jangan jalankan skrip demo pada database existing.

Setelah pendaftaran berhasil, gunakan login Dashboard K3 Anda. Modul ini tidak mengganti login/JWT lama. Isi `loginUrl` dalam `public/config.js` dengan alamat login existing untuk menampilkan tautan Masuk. Password baru kompatibel dengan login yang memanggil bcrypt.compare terhadap `users.password_hash` dan menerima status `active`.

## B. Pasang ke backend existing (disarankan)

Folder `src/app.js`, controller login, dan route login asli tidak ada dalam lampiran, sehingga paket ini adalah modul integrasi, bukan pengganti seluruh backend.

1. Salin folder `src` paket ini ke `backend/src/jasil-register/` (agar tidak menimpa file existing).
2. Pastikan dependency `bcrypt` tersedia: `npm install bcrypt`.
3. Di `backend/src/app.js`, setelah `app.use(express.json())` dan SEBELUM middleware autentikasi global, router lain yang memblokir path, handler 404 dan error handler, tambahkan:

```js
const pool = require('./config/database'); // gunakan pool existing; sesuaikan jika bernama db.js
require('./jasil-register/mount-register')(app, pool);
```

Jika variabel `pool` sudah ada, jangan deklarasikan ulang. Jangan menambah app.listen baru dan jangan mengganti authRoutes/login lama. Jika endpoint register sudah ada, pasang hanya satu implementasi.

4. Jalankan precheck dan migrasi existing seperti langkah A.
5. Salin keempat file `public/` ke folder frontend yang sama. Tambahkan tautan pada login existing:

```html
<a href="register.html">Belum punya akun? Daftar</a>
```

6. Jika frontend disajikan dari origin backend yang sama, registerUrl tetap `/api/auth/register`. Untuk frontend beda port, isi URL lengkap, misalnya `http://localhost:5000/api/auth/register`; izinkan origin frontend secara spesifik melalui konfigurasi CORS backend existing. Jangan memakai mode no-cors.
7. Isi `loginUrl` pada config.js sesuai nama/alamat login existing dan restart backend.

## Pengujian

`npm test` menjalankan pengujian controller, validasi, penolakan role client, konflik duplikat dan limiter menggunakan dependency tiruan. Pengujian ini tidak memerlukan PostgreSQL.

Verifikasi pada database Anda setelah instalasi: daftar akun uji, cek `role_id` Staff dan `status` active, login dengan akun tersebut, lalu ulangi username/email yang sama (harus 409). Jangan mencetak password_hash di layar umum. Pastikan otorisasi existing benar-benar membatasi Staff.

Pengujian otomatis paket tidak membuktikan koneksi ke database atau kompatibilitas login existing Anda; dua hal tersebut perlu diverifikasi di lingkungan lokal Anda. Tidak ada migrasi yang otomatis dijalankan saat server start.
>>>>>>> 36c69bc (Commit Register)
