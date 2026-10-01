const express=require("express");
const router=express.Router();
const pool=require("../config/db");

const defaults={
 company_name:"PT. Perusahaan Indonesia",app_name:"K3 SAFETY",company_address:"",
 hse_email:"hse@company.com",company_phone:"",main_location:"Jakarta, Indonesia",timezone:"Asia/Jakarta",
 notify_incident:true,notify_overdue:true,notify_permit:true,notify_training:true,email_notification:false,
 session_timeout:60,min_password_length:8,strong_password:true,account_lock:true,
 date_format:"DD/MM/YYYY",items_per_page:10,language:"id",default_risk_level:"Medium"
};
const allowed=new Set(Object.keys(defaults));

async function ensureDefaults(client=pool){
 for(const [key,value] of Object.entries(defaults)){
  await client.query(`INSERT INTO settings(setting_key,setting_value,updated_at)
   VALUES($1,$2::jsonb,NOW()) ON CONFLICT(setting_key) DO NOTHING`,[key,JSON.stringify(value)]);
 }
}
async function allSettings(client=pool){
 const {rows}=await client.query("SELECT setting_key,setting_value FROM settings ORDER BY setting_key");
 return Object.fromEntries(rows.map(r=>[r.setting_key,r.setting_value]));
}

router.get("/",async(req,res)=>{
 try{await ensureDefaults();res.json({success:true,data:await allSettings()})}
 catch(e){console.error(e);res.status(500).json({success:false,message:"Gagal memuat pengaturan",error:e.message})}
});
router.put("/",async(req,res)=>{
 const client=await pool.connect();
 try{
  await client.query("BEGIN");
  for(const [key,value] of Object.entries(req.body||{})){
   if(!allowed.has(key))continue;
   await client.query(`INSERT INTO settings(setting_key,setting_value,updated_at)
    VALUES($1,$2::jsonb,NOW())
    ON CONFLICT(setting_key) DO UPDATE SET setting_value=EXCLUDED.setting_value,updated_at=NOW()`,
    [key,JSON.stringify(value)]);
  }
  await client.query("COMMIT");
  res.json({success:true,data:await allSettings()});
 }catch(e){await client.query("ROLLBACK");console.error(e);res.status(500).json({success:false,message:"Gagal menyimpan pengaturan",error:e.message})}
 finally{client.release()}
});
router.post("/reset",async(req,res)=>{
 const client=await pool.connect();
 try{
  await client.query("BEGIN");
  for(const [key,value] of Object.entries(defaults)){
   await client.query(`INSERT INTO settings(setting_key,setting_value,updated_at) VALUES($1,$2::jsonb,NOW())
    ON CONFLICT(setting_key) DO UPDATE SET setting_value=EXCLUDED.setting_value,updated_at=NOW()`,[key,JSON.stringify(value)]);
  }
  await client.query("COMMIT");res.json({success:true,data:await allSettings()});
 }catch(e){await client.query("ROLLBACK");res.status(500).json({success:false,message:"Reset gagal",error:e.message})}
 finally{client.release()}
});
router.get("/health",async(req,res)=>{
 try{const {rows}=await pool.query("SELECT current_database() database, NOW() time");res.json({success:true,...rows[0]})}
 catch(e){res.status(500).json({success:false,message:"Database tidak terhubung",error:e.message})}
});
module.exports=router;