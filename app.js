const TOKEN_DEFAULT = "95cb3b70361cd007ed14d59697f5afed4ab425708af1002577ef042dc1fc282b";
const PRODUCTS = [
  { key: "intradiario_1", name: "Intradiario 1", id: 600, icon: "I1", filterSpain: true },
  { key: "terciarias_subir", name: "Terciarias Subir", id: 2197, icon: "TS", filterSpain: false },
  { key: "banda_secundaria", name: "Banda secundaria", id: 2130, icon: "BS", filterSpain: false }
];
const state = { product: PRODUCTS[0], rows: [] };
const $ = id => document.getElementById(id);
const pad = n => String(n).padStart(2, "0");
const dateInput = d => `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
const formatNumber = v => Number.isFinite(v) ? new Intl.NumberFormat("es-ES", {maximumFractionDigits:2}).format(v) : "—";

function init(){
  $("token").value = TOKEN_DEFAULT;
  const now = new Date(); $("startDate").value = `${now.getFullYear()}-01-01`; $("endDate").value = dateInput(now);
  renderProducts(); bind();
}
function renderProducts(){
  $("productGrid").innerHTML = PRODUCTS.map(p => `<button class="product ${p.key===state.product.key?'active':''}" data-product="${p.key}"><span class="icon">${p.icon}</span><span><b>${p.name}</b><small>Indicador ${p.id}</small></span></button>`).join("");
  document.querySelectorAll("[data-product]").forEach(b => b.onclick = () => {state.product=PRODUCTS.find(p=>p.key===b.dataset.product);renderProducts();});
}
function bind(){
  $("queryBtn").onclick = query;
  $("clearBtn").onclick = clearResults;
  $("csvBtn").onclick = downloadCsv;
  $("excelBtn").onclick = downloadExcel;
  document.querySelectorAll("[data-range]").forEach(b => b.onclick=()=>setRange(b.dataset.range));
}
function setRange(type){
  const now=new Date(); let a,b;
  if(type==="month"){a=new Date(now.getFullYear(),now.getMonth(),1);b=now;}
  if(type==="year"){a=new Date(now.getFullYear(),0,1);b=now;}
  if(type==="prevyear"){a=new Date(now.getFullYear()-1,0,1);b=new Date(now.getFullYear()-1,11,31);}
  $("startDate").value=dateInput(a);$("endDate").value=dateInput(b);
}
function setStatus(text,type=""){const s=$("status");s.textContent=text;s.className=`status ${type}`;}
function clearResults(){state.rows=[];Plotly.purge("chart");$("chart").innerHTML='<div class="empty"><b>Sin datos todavía</b><span>Configura el periodo y pulsa “Consultar datos”.</span></div>';updateKpis();renderTable();setStatus("","");$("status").classList.add("hidden");}
async function query(){
  const start=$("startDate").value,end=$("endDate").value,token=$("token").value.trim();
  if(!start||!end||start>end){setStatus("Revisa el rango de fechas.","error");return;}
  if(!token){setStatus("Introduce el token ESIOS.","error");return;}
  const btn=$("queryBtn");btn.disabled=true;btn.textContent="Consultando…";setStatus("Descargando datos mes a mes…","");
  try{
    const chunks=monthChunks(start,end);const all=[];
    for(let i=0;i<chunks.length;i++){
      setStatus(`Descargando bloque ${i+1} de ${chunks.length}…`,"");
      const values=await fetchChunk(state.product,chunks[i][0],chunks[i][1],token);all.push(...values);
    }
    state.rows=normalize(all,state.product);
    if(!state.rows.length) throw new Error("La API no devolvió registros válidos para ese periodo.");
    setStatus(`Consulta completada: ${state.rows.length.toLocaleString('es-ES')} registros.`,"ok");
    updateKpis();drawChart();renderTable();$("csvBtn").disabled=false;$("excelBtn").disabled=false;
  }catch(err){console.error(err);setStatus(`Error: ${err.message}`,"error");}
  finally{btn.disabled=false;btn.textContent="Consultar datos";}
}
function monthChunks(start,end){
  const s=new Date(`${start}T00:00:00`),e=new Date(`${end}T23:59:59`),out=[];let cur=new Date(s);
  while(cur<=e){const last=new Date(cur.getFullYear(),cur.getMonth()+1,0,23,59,59);const stop=last<e?last:e;out.push([localIso(cur),localIso(stop)]);cur=new Date(stop);cur.setSeconds(cur.getSeconds()+1);}
  return out;
}
function localIso(d){return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;}
async function fetchChunk(product,start,end,token){
  const url=new URL(`https://api.esios.ree.es/indicators/${product.id}`);url.searchParams.set("start_date",start);url.searchParams.set("end_date",end);url.searchParams.set("time_trunc","minutes15");
  const response=await fetch(url,{headers:{Accept:"application/json; application/vnd.esios-api-v1+json","Content-Type":"application/json","x-api-key":token}});
  if(!response.ok) throw new Error(`ESIOS respondió HTTP ${response.status}`);
  const json=await response.json();if(!json.indicator||!Array.isArray(json.indicator.values)) throw new Error("Respuesta ESIOS sin indicator.values");return json.indicator.values;
}
function normalize(values,product){
  let rows=values;
  if(product.filterSpain){const filtered=rows.filter(r=>["españa","espana"].includes(String(r.geo_name||"").trim().toLowerCase()));if(filtered.length)rows=filtered;}
  const map=new Map();
  rows.forEach(r=>{const raw=r.datetime_utc||r.datetime;const dt=new Date(raw);const value=Number(r.value);if(Number.isNaN(dt.getTime())||!Number.isFinite(value))return;const key=`${dt.toISOString()}|${r.geo_id??r.geo_name??''}`;map.set(key,{fecha:dt,fechaIso:dt.toISOString(),precio:value,sistema:r.geo_name||"",geoId:r.geo_id??""});});
  return [...map.values()].sort((a,b)=>a.fecha-b.fecha);
}
function updateKpis(){const v=state.rows.map(r=>r.precio);$("kpiRows").textContent=v.length?v.length.toLocaleString("es-ES"):"—";$("kpiAvg").textContent=v.length?formatNumber(v.reduce((a,b)=>a+b,0)/v.length):"—";$("kpiMin").textContent=v.length?formatNumber(Math.min(...v)):"—";$("kpiMax").textContent=v.length?formatNumber(Math.max(...v)):"—";}
function drawChart(){
  $("chartTitle").textContent=`${state.product.name} · ${$("startDate").value} a ${$("endDate").value}`;
  const trace={x:state.rows.map(r=>r.fecha),y:state.rows.map(r=>r.precio),type:"scatter",mode:"lines",name:state.product.name,line:{color:"#29d3e8",width:1.6},fill:"tozeroy",fillcolor:"rgba(41,211,232,.08)",hovertemplate:"%{x|%d/%m/%Y %H:%M}<br><b>%{y:.2f} EUR/MWh</b><extra></extra>"};
  const layout={margin:{l:64,r:25,t:20,b:52},paper_bgcolor:"transparent",plot_bgcolor:"transparent",font:{color:"#9fb4c6"},xaxis:{gridcolor:"#183149",rangeslider:{visible:true,thickness:.08}},yaxis:{title:"EUR/MWh",gridcolor:"#183149",zerolinecolor:"#31506a"},hovermode:"x unified"};
  Plotly.newPlot("chart",[trace],layout,{responsive:true,displaylogo:false,modeBarButtonsToRemove:["lasso2d","select2d"]});
}
function renderTable(){const tbody=$("dataBody"),preview=state.rows.slice(0,500);$("tableCount").textContent=`${state.rows.length.toLocaleString('es-ES')} filas${state.rows.length>500?' · mostrando 500':''}`;tbody.innerHTML=preview.length?preview.map(r=>`<tr><td>${new Intl.DateTimeFormat('es-ES',{dateStyle:'short',timeStyle:'short'}).format(r.fecha)}</td><td>${formatNumber(r.precio)}</td><td>${escapeHtml(r.sistema)}</td><td>${escapeHtml(r.geoId)}</td></tr>`).join(""):'<tr><td colspan="4" class="muted">No hay resultados.</td></tr>';}
function escapeHtml(v){return String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
function fileBase(){return `ESIOS_${state.product.key.toUpperCase()}_${$("startDate").value}_${$("endDate").value}`;}
function flatRows(){return state.rows.map(r=>({FechaHora:r.fecha.toLocaleString("es-ES"),Precio_EUR_MWh:r.precio,Sistema:r.sistema,GeoID:r.geoId}));}
function downloadBlob(blob,name){const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);}
function downloadCsv(){const rows=flatRows();const csv=[Object.keys(rows[0]).join(";"),...rows.map(r=>Object.values(r).map(v=>`"${String(v).replaceAll('"','""')}"`).join(";"))].join("\n");downloadBlob(new Blob(["\ufeff"+csv],{type:"text/csv;charset=utf-8"}),fileBase()+".csv");}
function downloadExcel(){const wb=XLSX.utils.book_new();XLSX.utils.book_append_sheet(wb,XLSX.utils.json_to_sheet(flatRows()),state.product.name.slice(0,31));XLSX.utils.book_append_sheet(wb,XLSX.utils.json_to_sheet([{Producto:state.product.name,Indicador_ID:state.product.id,Desde:$("startDate").value,Hasta:$("endDate").value,Registros:state.rows.length,Fuente:`https://api.esios.ree.es/indicators/${state.product.id}`}]),"Informacion");XLSX.writeFile(wb,fileBase()+".xlsx");}
init();
