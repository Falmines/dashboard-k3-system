const API_BASE="http://localhost:5000/api";
let reportTrendData=[];
const el=id=>document.getElementById(id);

async function loadReportTrend(){
 try{
  const r=await fetch(`${API_BASE}/pelaporan/trend`);
  const body=await r.json();
  if(!r.ok) throw new Error(body.message||`HTTP ${r.status}`);
  reportTrendData=Array.isArray(body)?body:[];
  renderReportTrend(reportTrendData);
 }catch(e){
  console.error(e);
  const l=el("report-trend-loading");
  if(l) l.textContent="Gagal memuat data: "+e.message;
 }
}

function renderReportTrend(data){
 const svg=el("report-trend-svg"), labels=el("report-trend-labels"), loading=el("report-trend-loading");
 if(!svg)return;
 if(loading)loading.style.display="none";
 svg.innerHTML=""; labels.innerHTML="";
 if(!data.length){svg.innerHTML='<text x="50%" y="50%" text-anchor="middle" fill="#64748b">Belum ada data laporan</text>';return;}
 const W=900,H=320,L=40,R=20,T=25,B=45,CW=W-L-R,CH=H-T-B;
 let max=Math.max(5,...data.flatMap(x=>[+x.incident||0,+x.observation||0,+x.near_miss||0,+x.completed||0]));
 max=Math.ceil(max/5)*5;
 for(let i=0;i<=5;i++){
  let y=T+CH*i/5;
  svg.insertAdjacentHTML("beforeend",`<line x1="${L}" x2="${W-R}" y1="${y}" y2="${y}" class="grid-line"/><text x="4" y="${y+4}" class="axis-label">${Math.round(max-max*i/5)}</text>`);
 }
 const series=[["incident","red"],["observation","green"],["near_miss","yellow"],["completed","purple"]];
 const x=i=>data.length===1?L+CW/2:L+i/(data.length-1)*CW;
 const y=v=>T+CH-(+v||0)/max*CH;
 series.forEach(([key,cls])=>{
  const pts=data.map((d,i)=>[x(i),y(d[key]),i]);
  svg.insertAdjacentHTML("beforeend",`<path d="${pts.map((p,i)=>(i?"L":"M")+" "+p[0]+" "+p[1]).join(" ")}" class="trend-line ${cls}"/>`);
  pts.forEach(p=>svg.insertAdjacentHTML("beforeend",`<circle cx="${p[0]}" cy="${p[1]}" r="5" class="trend-point ${cls}" data-index="${p[2]}"/>`));
 });
 svg.querySelectorAll(".trend-point").forEach(c=>{
  c.addEventListener("mouseenter",e=>showTip(+c.dataset.index,e));
  c.addEventListener("mouseleave",()=>el("report-trend-tooltip").hidden=true);
 });
 data.forEach((d,i)=>{
  const s=document.createElement("span"); s.textContent=d.month;
  s.style.left=`${data.length===1?50:i/(data.length-1)*100}%`; labels.appendChild(s);
 });
}
function showTip(i,e){
 const d=reportTrendData[i],t=el("report-trend-tooltip"),box=el("report-trend-chart").getBoundingClientRect();
 el("trend-tooltip-month").textContent=d.month;
 ["incident","observation","near_miss","completed"].forEach(k=>el("trend-tooltip-"+k.replace("_","-")).textContent=d[k]||0);
 t.hidden=false;t.style.left=Math.min(e.clientX-box.left+10,box.width-180)+"px";t.style.top=Math.max(5,e.clientY-box.top-80)+"px";
}
document.addEventListener("DOMContentLoaded",loadReportTrend);
