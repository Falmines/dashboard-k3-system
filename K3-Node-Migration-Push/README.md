# PT. JASIL — Node.js Migration & GitHub Push

Panduan untuk Dashboard K3 Safety • Git Bash Windows • 2 Oktober 2026

Repo tujuan: https://github.com/Falmines/dashboard-k3-system.git
Branch tujuan: master

## Mulai dari sini

Paket ini berisi dokumentasi dan helper, bukan salinan lengkap backend. Tidak ada migrasi database atau push ke GitHub yang dijalankan dari sesi ini. Skrip dijalankan di komputer Anda setelah perubahan ditinjau.

1. Baca DOKUMENTASI.md atau DOKUMENTASI.html (buka di browser).
2. Selesaikan konflik README dan periksa server/package yang benar.
3. Backup database, pasang modul Register, jalankan SQL migrasi dan uji lokal.
4. Commit file yang sudah diperiksa, lalu gunakan scripts/push-master.sh.

Temuan dari lampiran terbaru:
- README(1).md berisi konflik antara dokumentasi Dashboard dan Register.
- package(2).json bernama pt-jasil-register; script-nya hanya start dan test.
- server(2).js memuat ./src/mount-register dan public; ini server Register mandiri, bukan backend Dashboard lengkap.
- check-database(3).sql memeriksa reports, bukan migrasi tabel users.
- .env asli tidak disertakan dalam ZIP. Contoh konfigurasi di templates menggunakan placeholder.

Isi:
- DOKUMENTASI.md / .html: panduan lengkap dan troubleshooting.
- scripts/setup-node.sh: instalasi dependency sesuai lockfile, tanpa menimpa .env.
- scripts/backup-db.sh: backup PostgreSQL format custom.
- scripts/push-master.sh: pemeriksaan repo, backup branch, fetch, rebase, push tanpa force.
- templates/README-resolved.md: usulan gabungan README tanpa penanda konflik.
- templates/backend.env.example dan gitignore-snippet.txt: konfigurasi aman untuk disesuaikan.
- sql/00-precheck.sql dan 01-register-existing.sql: pemeriksaan duplikat dan migrasi Register.
- VERIFIKASI.md: hasil pengujian paket dan batasannya.

Jalankan skrip dengan `bash path/ke/script.sh`; jangan menjalankan semua skrip sekaligus tanpa membaca prasyaratnya.
