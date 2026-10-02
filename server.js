'use strict';
require('dotenv').config();
const express = require('express');
const path = require('node:path');
const { Pool } = require('pg');
const pool = new Pool({ host: process.env.DB_HOST || 'localhost', port: Number(process.env.DB_PORT || 5432), database: process.env.DB_NAME || 'k3_safety', user: process.env.DB_USER || 'postgres', password: process.env.DB_PASSWORD, connectionTimeoutMillis: 5000 });
pool.on('error', e => console.error('PostgreSQL pool:', e.code || 'CONNECTION_ERROR'));
const app = express();
app.disable('x-powered-by');
app.use((req, res, next) => {
  res.set('X-Content-Type-Options', 'nosniff');
  res.set('Referrer-Policy', 'same-origin');
  res.set('Content-Security-Policy', "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'");
  next();
});
app.use(express.json({ limit: '16kb' }));
require('./src/mount-register')(app, pool);
app.get('/', (req, res) => res.redirect('/register.html'));
app.use(express.static(path.join(__dirname, 'public')));
app.use((error, req, res, next) => {
  const status = error.type === 'entity.too.large' ? 413 : error.type === 'entity.parse.failed' ? 400 : 500;
  res.status(status).json({ success: false, message: status === 500 ? 'Terjadi kesalahan server.' : 'Format atau ukuran data tidak valid.' });
});
async function start() {
  await pool.query('SELECT 1');
  const server = app.listen(Number(process.env.PORT || 5001), () => console.log(`PT. JASIL Register: http://localhost:${process.env.PORT || 5001}/register.html`));
  for (const signal of ['SIGINT', 'SIGTERM']) process.once(signal, () => server.close(() => pool.end()));
}
start().catch(error => { console.error('Koneksi database gagal:', error.code || 'CONNECTION_ERROR'); pool.end(); process.exitCode = 1; });
