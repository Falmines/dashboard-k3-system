// Tambahkan di backend/app.js/server.js setelah express(), cors() dan body parser:
const pelaporanRouter = require('./routes/pelaporan');
app.use('/api/pelaporan', pelaporanRouter);

// Pastikan juga:
app.use(express.json());
app.use(cors());
