const express=require("express");
const router=express.Router();
const pool=require("../config/db");

router.get("/trend",async(req,res)=>{
 try{
  const {rows}=await pool.query(`
   SELECT TO_CHAR(DATE_TRUNC('month',report_date),'Mon YYYY') month,
    COUNT(*) FILTER(WHERE LOWER(TRIM(type))='insiden')::int incident,
    COUNT(*) FILTER(WHERE LOWER(TRIM(type))='observasi')::int observation,
    COUNT(*) FILTER(WHERE LOWER(REPLACE(REPLACE(TRIM(type),'-',' '),'_',' '))='near miss')::int near_miss,
    COUNT(*) FILTER(WHERE LOWER(TRIM(status))='selesai')::int completed
   FROM reports
   WHERE report_date IS NOT NULL
   GROUP BY DATE_TRUNC('month',report_date)
   ORDER BY DATE_TRUNC('month',report_date)
  `);
  res.json(rows);
 }catch(e){
  console.error("GET /api/pelaporan/trend:",e);
  res.status(500).json({success:false,message:"Gagal mengambil tren laporan",error:e.message});
 }
});
module.exports=router;
