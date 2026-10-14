import {exportText,importExchange,validateExchange} from "./content-contract.js";
import {interpret5etools,toHomebrewExchange} from "./fiveetools-interpreter.js";
import {getHomebrew} from "./homebrew-contract.js";
import {buildView,handleModule} from "./suite-views.js";

const id=location.pathname.split("/").filter(Boolean).at(-1)||"compendium";
const moduleNames={compendium:"Illustrated Compendium",homebrew:"Homebrew Studio",characters:"Character Sheets",shops:"Scene Shop Manager",atlas:"World Atlas",journal:"GM Journal & Quests",encounters:"Encounter Director",reputation:"Reputation & Factions",handouts:"Player Handouts",music:"Music & Ambience",sfx:"Sound Effects"};
const moduleIcons={compendium:"▤",homebrew:"✦",characters:"♙",shops:"⚖",atlas:"⌖",journal:"✎",encounters:"⚔",reputation:"♛",handouts:"▣",music:"♫",sfx:"◖))"};
const key="shattered-crucible:v1:"+id;
const towns=["Ironhollow","Emberreach","Stormwatch","Thornwild","Ashenspire","Duskmire","Gloomfen","Sunscar","Frostwarden","Moonfen","Shattered Isles"];
const seed={
 compendium:[],homebrew:[],characters:[],
 shops:[{id:"ironhollow-foundry",name:"Ironhollow Foundry",type:"shop",sceneId:"*",town:"Ironhollow",keeper:"Hadrik",currency:"gp",inventory:[{name:"Iron Ingot",price:10,quantity:15},{name:"Skyforged Blade",price:250,quantity:1}],ledger:[]}],
 atlas:towns.map((name,i)=>({id:"town-"+i,name,type:"location",x:16+(i%4)*22,y:20+Math.floor(i/4)*29,notes:"",sceneUrl:""})),
 journal:[{id:"first-session",name:"Session 1 — The Crucible Stirs",type:"session",status:"Planned",notes:"Establish the adventuring party and introduce the first disturbances.",date:""}],
 encounters:[],
 reputation:[{id:"forge-council",name:"Ironhollow Forge Council",type:"faction",score:0,notes:"Dwarven craftspeople and guild politics.",history:[]},{id:"ashenspire",name:"Ashenspire Ethics College",type:"faction",score:0,notes:"Principled gnomish experimentation.",history:[]},{id:"duskmire",name:"Duskmire Experimental Union",type:"faction",score:0,notes:"Experimental goblin inventors.",history:[]}],
 handouts:[],music:[],sfx:[]
};
export const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
export const safeUrl=u=>{if(typeof u!=="string"||!/^https?:\/\//i.test(u))return "";try{let v=new URL(u);return (v.protocol==="https:"||(v.protocol==="http:"&&location.protocol==="http:"))?v.href:""}catch{return ""}};
export const uid=()=>globalThis.crypto?.randomUUID?.()||"id-"+Math.random().toString(36).slice(2);
export const scoreLabel=n=>n<=-70?"Hunted":n<=-30?"Hostile":n<0?"Distrusted":n<30?"Neutral":n<70?"Trusted":"Exalted";
export const num=(value,fallback=0)=>Number.isFinite(Number(value))?Number(value):fallback;
const $=s=>document.querySelector(s);
let stored;try{stored=JSON.parse(localStorage.getItem(key)||localStorage.getItem("sc-suite/"+id))}catch{}
if(Array.isArray(stored)&&!localStorage.getItem(key))try{localStorage.setItem(key,JSON.stringify(stored))}catch{}
let state=Array.isArray(stored)?stored:structuredClone(seed[id]||[]);
export const ctx={id,name:moduleNames[id]||id,icon:moduleIcons[id]||"✦",get records(){return state},set records(x){state=x},view:"library",selected:null,tab:"Overview",step:0,draft:{},filter:"",type:"item",notice:"",level:"info",catalog:{assets:[]},homebrew:{entries:[],packs:[],errors:[]},sceneId:null,sceneName:localStorage.getItem("sc-shop-location")||"No active Owlbear scene",sdk:null,connected:false,role:"GM",audio:null,activeAudioUrl:null,render,save,notify,navigate,getRecord,download,documentTitle:moduleNames[id]};
export function getRecord(id){return state.find(e=>e.id===id)}
export function save(){try{localStorage.setItem(key,JSON.stringify(state))}catch(err){notify("Saving failed. Export a backup: "+err.message,"error");return}render()}
export function notify(message,level="info"){ctx.notice=message;ctx.level=level;render()}
export function navigate(where){ctx.view=where;ctx.selected=null;ctx.draft={};ctx.step=0;render()}
export function download(text,name){let link=document.createElement("a");let u=URL.createObjectURL(new Blob([text],{type:"application/json"}));link.href=u;link.download=name;link.click();setTimeout(()=>URL.revokeObjectURL(u),1200)}
export function input(name,title,value="",type="text",options){const required=options?.required?" required":"";if(type==="textarea")return '<label>'+esc(title)+'<textarea name="'+esc(name)+'"'+required+'>'+esc(value)+'</textarea></label>';if(type==="select")return '<label>'+esc(title)+'<select name="'+esc(name)+'">'+(options?.values||[]).map(v=>'<option value="'+esc(v)+'"'+(String(value)===String(v)?" selected":"")+'>'+esc(v)+'</option>').join("")+'</select></label>';return '<label>'+esc(title)+'<input type="'+esc(type)+'" name="'+esc(name)+'" value="'+esc(value)+'"'+required+'></label>'}
export function button(text,action,attributes="",kind=""){return '<button type="button" class="button '+kind+'" data-action="'+esc(action)+'" '+attributes+'>'+text+'</button>'}
export function listRow(item,kind,extra=""){return '<div class="listrow"><div class="entryicon">'+esc(kind||"✦")+'</div><div class="grow"><b>'+esc(item.name||"Untitled")+'</b><span>'+esc(extra||item.type||"")+'</span></div>'+button("Open","open",'data-id="'+esc(item.id)+'"')+'</div>'}
function heading(){return '<header class="header"><div class="branding"><span class="sigil" aria-hidden="true">'+ctx.icon+'</span><div><div class="eyebrow">Shattered Crucible · Owlbear Rodeo</div><h1>'+esc(ctx.name)+'</h1></div></div><span class="small">'+(ctx.connected?"● Connected":"◌ Standalone")+'</span></header><nav class="nav" aria-label="Module navigation"><button class="'+(ctx.view!=="settings"?"on":"")+'" data-action="library">Overview</button><button data-action="create">＋ Create</button><button class="push '+(ctx.view==="settings"?"on":"")+'" data-action="settings">⚙ Settings</button></nav>'}
function settings(){return '<section class="hero"><div><h2>Settings & Data</h2><p>Manage Contract v1 content and local storage for '+esc(ctx.name)+'.</p></div></section><div class="panel"><h2>Import & Export</h2><p class="hint">All imports and exports use the validated sc.homebrew.entries Contract v1 format. Imports replace local records only after confirmation.</p><div class="row">'+button("↓ Export Contract v1","export",'',"primary")+'<label style="margin:0">Import Contract v1<input id="contractImport" type="file" accept=".json,application/json"></label></div>'+(ctx.id==="homebrew"?'<label>Convert a 5e.tools JSON document<input id="fiveImport" type="file" accept=".json,application/json"></label><p class="hint">Reports skipped records, then offers to import standardized homebrew.</p>':"")+'</div><div class="panel"><h2>Repository & Storage</h2><p>Pack content is read-only and fetched from GitHub. Changes you create are stored locally in this browser; they are never uploaded as Owlbear room metadata.</p><div class="row">'+button("↻ Refresh published content","refresh")+' '+button("Restore starter data","reset",'',"ghost")+'</div><p class="hint">Scene: '+esc(ctx.sceneName)+' · '+esc(ctx.sceneId||"not connected")+'</p><div class="links"><a href="../HOMEBREW_CONTRACT.md" target="_blank" rel="noopener">Contract documentation ↗</a><a href="../contracts/entries.schema.json" target="_blank" rel="noopener">JSON Schema ↗</a><a href="./README.md" target="_blank" rel="noopener">Module documentation ↗</a></div></div>'}
export function render(){const root=$("#app");if(!root)return;document.title="Crucible · "+ctx.name;root.innerHTML='<div class="shell">'+heading()+'<main class="content">'+(ctx.notice?'<div class="notice '+esc(ctx.level)+'">'+esc(ctx.notice)+'</div>':"")+(ctx.view==="settings"?settings():buildView(ctx))+'<p class="footnote">Shattered Crucible v1 · Contract v1 · '+(ctx.connected?"Owlbear connected":"Browser preview")+' · Local user data</p></main></div>';wireMap(root)}
async function refreshContent(){try{const [cat,brew]=await Promise.all([fetch("../content/assets-catalog.json").then(r=>{if(!r.ok)throw Error("Assets HTTP "+r.status);return r.json()}),getHomebrew()]);ctx.catalog=cat;ctx.homebrew=brew;if(ctx.id==="shops"){try{const sr=await fetch("../content/scene-shops.json");if(sr.ok){const pack=await sr.json();const {validateExchange}=await import("./content-contract.js");validateExchange(pack);let changed=false;for(const shop of pack.entries){if(!state.some(s=>s.id===shop.id)){state.push({...shop});changed=true}}if(changed)localStorage.setItem(key,JSON.stringify(state))}}catch(err){console.warn("Scene shop pack unavailable",err)}}ctx.notice="";render()}catch(err){console.warn("Catalog unavailable",err);ctx.notice="Repository content unavailable: "+err.message;ctx.level="error";render()}}
async function connect(){try{const {default:sdk}=await import("https://esm.sh/@owlbear-rodeo/sdk@2.3.0");if(sdk.isAvailable===false)return;ctx.sdk=sdk;await Promise.race([new Promise(resolve=>sdk.onReady(resolve)),new Promise((_,reject)=>setTimeout(()=>reject(Error("Owlbear startup timeout")),4500))]);ctx.role=await sdk.player.getRole();ctx.connected=true;async function sceneChanged(){try{if(await sdk.scene.isReady()){const maps=await sdk.scene.items.getItems(item=>item.layer==="MAP");const map=maps.find(item=>item.name)||maps[0];ctx.sceneId=map?.id||null;ctx.sceneName=map?.name||"Scene open (no named map)";}else{ctx.sceneId=null;ctx.sceneName="No active scene"}}catch{ctx.sceneId=null;ctx.sceneName="Scene unavailable"}render()}await sceneChanged();sdk.scene.onReadyChange(sceneChanged);render()}catch(err){console.info("Owlbear unavailable",err)}}
async function importFile(file,is5e=false){if(!file)return;try{const raw=JSON.parse(await file.text());let records;if(is5e){const result=interpret5etools(raw),normalized=toHomebrewExchange(result);records=importExchange("homebrew",normalized);const warning=result.report.skipped.map(x=>x.category+": "+x.reason).join("; ");if(!confirm("Converted "+records.length+" entries. Skipped: "+(warning||"none")+". Replace your local homebrew?"))return}else{records=importExchange(ctx.id,raw);if(!confirm("Replace "+state.length+" current records with "+records.length+" validated entries?"))return}state=records;save();notify("Imported "+records.length+" Contract v1 entries.","ok")}catch(err){notify("Import rejected: "+err.message,"error")}}
function getForm(event){const form=event.target.closest("form");return form?Object.fromEntries(new FormData(form).entries()):{}}
$("#app")?.addEventListener("change",async event=>{if(event.target.id==="sceneLocation"){ctx.sceneName=event.target.value;try{localStorage.setItem("sc-shop-location",ctx.sceneName)}catch{}render()}if(event.target.id==="contractImport")await importFile(event.target.files[0]);if(event.target.id==="fiveImport")await importFile(event.target.files[0],true);if(event.target.id==="audioFile"){const file=event.target.files[0];if(!file)return;try{if(!file.type.startsWith("audio/"))throw Error("Choose an audio file");if(file.size>30*1024*1024)throw Error("Audio is limited to 30 MB per file");await putAudio(file);ctx.draft={...ctx.draft,...Object.fromEntries(new FormData(document.querySelector("form")).entries()),source:"local",fileId:file.name,format:file.type};notify("Audio stored in this browser. Save the cue to add it.","ok")}catch(e){notify(e.message,"error")}}});
$("#app")?.addEventListener("input",event=>{if(event.target.id==="quickSearch"){ctx.filter=event.target.value;const cards=document.querySelectorAll("[data-filter-text]");for(const c of cards)c.hidden=!c.getAttribute("data-filter-text").includes(ctx.filter.toLowerCase())}});
$("#app")?.addEventListener("click",async event=>{const el=event.target.closest("[data-action]");if(!el)return;const action=el.dataset.action,entryId=el.dataset.id;try{
 if(action==="settings")return navigate("settings");
 if(action==="library")return navigate("library");
 if(action==="export")return download(exportText(id,state),"shattered-"+id+"-contract-v1.json");
 if(action==="reset"){if(confirm("Restore starter data? This replaces current local records.")){state=structuredClone(seed[id]||[]);save()}return}
 if(action==="refresh")return refreshContent();
 if(action==="create"){ctx.view="create";ctx.selected=null;ctx.draft={};ctx.step=0;return render()}
 if(action==="open"){ctx.view="detail";ctx.selected=entryId;ctx.tab="Overview";return render()}
 if(action==="delete"){if(confirm("Delete this record?")){state=state.filter(r=>r.id!==entryId);navigate("library");save()}return}
 if(action==="edit"){ctx.view="edit";ctx.selected=entryId;ctx.draft=structuredClone(getRecord(entryId)||{});ctx.step=0;return render()}
 if(action==="back"){return navigate("library")}
 if(action==="tab"){ctx.tab=el.dataset.tab;return render()}
 if(action==="notify")return notify(el.dataset.message);
 await handleModule(ctx,action,el,getForm(event));
 }catch(err){console.error(err);notify(err.message,"error")}});
render();refreshContent();connect();

// Blob-backed local audio, separate from Owlbear's image/scene asset library.
export function putAudio(file){return new Promise((resolve,reject)=>{let req=indexedDB.open("shattered-crucible-audio",1);req.onupgradeneeded=()=>req.result.createObjectStore("files");req.onerror=()=>reject(req.error);req.onsuccess=()=>{const db=req.result,tx=db.transaction("files","readwrite");tx.objectStore("files").put(file,file.name);tx.oncomplete=()=>{db.close();resolve()};tx.onerror=()=>reject(tx.error)}})}
export function getAudio(name){return new Promise((resolve,reject)=>{let req=indexedDB.open("shattered-crucible-audio",1);req.onerror=()=>reject(req.error);req.onsuccess=()=>{const db=req.result,tx=db.transaction("files","readonly"),get=tx.objectStore("files").get(name);get.onsuccess=()=>{db.close();resolve(get.result||null)};get.onerror=()=>reject(get.error)}})}

function wireMap(root){
 const map=root.querySelector("#atlasMap");if(!map)return;
 map.querySelectorAll("[data-pin]").forEach(pin=>{
   let start=null,moved=false;
   pin.onpointerdown=event=>{start={x:event.clientX,y:event.clientY};moved=false;pin.setPointerCapture(event.pointerId)};
   pin.onpointermove=event=>{if(!start)return;const r=map.getBoundingClientRect();if(Math.abs(event.clientX-start.x)+Math.abs(event.clientY-start.y)>5)moved=true;if(moved){pin.style.left=Math.max(1,Math.min(99,(event.clientX-r.left)/r.width*100))+"%";pin.style.top=Math.max(2,Math.min(98,(event.clientY-r.top)/r.height*100))+"%"}};
   pin.onpointerup=event=>{if(start&&moved){const rec=ctx.records.find(r=>r.id===pin.dataset.id);if(rec){rec.x=Math.round(parseFloat(pin.style.left)*100)/100;rec.y=Math.round(parseFloat(pin.style.top)*100)/100;ctx.selected=rec.id;save()}}start=null;};
 });
}
