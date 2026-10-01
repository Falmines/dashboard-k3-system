require("dotenv").config();const app=require("./src/app");const pool=require("./src/config/database");
const port=process.env.PORT||5000;
pool.query("SELECT NOW()").then(()=>app.listen(port,()=>console.log(`K3 Safety API: http://localhost:${port}`))).catch(e=>{console.error("Database gagal terhubung:",e.message);process.exit(1)});
