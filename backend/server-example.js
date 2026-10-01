// Tambahkan SETELAH app.use(express.json()) dan SEBELUM handler 404:
app.use("/api/pengaturan", require("./routes/pengaturan"));

// Pastikan HANYA ada SATU app.listen(...) pada server.js.
