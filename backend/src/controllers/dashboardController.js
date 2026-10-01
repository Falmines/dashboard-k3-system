const pool=require("../config/database");
exports.summary=async(req,res,next)=>{try{const q=`SELECT
(SELECT COUNT(*) FROM incidents)::int total_incidents,
(SELECT COUNT(*) FROM observations)::int total_observations,
(SELECT COUNT(*) FROM near_misses)::int total_near_miss,
((SELECT COUNT(*) FROM incidents WHERE LOWER(status) IN ('completed','selesai','closed'))+
 (SELECT COUNT(*) FROM observations WHERE LOWER(status) IN ('completed','selesai','closed'))+
 (SELECT COUNT(*) FROM near_misses WHERE LOWER(status) IN ('completed','selesai','closed')))::int total_completed`;
const r=await pool.query(q);res.json({success:true,data:r.rows[0]})}catch(e){next(e)}};
exports.monthly=async(req,res,next)=>{try{const q=`WITH months AS (SELECT generate_series(1,12) m)
SELECT m.m month_number, TO_CHAR(TO_DATE(m.m::text,'MM'),'TMMonth') month,
(SELECT COUNT(*) FROM incidents i WHERE EXTRACT(MONTH FROM i.incident_date)=m.m AND EXTRACT(YEAR FROM i.incident_date)=EXTRACT(YEAR FROM CURRENT_DATE))::int incidents,
(SELECT COUNT(*) FROM observations o WHERE EXTRACT(MONTH FROM o.event_date)=m.m AND EXTRACT(YEAR FROM o.event_date)=EXTRACT(YEAR FROM CURRENT_DATE))::int observations,
(SELECT COUNT(*) FROM near_misses n WHERE EXTRACT(MONTH FROM n.event_date)=m.m AND EXTRACT(YEAR FROM n.event_date)=EXTRACT(YEAR FROM CURRENT_DATE))::int near_miss
FROM months m ORDER BY m.m`;const r=await pool.query(q);res.json({success:true,data:r.rows})}catch(e){next(e)}};
