/* My Day HK: Cloudflare Worker, optional bridge for GitHub Pages.
 * Fixed read-only upstreams only. No arbitrary URL proxy, tokens or API keys.
 * Market data are third-party delayed indications, NOT HKEX licensed data.
 */
const HKO='https://data.weather.gov.hk/weatherAPI/opendata/';
const KMB='https://data.etabus.gov.hk/v1/transport/kmb/';
const RSS={local:'https://rthk.hk/rthk/news/rss/c_expressnews_clocal.xml',china:'https://rthk.hk/rthk/news/rss/c_expressnews_greaterchina.xml',world:'https://rthk.hk/rthk/news/rss/c_expressnews_cinternational.xml'};
const TIDES=new Set(['TPK','QUB','CCH','TMW']);
const nowISO=()=>new Date().toISOString();
const num=x=>{const n=Number(x);return Number.isFinite(n)?n:null};
const round=x=>Math.round(x*100)/100;
const validPrice=x=>Number.isFinite(x)&&x>1000&&x<100000;
const errMsg=e=>e?.message||String(e);
const requestHeaders={'Accept':'application/json,text/plain,application/xml,*/*','User-Agent':'Mozilla/5.0 (compatible; MyDayHKDashboard/4.0)'};
const urls={
  tencent:'https://qt.gtimg.cn/q=hkHSI',
  tencentMinutes:'https://web.ifzq.gtimg.cn/appstock/app/minute/query?_var=min_data_hkHSI&code=hkHSI',
  yahoo:'https://query1.finance.yahoo.com/v8/finance/chart/%5EHSI',
  east:'https://push2.eastmoney.com/api/qt/clist/get?pn=1&pz=10&fid=f3&fs=i%3A100.HSI&fields=f12%2Cf14%2Cf2%2Cf3%2Cf4%2Cf86&fltt=2',
  eastMinute:'https://push2delay.eastmoney.com/api/qt/stock/trends2/get?secid=100.HSI&ndays=1&iscr=0&fields1=f1,f2,f3,f4,f5,f6,f7,f8,f9,f10,f11,f12,f13&fields2=f51,f52,f53,f54,f55,f56,f57,f58,f59,f60,f61,f62&ut=fa5fd1943c7b386f172d6893dbfba10b',
};
async function upstream(u,{timeout=9000,format='json'}={}){
  const ctl=new AbortController(),timer=setTimeout(()=>ctl.abort(),timeout);
  try{const r=await fetch(u,{headers:requestHeaders,signal:ctl.signal});if(!r.ok)throw Error(`Upstream HTTP ${r.status}`);
    if(format==='text')return await r.text();if(format==='bytes')return await r.arrayBuffer();return await r.json();
  }finally{clearTimeout(timer)}
}
function responseJson(payload,status=200,origin='*'){
  return new Response(JSON.stringify(payload),{status,headers:{'content-type':'application/json;charset=utf-8','access-control-allow-origin':origin,'access-control-allow-methods':'GET, OPTIONS','access-control-allow-headers':'Content-Type','cache-control':'public, max-age=30','x-content-type-options':'nosniff'}});
}
async function cached(req,ctx,seconds,producer,origin){
  const cache=globalThis.caches?.default;const key=new Request(req.url,{method:'GET'});
  if(cache){const hit=await cache.match(key);if(hit){const res=new Response(hit.body,hit);res.headers.set('access-control-allow-origin',origin);return res;}}
  const data=await producer();const res=responseJson(data,200,origin);res.headers.set('cache-control',`public, max-age=${seconds}, s-maxage=${seconds}`);
  if(cache&&ctx?.waitUntil)ctx.waitUntil(cache.put(key,res.clone()));return res;
}
function parseTencentQuote(raw){const matched=raw.match(/v_hkHSI\s*=\s*"([^"]+)"/i);if(!matched)throw Error('Tencent quote format');
 const f=matched[1].split('~');if(f.length<32||f[2].toUpperCase()!=='HSI')throw Error('Tencent symbol mismatch');
 const price=num(f[3]),prev=num(f[4]);if(!validPrice(price)||!validPrice(prev))throw Error('Tencent invalid quote');
 const ts=(f[30]||'').trim();let stamp=null;
 let m=ts.match(/^(\d{4})\/(\d\d)\/(\d\d) (\d\d:\d\d:\d\d)$/);if(m)stamp=`${m[1]}-${m[2]}-${m[3]}T${m[4]}+08:00`;
 m=ts.match(/^(\d{4})(\d\d)(\d\d)(\d\d)(\d\d)(\d\d)$/);if(m)stamp=`${m[1]}-${m[2]}-${m[3]}T${m[4]}:${m[5]}:${m[6]}+08:00`;
 if(!stamp||!Number.isFinite(Date.parse(stamp)))throw Error('Tencent timestamp not validated');
 return {symbol:'^HSI',price:round(price),previous_close:round(prev),change:round(price-prev),change_pct:round((price-prev)/prev*100),market_time:stamp,series:[],source:'騰訊行情',delayed:true,fetched_at:nowISO()};
}
async function tencentQuote(){const buf=await upstream(urls.tencent,{format:'bytes'});const text=new TextDecoder('gb18030').decode(buf);return parseTencentQuote(text)}
function parseYahoo(v){const r=v?.chart?.result?.[0],meta=r?.meta;if(!r||!meta)throw Error('Yahoo chart empty');
 const entries=r?.indicators?.quote?.[0]?.close||[],times=r.timestamp||[];const series=[];
 for(let i=0;i<Math.min(entries.length,times.length);i++){const price=num(entries[i]);if(validPrice(price))series.push({time:Number(times[i]),price:round(price)})}
 const price=num(meta.regularMarketPrice)??series.at(-1)?.price,prev=num(meta.chartPreviousClose)||num(meta.previousClose);if(!validPrice(price)||!validPrice(prev))throw Error('Yahoo price incomplete');
 const stamp=num(meta.regularMarketTime)||series.at(-1)?.time;
 return {symbol:'^HSI',price:round(price),previous_close:round(prev),change:round(price-prev),change_pct:round((price-prev)/prev*100),market_time:stamp?new Date(stamp*1000).toISOString():null,source:'Yahoo Finance',delayed:true,series,fetched_at:nowISO()};
}
async function yahooChart(range='1d',interval='5m'){return parseYahoo(await upstream(`${urls.yahoo}?range=${range}&interval=${interval}`))}
function parseEastQuote(v){let x=v?.data?.diff||[];if(!Array.isArray(x))x=Object.values(x);const row=x.find(a=>String(a.f12).toUpperCase()==='HSI');if(!row)throw Error('Eastmoney symbol mismatch');const p=num(row.f2),chg=num(row.f4),prev=p-chg;if(!validPrice(p)||!validPrice(prev))throw Error('Eastmoney invalid price');
 let t=null;const raw=String(row.f86??'');if(/^\d{10}$/.test(raw))t=new Date(Number(raw)*1000).toISOString();else if(/^\d{13}$/.test(raw))t=new Date(Number(raw)).toISOString();
 else if(/^\d{14}$/.test(raw))t=`${raw.slice(0,4)}-${raw.slice(4,6)}-${raw.slice(6,8)}T${raw.slice(8,10)}:${raw.slice(10,12)}:${raw.slice(12,14)}+08:00`;
 return {symbol:'^HSI',price:round(p),previous_close:round(prev),change:round(chg),change_pct:round(chg/prev*100),market_time:t,series:[],source:'東方財富行情',delayed:true,fetched_at:nowISO()};
}
async function eastQuote(){return parseEastQuote(await upstream(urls.east))}
async function withFallback(producers){let errs=[];for(const fn of producers){try{return await fn()}catch(e){errs.push(`${fn.name}:${errMsg(e)}`)}}throw Error('無可用市場來源: '+errs.join(' | ').slice(0,250))}
async function hsiQuote(){const q=await withFallback([tencentQuote,eastQuote,yahooChart]);return {...q,series:[]}}
function validateTradeDay(day){if(!/^20\d{6}$/.test(day))throw Error('Missing trade date');const age=(Date.now()-Date.parse(`${day.slice(0,4)}-${day.slice(4,6)}-${day.slice(6,8)}T00:00:00+08:00`))/86400000;if(age>16||age< -2)throw Error('Chart is stale');}
async function tencentMinute(){let raw=(await upstream(urls.tencentMinutes,{format:'text'})).trim();if(!raw.startsWith('{')){const m=raw.match(/^[\w]+\s*=\s*(\{[\s\S]*\})\s*;?$/);if(!m)throw Error('Unexpected Tencent chart format');raw=m[1]}const node=JSON.parse(raw)?.data?.hkHSI?.data;if(!node)throw Error('Tencent missing HSI minute');const day=String(node.date||'').replaceAll('-','');validateTradeDay(day);
 const series=[];for(const v of node.data||[]){const m=String(v).match(/^(\d{2})(\d{2})\s+([\d.]+)/);if(!m)continue;const p=num(m[3]);if(validPrice(p))series.push({time:`${day} ${m[1]}:${m[2]}`,price:round(p)})}
 if(series.length<4)throw Error('No Tencent series');return {series,source:'騰訊財經分鐘線',period:'intraday',market_date:`${day.slice(0,4)}-${day.slice(4,6)}-${day.slice(6,8)}`};
}
async function eastMinute(){const d=(await upstream(urls.eastMinute))?.data;const series=[];if(String(d?.code||'HSI').toUpperCase()!=='HSI')throw Error('Not HSI');for(const v of d?.trends||[]){const p=String(v).split(',');if(!/^20\d{2}-\d{2}-\d{2} \d{2}:\d{2}$/.test(p[0]))continue;const price=num(p[1]);if(validPrice(price))series.push({time:p[0],price:round(price)})}if(series.length<4)throw Error('No Eastmoney minute series');const day=series.at(-1).time.slice(0,10);validateTradeDay(day.replaceAll('-',''));return {series:series.filter(x=>x.time.startsWith(day)),period:'intraday',source:'東方財富分鐘線',market_date:day}}
async function yahooMinute(){const q=await yahooChart('1d','5m');if(q.series.length<4)throw Error('Yahoo intraday empty');return {series:q.series,source:'Yahoo Finance 分時',period:'intraday',market_date:null}}
async function yahooDaily(){const q=await yahooChart('1mo','1d');if(q.series.length<4)throw Error('Yahoo daily empty');const latest=new Date(q.series.at(-1).time*1000);if(Date.now()-latest>16*86400000)throw Error('Yahoo daily stale');return {series:q.series,source:'Yahoo Finance 日線',period:'daily',market_date:latest.toISOString().slice(0,10)}}
async function hsiChart(){return await withFallback([tencentMinute,eastMinute,yahooMinute,yahooDaily])}
function decodeXML(s){return String(s||'').replace(/^<!\[CDATA\[([\s\S]*?)\]\]>$/,'$1').replace(/&#x([\da-f]+);/gi,(_,n)=>String.fromCodePoint(parseInt(n,16))).replace(/&#(\d+);/g,(_,n)=>String.fromCodePoint(parseInt(n,10))).replace(/&(amp|lt|gt|quot|apos|nbsp);/g,(_,m)=>({amp:'&',lt:'<',gt:'>',quot:'"',apos:"'",nbsp:' '}[m])).trim()}
function xmlTag(xml,tag){const m=xml.match(new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${tag}>`,'i'));return decodeXML(m?.[1]||'')}
async function news(cat){if(!RSS[cat])throw Error('Unknown RSS category');const raw=await upstream(RSS[cat],{format:'text'});const articles=[];for(const m of raw.matchAll(/<item\b[^>]*>([\s\S]*?)<\/item>/gi)){const title=xmlTag(m[1],'title'),url=xmlTag(m[1],'link'),date=xmlTag(m[1],'pubDate');if(title&&/^https?:\/\//i.test(url))articles.push({title,url,date:new Date(date).toString()!=='Invalid Date'?new Date(date).toISOString():''});if(articles.length===20)break}return {category:cat,articles,source:'RTHK RSS',fetched_at:nowISO()}}
async function kmbJSON(p){return await upstream(KMB+p,{timeout:8000})}
let resolvedBusStop=null, resolvedBusStopAt=0;
async function bus(){if(resolvedBusStop&&Date.now()-resolvedBusStopAt<12*3600000)return etaForStop(resolvedBusStop);let variants=[['outbound','1'],['inbound','1'],['outbound','2'],['inbound','2'],['outbound','3'],['inbound','3']];let matches=[];
 for(const [dir,kind] of variants){let rows;try{rows=(await kmbJSON(`route-stop/272A/${dir}/${kind}`))?.data||[]}catch{continue}const vicinity=rows.filter(r=>Number(r.seq)>=6&&Number(r.seq)<=15).slice(0,11);const out=await Promise.allSettled(vicinity.map(async r=>{const info=(await kmbJSON(`stop/${r.stop}`))?.data||{},name=String(info.name_tc||info.name_en||'');if(!/博研路|POK YIN|SILICON HILL|大埔大學山/i.test(name))return null;return {stop:r.stop,service:String(r.service_type||kind),seq:Number(r.seq),name}}));matches=out.filter(x=>x.status==='fulfilled'&&x.value).map(x=>x.value);if(matches.length)break}
 if(!matches.length)throw Error('未從官方車站名稱核實博研路');const found=matches[0];resolvedBusStop=found;resolvedBusStopAt=Date.now();return etaForStop(found)}
async function etaForStop(found){const d=await kmbJSON(`eta/${found.stop}/272A/${found.service}`),arr=[];const seen=new Set();
 for(const r of d?.data||[]){if(String(r.route).toUpperCase()!=='272A'||!r.eta||!Number.isFinite(Date.parse(r.eta)))continue;const stamp=Date.parse(r.eta);if(stamp<Date.now()-60000||stamp>Date.now()+5*3600000)continue;const k=Math.floor(stamp/30000);if(seen.has(k))continue;seen.add(k);arr.push({eta:r.eta,remark:r.rmk_tc||'',source:r.data_timestamp,service:r.service_type})}arr.sort((a,b)=>Date.parse(a.eta)-Date.parse(b.eta));return {station:found.name,route:'272A',arrivals:arr.slice(0,3),fetched_at:nowISO(),source:'KMB Open Data'}}
async function route(path,query){switch(path){
 case '/api/weather':return upstream(HKO+'weather.php?dataType=rhrread&lang=tc');
 case '/api/forecast':return upstream(HKO+'weather.php?dataType=fnd&lang=tc');
 case '/api/warnings':return upstream(HKO+'weather.php?dataType=warnsum&lang=tc');
 case '/api/tips':return upstream(HKO+'weather.php?dataType=swt&lang=tc');
 case '/api/sun':{const y=Number(query.get('year')||new Date().getUTCFullYear());if(y<2020||y>2100)throw Error('Invalid year');return upstream(HKO+`opendata.php?dataType=SRS&year=${y}&rformat=json`)}
 case '/api/tides':{const y=Number(query.get('year')||new Date().getUTCFullYear()),st=query.get('station')||'TPK';if(!TIDES.has(st)||y<2020||y>2100)throw Error('Invalid tide parameters');return upstream(HKO+`opendata.php?dataType=HLT&year=${y}&station=${st}&rformat=json`)}
 case '/api/bus':return bus();
 case '/api/news':return news(query.get('category')||'local');
 case '/api/hsi':return hsiQuote();
 case '/api/hsi-chart':return hsiChart();
 case '/api/health':return {ok:true,version:'4.0',mode:'Cloudflare Worker',at:nowISO()};
 default:throw Error('Unknown endpoint')
}}
const TTL={'/api/weather':180,'/api/forecast':900,'/api/warnings':100,'/api/tips':120,'/api/sun':43200,'/api/tides':43200,'/api/bus':25,'/api/news':180,'/api/hsi':60,'/api/hsi-chart':180,'/api/health':10};
export default {async fetch(request,env,ctx){const u=new URL(request.url),allowed=String(env?.ALLOWED_ORIGIN||'').replace(/\/$/,'');const origin=request.headers.get('origin')||'';const cors=allowed||'*';
 if(allowed&&origin&&origin!==allowed)return responseJson({error:'Origin not allowed'},403,allowed);
 if(request.method==='OPTIONS')return new Response(null,{status:204,headers:{'access-control-allow-origin':cors,'access-control-allow-methods':'GET,OPTIONS','access-control-allow-headers':'Content-Type','access-control-max-age':'86400'}});
 if(request.method!=='GET')return responseJson({error:'Read-only API'},405,cors);
 if(!(u.pathname in TTL))return responseJson({error:'Not found'},404,cors);
 try{return await cached(request,ctx,TTL[u.pathname],()=>route(u.pathname,u.searchParams),cors)}catch(e){return responseJson({error:'upstream unavailable',detail:errMsg(e).slice(0,300),at:nowISO()},502,cors)}
 }};
export {parseTencentQuote,parseYahoo,parseEastQuote,decodeXML,xmlTag};
