const XLSX_PATH='data/GBL-MSME-directory.xlsx';
const FALLBACK=`business_id,business_name,owner,category,location,verification_status,last_verified,summary,image,goal_zar,raised_zar,donation_url,contact_email,funder_name,contribution_zar,contribution_type
hlengokuhle-cakes,Hlengokuhle Cakes,Hlengiwe Makhanya,Bakery and catering,"Madadeni, KwaZulu-Natal",Published programme story,,"With support to access baking equipment, business development training and coaching, Hlengiwe has expanded her bakery, increased production and built a growing customer base.",images/msmes/hlengokuhle-cakes.jpg,,,,info@finmark.org.za,National Youth Development Agency (NYDA),,Equipment and enterprise support
nothile-early-learning-academy,Nothile Early Learning Academy,Snothile Kubheka,Early childhood development,"Madadeni, KwaZulu-Natal",Published programme story,,"Business support and funding helped Snothile improve her facilities, accommodate more children, create employment opportunities and strengthen the centre's operations.",images/msmes/nothile-early-learning-academy.jpg,,,,info@finmark.org.za,National Youth Development Agency (NYDA),,Equipment and enterprise support
ntombenhle-fast-foods,Ntombenhle Fast Foods,Ntombenhle Ndlozi,Food services,KwaZulu-Natal,Published programme story,,"Training, coaching and productive equipment enabled Ntombenhle to grow from small-scale food sales into a catering enterprise serving larger events and community functions.",images/msmes/ntombenhle-fast-foods.jpg,,,,info@finmark.org.za,National Youth Development Agency (NYDA),,Equipment and enterprise support`;

// Backers are listed here once confirmed: ['Name','What they supported'], one per line. Empty = a short holding message.
const APPROVED_FUNDERS=[];

function parseCsv(text){
  const rows=[];let row=[],cell='',quoted=false;
  for(let i=0;i<text.length;i++){
    const ch=text[i];
    if(ch==='"'){
      if(quoted&&text[i+1]==='"'){cell+='"';i++;}else quoted=!quoted;
    }else if(ch===','&&!quoted){row.push(cell.trim());cell='';}
    else if((ch==='\n'||ch==='\r')&&!quoted){
      if(ch==='\r'&&text[i+1]==='\n')i++;
      row.push(cell.trim());cell='';if(row.some(v=>v!==''))rows.push(row);row=[];
    }else cell+=ch;
  }
  if(cell!==''||row.length){row.push(cell.trim());if(row.some(v=>v!==''))rows.push(row);}
  const headers=(rows.shift()||[]).map(v=>v.trim());
  return rows.map(values=>Object.fromEntries(headers.map((h,i)=>[h,(values[i]||'').trim()])))
    .filter(r=>r.business_id&&r.business_name);
}
function parseExcel(buffer){
  if(!window.XLSX) throw new Error('The Excel reader is unavailable');
  const workbook=XLSX.read(buffer,{type:'array',cellDates:true});
  const sheet=workbook.Sheets['MSME Directory']||workbook.Sheets[workbook.SheetNames[0]];
  if(!sheet) return [];
  return XLSX.utils.sheet_to_json(sheet,{defval:'',raw:false,dateNF:'yyyy-mm-dd'})
    .map(row=>Object.fromEntries(Object.entries(row).map(([key,value])=>[String(key).trim(),String(value??'').trim()])))
    .filter(row=>row.business_id&&row.business_name);
}

const esc=value=>String(value||'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
function safeUrl(value){try{const url=new URL(String(value||'').trim());return /^https?:$/.test(url.protocol)?url.href:'';}catch(_){return '';}}
function safeAsset(value){const v=String(value||'').trim();return /^(images\/[A-Za-z0-9_./-]+|https?:\/\/)/.test(v)?v:'';}
function formatMoney(value){const n=Number(String(value||'').replace(/[^\d.-]/g,''));return Number.isFinite(n)&&n>0?new Intl.NumberFormat('en-ZA',{style:'currency',currency:'ZAR',maximumFractionDigits:0}).format(n):'';}

let rows=parseCsv(FALLBACK);
const list=document.getElementById('businessList');
const status=document.getElementById('directoryStatus');
const fundersList=document.getElementById('fundersList');
const search=document.getElementById('businessSearch');

function groupedBusinesses(){
  const groups=new Map();
  rows.forEach(row=>{
    if(!groups.has(row.business_id))groups.set(row.business_id,{...row,funders:[]});
    if(row.funder_name)groups.get(row.business_id).funders.push(row);
  });
  return [...groups.values()];
}

function render(query=''){
  const q=query.trim().toLowerCase();
  const businesses=groupedBusinesses().filter(b=>!q||[b.business_name,b.owner,b.category,b.location].some(v=>String(v||'').toLowerCase().includes(q)));
  list.innerHTML=businesses.map(b=>{
    const image=safeAsset(b.image), donation=safeUrl(b.donation_url);
    const email=/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(b.contact_email||'')?b.contact_email:'info@finmark.org.za';
    const goal=formatMoney(b.goal_zar),raised=formatMoney(b.raised_zar);
    const action=donation
      ? `<a class="enterprise-action" href="${esc(donation)}" target="_blank" rel="noopener">Donate securely <span aria-hidden="true">↗</span></a>`
      : `<a class="enterprise-action secondary" href="mailto:${esc(email)}?subject=${encodeURIComponent(`Support ${b.business_name}`)}">Enquire about supporting</a>`;
    return `<article class="enterprise">
      ${image?`<img src="${esc(image)}" alt="${esc(b.business_name)}" loading="lazy" decoding="async">`:''}
      <span class="category">${esc(b.category)}</span><h3>${esc(b.business_name)}</h3>
      <p class="owner">${esc(b.owner)}${b.location?` · ${esc(b.location)}`:''}</p><p class="summary">${esc(b.summary)}</p>
      <details><summary>View business details</summary><dl><div><dt>Status</dt><dd>${esc(b.verification_status||'Awaiting verification')}${b.last_verified?` · ${esc(b.last_verified)}`:''}</dd></div>${goal?`<div><dt>Support goal</dt><dd>${goal}</dd></div>`:''}${raised?`<div><dt>Support recorded</dt><dd>${raised}</dd></div>`:''}</dl></details>${action}
    </article>`;
  }).join('')||'<p>No businesses match your search.</p>';
  status.textContent=`${businesses.length} enterprise profiles currently listed`;

  fundersList.innerHTML=APPROVED_FUNDERS.length?APPROVED_FUNDERS.map(([name,description])=>`<li><strong>${esc(name)}</strong><small>${esc(description)}</small></li>`).join(''):'<li class="backers-soon"><strong>Coming soon</strong><small>New backers will be recognised here once their support is confirmed.</small></li>';
}

search.addEventListener('input',()=>render(search.value));

async function load(){
  try{
    const response=await fetch(XLSX_PATH,{cache:'no-store'});
    if(!response.ok) throw new Error(`Excel request failed (${response.status})`);
    const parsed=parseExcel(await response.arrayBuffer());
    if(parsed.length) rows=parsed;
  }catch(_){}
  render();
}
load();
