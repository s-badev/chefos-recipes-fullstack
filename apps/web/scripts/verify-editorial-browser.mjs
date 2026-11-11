import {spawn} from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';
const [mode='mock',base='http://127.0.0.1:3000']=process.argv.slice(2);
const repo=path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const out=path.join(repo,'docs/redesign/shots',mode==='mock'?'reference':'stage-b');fs.mkdirSync(out,{recursive:true});
const profile=fs.mkdtempSync(path.join(os.tmpdir(),'chefos-qa-'));
const chrome=spawn('C:/Program Files/Google/Chrome/Application/chrome.exe',['--headless=new','--disable-gpu','--no-first-run','--no-default-browser-check','--remote-debugging-port=0','--user-data-dir='+profile,'about:blank'],{windowsHide:true});
let ws;
try {
 const endpoint=await new Promise((resolve,reject)=>{const t=setTimeout(()=>reject(Error('Chrome timeout')),20000);let s='';chrome.stderr.on('data',d=>{s+=d;const m=s.match(/DevTools listening on (ws:\/\/[^\s]+)/);if(m){clearTimeout(t);resolve(m[1]);}});chrome.on('error',reject);});
 const origin=endpoint.replace(/^ws:/,'http:').split('/devtools/')[0];const targets=await(await fetch(origin+'/json/list')).json();ws=new WebSocket(targets.find(t=>t.type==='page').webSocketDebuggerUrl);await new Promise(r=>ws.onopen=r);
 let id=0;const pending=new Map(),errors=[];ws.onmessage=e=>{const m=JSON.parse(e.data);if(m.id){const p=pending.get(m.id);pending.delete(m.id);m.error?p.reject(Error(m.error.message)):p.resolve(m.result);}if(m.method==='Network.responseReceived'&&m.params.response.status>=400)errors.push(m.params.response.status+' '+m.params.response.url);};
 const send=(method,params={})=>new Promise((resolve,reject)=>{const n=++id;pending.set(n,{resolve,reject});ws.send(JSON.stringify({id:n,method,params}));});
 const ev=async expression=>(await send('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true})).result.value;
 const wait=ms=>new Promise(r=>setTimeout(r,ms));
 const shot=async(name,full=false)=>{const m=await send('Page.getLayoutMetrics');const params={format:'png',captureBeyondViewport:full};if(full)params.clip={x:0,y:0,width:m.cssLayoutViewport.clientWidth,height:m.cssContentSize.height,scale:1};const s=await send('Page.captureScreenshot',params);fs.writeFileSync(path.join(out,name+'.png'),Buffer.from(s.data,'base64'));};
 await send('Page.enable');await send('Network.enable');
 await send('Page.addScriptToEvaluateOnNewDocument',{source:`window.__perf={cls:0,lcp:0};new PerformanceObserver(l=>{for(const e of l.getEntries())if(!e.hadRecentInput)window.__perf.cls+=e.value}).observe({type:'layout-shift',buffered:true});new PerformanceObserver(l=>{for(const e of l.getEntries())window.__perf.lcp=e.startTime}).observe({type:'largest-contentful-paint',buffered:true});`});
 const routes=mode==='mock'?['home','catalog','recipe','about','auth','spec']:['/','/catalog','/catalog/shopska-salata','/about','/login'];
 const report=[];
 for(const width of mode==='mock'?[1440,390]:[390,768,1440])for(const route of routes){
 if(mode!=='mock'&&width===768&&route!=='/')continue;
 await send('Emulation.setDeviceMetricsOverride',{width,height:width===390?844:900,deviceScaleFactor:1,mobile:false});
 await send('Page.navigate',{url:mode==='mock'?'file:///'+repo+'/docs/redesign/motion-mock.html#'+route:base+route});
 for(let i=0;i<150;i++){if(await ev('document.readyState === "complete" && !!document.querySelector("main")'))break;await wait(200);}
 if(mode==='mock')await ev('document.documentElement.dataset.pal="D";document.documentElement.removeAttribute("data-font")');
 await ev('document.fonts.ready.then(()=>true)');await wait(2600);
 const name=(route==='/'?'home':route.replace(/^\//,'').replaceAll('/','-'))+'-'+width;
 const performance=await ev('window.__perf');
 if(mode!=='mock'&&route==='/')assert.equal(await ev('getComputedStyle(document.querySelector(".hero-sub")).opacity'),'1','Hero caption visible before scrolling');
 await shot(name+'-first');
 await ev('(async()=>{for(let y=0;y<document.documentElement.scrollHeight;y+=innerHeight*.65){scrollTo(0,y);await new Promise(r=>setTimeout(r,100));}scrollTo(0,0)})()');await wait(1600);await shot(name+'-full',true);
 const result=await ev('({width:innerWidth,overflow:Math.max(0,document.documentElement.scrollWidth-document.documentElement.clientWidth),h1:document.querySelector("h1")?getComputedStyle(document.querySelector("h1")).fontSize:null,bodyFont:getComputedStyle(document.body).fontFamily})');if(!result.h1)throw Error('Missing heading '+route);report.push({route,...result,performance});console.log(name+' '+JSON.stringify({...result,performance}));
 }
 const checks={};
 if(mode!=='mock'){
 const navigate=async(route='/')=>{await send('Page.navigate',{url:base+route});for(let i=0;i<100;i++){if(await ev('document.readyState === "complete" && !!document.querySelector("h1")'))break;await wait(100);}await wait(1000);};
 const key=async(key,modifiers=0)=>{const vk={Tab:9,Enter:13,Escape:27,ArrowRight:39}[key];await send('Input.dispatchKeyEvent',{type:'keyDown',key,code:key,windowsVirtualKeyCode:vk,nativeVirtualKeyCode:vk,modifiers});await send('Input.dispatchKeyEvent',{type:'keyUp',key,code:key,windowsVirtualKeyCode:vk,nativeVirtualKeyCode:vk,modifiers});await wait(80);};
 await send('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:false});await navigate();
 await key('Tab');checks.skipFocus=await ev('document.activeElement.classList.contains("skip-link")');await key('Enter');checks.skipDestination=await ev('document.activeElement.id==="main-content"');
 await ev('document.querySelector(".menu-toggle").click()');await wait(200);checks.menuOpen=await ev('document.querySelector("dialog").open');let trapped=true;for(let i=0;i<15;i++){await key('Tab');trapped=trapped&&await ev('document.activeElement.closest("dialog")!==null');}checks.menuFocusTrap=trapped;await key('Escape');checks.menuEscape=await ev('!document.querySelector("dialog").open && document.activeElement.classList.contains("menu-toggle")');
 await navigate();await ev('document.querySelector(".skip-link").focus()');let focusOK=true,railSeen=false;const focusFailures=[];for(let i=0;i<32;i++){await key('Tab');const a=await ev('({rail:document.activeElement.id==="category-rail",outline:getComputedStyle(document.activeElement).outlineStyle,width:parseFloat(getComputedStyle(document.activeElement).outlineWidth),tag:document.activeElement.tagName,html:document.activeElement.outerHTML.slice(0,200)})');if(a.rail)railSeen=true;if(!['BODY','HTML'].includes(a.tag)&&(!(a.width>=3)||a.outline==='none')){focusOK=false;focusFailures.push(a);}}checks.keyboardFocusVisible=focusOK;checks.focusFailures=focusFailures;checks.railReachable=railSeen;
 await ev('document.querySelector("#category-rail").focus()');await key('ArrowRight');await wait(400);checks.railKeyboardScroll=await ev('document.querySelector("#category-rail").scrollLeft>0');
 await send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});await navigate();checks.reduced=await ev('({mode:document.documentElement.dataset.motion,animation:getComputedStyle(document.querySelector(".hero img")).animationName,hidden:[...document.querySelectorAll("[data-r],.wi")].some(e=>getComputedStyle(e).opacity==="0")})');
 await send('Emulation.setEmulatedMedia',{features:[]});await send('Emulation.setScriptExecutionDisabled',{value:true});await navigate();checks.noJS=await ev('({heading:document.querySelector("h1").textContent,categories:document.querySelectorAll(".rc").length,rows:document.querySelectorAll(".row").length,hidden:[...document.querySelectorAll("[data-r],.wi")].some(e=>getComputedStyle(e).opacity==="0"),animation:getComputedStyle(document.querySelector(".hero img")).animationName,nav:getComputedStyle(document.querySelector(".desktop-nav")).display,overflow:document.documentElement.scrollWidth-document.documentElement.clientWidth})');await shot('home-no-js',true);await send('Emulation.setScriptExecutionDisabled',{value:false});
 await send('Emulation.setDeviceMetricsOverride',{width:1440,height:900,deviceScaleFactor:1,mobile:false});await navigate('/catalog');checks.catalogCardsBefore=await ev('document.querySelectorAll(".recipe-card").length');await ev('document.querySelector("#recipe-search").focus()');await send('Input.insertText',{text:String.fromCharCode(1058,1072,1088,1072,1090,1086,1088)});await wait(400);checks.search=await ev('({cards:document.querySelectorAll(".recipe-card").length,title:document.querySelector(".recipe-card h3")?.textContent})');
 await navigate('/catalog/shopska-salata');await send('Emulation.setEmulatedMedia',{media:'print'});checks.print=await ev('({background:getComputedStyle(document.body).backgroundColor,color:getComputedStyle(document.body).color,header:getComputedStyle(document.querySelector("header")).display,footer:getComputedStyle(document.querySelector("footer")).display,ingredients:!!document.querySelector(".ingredient-item"),sections:document.querySelectorAll(".recipe-print-section").length})');await shot('recipe-print',true);await send('Emulation.setEmulatedMedia',{media:''});
 for(const route of ['/register','/profile','/admin','/favorites']){const r=await fetch(base+route,{redirect:'manual'});checks[route]={status:r.status,location:r.headers.get('location')};}
 }
 fs.writeFileSync(path.join(out,'results.json'),JSON.stringify({report,checks,errors},null,2));console.log('Checks '+JSON.stringify(checks));console.log('HTTP errors '+JSON.stringify(errors));
 if(mode!=='mock'){
 for(const name of ['skipFocus','skipDestination','menuOpen','menuFocusTrap','menuEscape','keyboardFocusVisible','railReachable','railKeyboardScroll'])assert.equal(checks[name],true,name);
 assert.equal(checks.reduced.mode,'off');assert.equal(checks.reduced.hidden,false);assert.equal(checks.noJS.hidden,false);assert.equal(checks.noJS.categories,6);assert.equal(checks.noJS.rows,8);assert.equal(checks.search.cards,1);assert.equal(checks.print.header,'none');assert.equal(checks.print.footer,'none');assert.equal(checks.print.background,'rgb(255, 255, 255)');
 report.forEach(r=>assert.equal(r.overflow,0,r.route+' '+r.width));assert.ok(errors.every(e=>e.endsWith('/favicon.ico')),JSON.stringify(errors));
 }
 await send('Browser.close').catch(()=>{});
} finally {ws?.close();chrome.kill();}
