import assert from 'node:assert/strict';
import worker,{parseTencentQuote,decodeXML,xmlTag} from './src/index.js';
const origFetch=globalThis.fetch;
const quote=Array(38).fill('0');quote[1]='恒生指數';quote[2]='HSI';quote[3]='23468.48';quote[4]='23393.32';quote[30]='2026/11/03 11:20:00';
const fixture={
 'dataType=fnd':{weatherForecast:[{forecastDate:'20261103'}]},
 'dataType=rhrread':{temperature:{data:[{place:'沙田',value:27}]},humidity:{data:[{value:83}]}},
 'dataType=warnsum':{},'dataType=swt':{swt:[]},
 'dataType=SRS':{data:[[11,3,'06:12','12:00','17:38']]},
 'dataType=HLT':{data:[[11,3,'03:12','1.3','11:30','2.4']]},
 '/route-stop/272A/':{data:[{stop:'ABCD',seq:10,service_type:'1'}]},
 '/stop/ABCD':{data:{name_tc:'博研路'}},
 '/eta/ABCD/272A/':{data:[{route:'272A',eta:new Date(Date.now()+5*60000).toISOString(),rmk_tc:'原定班次'}]},
 '/api/qt/clist/get':{data:{diff:[{f12:'HSI',f2:23468.48,f4:75.16,f86:1793685600}]}},
};
globalThis.fetch=async (raw)=>{
 const url=String(raw);
 if(url.includes('qt.gtimg.cn'))return new Response(`v_hkHSI="${quote.join('~')}";`,{status:200});
 if(url.includes('app/minute/query'))return new Response('min_data_hkHSI='+JSON.stringify({code:0,data:{hkHSI:{data:{date:'20261103',data:['0930 23393.32 0 0','0931 23400 0 0','0932 23412 0 0','0933 23420 0 0']}}}})+';');
 if(url.includes('rss/'))return new Response('<rss><channel><item><title>香港交通 &amp; 財經</title><link>https://news.rthk.hk/news/item1</link><pubDate>Tue, 03 Nov 2026 11:00:00 +0800</pubDate></item></channel></rss>');
 const key=Object.keys(fixture).find(k=>url.includes(k));if(key)return new Response(JSON.stringify(fixture[key]),{headers:{'Content-Type':'application/json'}});
 return new Response('not found',{status:404});
};
async function get(path,origin='https://example.github.io',env={}){const req=new Request('https://test.worker.dev'+path,{headers:{Origin:origin}});const r=await worker.fetch(req,env,{});return {status:r.status,headers:r.headers,data:await r.json()}}
for (let path of ['/api/health','/api/weather','/api/forecast','/api/warnings','/api/tips','/api/sun?year=2026','/api/tides?year=2026&station=TPK','/api/bus','/api/news?category=local','/api/hsi','/api/hsi-chart']){
 const {status,data,headers}=await get(path);assert.equal(status,200,JSON.stringify(data));assert.equal(headers.get('access-control-allow-origin'),'*');console.log('OK',path,Object.keys(data).slice(0,4));
 if(path==='/api/hsi')assert.equal(data.price,23468.48);
 if(path==='/api/hsi-chart')assert.equal(data.series.length,4);
 if(path==='/api/bus')assert.equal(data.arrivals.length,1);
 if(path.startsWith('/api/news'))assert.equal(data.articles[0].title,'香港交通 & 財經');
}
let invalid=await get('/api/not-real');assert.equal(invalid.status,404);
let disallowed=await get('/api/health','https://bad.example',{ALLOWED_ORIGIN:'https://myuser.github.io'});assert.equal(disallowed.status,403);
let allowed=await get('/api/health','https://myuser.github.io',{ALLOWED_ORIGIN:'https://myuser.github.io'});assert.equal(allowed.status,200);
assert.equal(decodeXML('A &amp; B'),'A & B');assert.equal(xmlTag('<title><![CDATA[Test]]></title>','title'),'Test');
globalThis.fetch=origFetch;
console.log('CLOUDFLARE WORKER TESTS PASS');
