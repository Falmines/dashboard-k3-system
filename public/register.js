'use strict';
const config = window.JASIL_CONFIG || {};
const form = document.querySelector('#register-form');
const notice = document.querySelector('#notice');
const submit = form.querySelector('[type=submit]');
const label = document.querySelector('#submit-label');
const login = document.querySelector('#login-link');
if (config.loginUrl) {
  const url = new URL(config.loginUrl, location.href);
  if (['http:', 'https:'].includes(url.protocol)) { login.href = url.href; login.hidden = false; document.querySelector('#login-note').textContent = 'Sudah punya akun?'; }
}
for (const button of document.querySelectorAll('.toggle')) button.addEventListener('click', () => {
  const input = document.getElementById(button.dataset.target);
  const show = input.type === 'password'; input.type = show ? 'text' : 'password';
  button.textContent = show ? 'Tutup' : 'Lihat'; button.setAttribute('aria-pressed', String(show));
  button.setAttribute('aria-label', `${show ? 'Sembunyikan' : 'Tampilkan'} ${input.id === 'password' ? 'password' : 'konfirmasi password'}`);
});
function showNotice(text, success = false) { notice.textContent = text; notice.className = success ? 'notice success' : 'notice'; notice.hidden = false; notice.focus(); }
function fieldError(key, text) {
  const field = form.elements.namedItem(key); const error = document.getElementById(`${key}-error`);
  if (field && error) { field.setAttribute('aria-invalid', 'true'); error.textContent = text; }
}
form.addEventListener('input', event => {
  if (event.target.name) { event.target.removeAttribute('aria-invalid'); const e = document.getElementById(`${event.target.name}-error`); if (e) e.textContent = ''; }
});
form.addEventListener('submit', async event => {
  event.preventDefault(); if (submit.disabled) return;
  notice.hidden = true;
  form.querySelectorAll('[aria-invalid]').forEach(e => e.removeAttribute('aria-invalid'));
  form.querySelectorAll('.field-error').forEach(e => e.textContent = '');
  const data = Object.fromEntries(new FormData(form));
  const errors = {};
  for (const input of form.querySelectorAll('input')) {
    if (input.required && !input.value.trim()) errors[input.name] = 'Kolom ini wajib diisi.';
    else if (!input.validity.valid) errors[input.name] = 'Format data tidak valid.';
  }
  data.username = data.username.trim().toLowerCase(); data.email = data.email.trim().toLowerCase();
  if (!/^[a-z0-9_.-]{3,80}$/.test(data.username)) errors.username = 'Gunakan minimal 3 huruf/angka; tanpa spasi.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) errors.email = 'Alamat email tidak valid.';
  if (data.phone.trim() && !/^\+?[0-9 ()-]{8,40}$/.test(data.phone.trim())) errors.phone = 'Nomor telepon tidak valid.';
  if (data.password.length < 8 || new TextEncoder().encode(data.password).length > 72) errors.password = 'Minimal 8 karakter, maksimal 72 byte.';
  if (data.password !== data.confirm_password) errors.confirm_password = 'Konfirmasi password tidak sama.';
  if (Object.keys(errors).length) { for (const [key, value] of Object.entries(errors)) fieldError(key, value); form.querySelector('[aria-invalid=true]').focus(); return; }
  if (location.protocol === 'file:') { showNotice('Jalankan server terlebih dahulu, lalu buka http://localhost:5001/register.html.'); return; }
  submit.disabled = true; label.textContent = 'Mendaftarkan akun…'; form.setAttribute('aria-busy', 'true');
  const controller = new AbortController(); const timeout = setTimeout(() => controller.abort(), 20000);
  try {
    const response = await fetch(config.registerUrl || '/api/auth/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data), signal: controller.signal });
    const result = await response.json().catch(() => { throw new Error('Respons server tidak valid. Periksa alamat API.'); });
    if (!response.ok || result.success !== true) {
      for (const [key, value] of Object.entries(result.errors || {})) fieldError(key, value);
      throw new Error(result.message || 'Pendaftaran gagal. Coba lagi.');
    }
    form.reset(); form.hidden = true;
    showNotice('Akun berhasil dibuat! Silakan masuk menggunakan username dan password Anda pada halaman login Dashboard K3 Safety.', true);
  } catch (error) {
    showNotice(error.name === 'AbortError' ? 'Permintaan melewati batas waktu. Akun mungkin sudah tersimpan; coba masuk atau hubungi administrator sebelum mendaftar ulang.' : error instanceof TypeError ? 'Tidak dapat menghubungi server. Pastikan backend aktif dan alamat API benar.' : error.message);
  } finally { clearTimeout(timeout); submit.disabled = false; label.textContent = 'Daftar sekarang'; form.removeAttribute('aria-busy'); }
});
