'use strict';
function validate(body) {
  const errors = {};
  const data = {};
  if (!body || typeof body !== 'object' || Array.isArray(body)) return { errors: { form: 'Data formulir tidak valid.' }, data };
  const fields = { name: [150, true], employee_number: [50, true], username: [80, true], email: [180, true], phone: [40, false], department: [120, false], position: [120, false] };
  for (const [key, [max, required]] of Object.entries(fields)) {
    if (body[key] != null && typeof body[key] !== 'string') { errors[key] = 'Nilai harus berupa teks.'; continue; }
    const value = (body[key] || '').trim();
    data[key] = value || null;
    if (required && !value) errors[key] = 'Kolom ini wajib diisi.';
    else if (value.length > max) errors[key] = `Maksimal ${max} karakter.`;
  }
  if (data.username) {
    data.username = data.username.toLowerCase();
    if (!/^[a-z0-9_.-]{3,80}$/.test(data.username)) errors.username = 'Gunakan 3–80 huruf, angka, titik, garis bawah, atau tanda hubung.';
  }
  if (data.email) {
    data.email = data.email.toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) errors.email = 'Alamat email tidak valid.';
  }
  if (data.phone && !/^\+?[0-9 ()-]{8,40}$/.test(data.phone)) errors.phone = 'Nomor telepon tidak valid.';
  const password = body.password;
  if (typeof password !== 'string' || password.length < 8 || Buffer.byteLength(password, 'utf8') > 72) errors.password = 'Password minimal 8 karakter dan maksimal 72 byte.';
  if (typeof body.confirm_password !== 'string' || password !== body.confirm_password) errors.confirm_password = 'Konfirmasi password tidak sama.';
  data.password = password;
  return { data, errors };
}
module.exports = { validate };
