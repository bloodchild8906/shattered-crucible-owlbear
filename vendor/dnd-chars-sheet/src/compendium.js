import {entry,mod} from './model.js';
export const DEFAULT_SOURCE='https://raw.githubusercontent.com/5etools-mirror-3/5etools-src/main/data/';
const kinds=['class','subclass','classFeature','subclassFeature','race','background','feat','spell','item'];
export function plain(value,depth=0){if(depth>12)return '';if(typeof value==='string')return value.replace(/\{@\w+ ([^}]+)\}/g,(_,v)=>v.split('|')[0]);if(Array.isArray(value))return value.map(v=>plain(v,depth+1)).filter(Boolean).join('\n');if(value&&typeof value==='object')return [value.name,plain(value.entries??value.items??value.entry??value.rows,depth+1)].filter(Boolean).join(': ');return '';}
export function parseCompendium(raw,label='Homebrew'){
 if(!raw||typeof raw!=='object'||Array.isArray(raw))throw Error('Expected a 5etools JSON object.');
 const result=[];
 for(const kind of kinds)for(const data of (Array.isArray(raw[kind])?raw[kind]:[])){
 if(!data||typeof data.name!=='string')continue;
 const source=typeof data.source==='string'?data.source.slice(0,100):label;
 result.push({kind,name:data.name.slice(0,300),source,data});
 if(result.length>20000)throw Error('Compendium has too many entries.');
 }
 if(!result.length)throw Error('No supported classes, species, backgrounds, feats, spells or items found.');
 return result;
}
export function mergeCompendium(old,added){const map=new Map(old.map(e=>[e.kind+'|'+e.name+'|'+e.source,e]));for(const e of added)map.set(e.kind+'|'+e.name+'|'+e.source,e);return [...map.values()];}
export async function loadCompendium(kind,base=DEFAULT_SOURCE,fetcher=fetch){
 const root=new URL(base);if(root.protocol!=='https:')throw Error('Use an HTTPS data directory.');
 if(!root.pathname.endsWith('/'))root.pathname+='/';
 const json=async path=>{const response=await fetcher(new URL(path,root),{signal:AbortSignal.timeout(20000)});if(!response.ok)throw Error('Data source returned HTTP '+response.status);const text=await response.text();if(text.length>20000000)throw Error('Data file exceeds 20 MB.');return JSON.parse(text);};
 let paths;
 if(kind==='class'){const index=await json('class/index.json');paths=[...new Set(Object.values(index))].filter(p=>typeof p==='string'&&/^class-[a-z0-9-]+\.json$/i.test(p)).map(p=>'class/'+p);}
 else if(kind==='spell'){const index=await json('spells/index.json');paths=['PHB','XPHB'].filter(k=>index[k]).map(k=>'spells/'+index[k]);}
 else paths=[({race:'races.json',background:'backgrounds.json',feat:'feats.json',item:'items.json'})[kind]];
 if(!paths.length||paths.some(p=>!p))throw Error('No data files for this category.');
 let result=[];for(let i=0;i<paths.length;i+=3){const batches=await Promise.all(paths.slice(i,i+3).map(json));for(const raw of batches)result=mergeCompendium(result,parseCompendium(raw,'5etools'));}
 return result;
}
export function classRows(c){return c.classes?.length?c.classes:(c.className?[{name:c.className,source:'Legacy',subclass:c.subclass||'',level:c.level,hitDie:c.hitDie,spent:c.hitDiceSpent}]:[]);}
export function syncClasses(c){c.level=c.classes.reduce((n,r)=>n+r.level,0);c.className=c.classes.map(r=>r.name+' '+r.level).join(' / ');c.subclass=c.classes.map(r=>r.subclass).filter(Boolean).join(' / ');c.hitDiceSpent=c.classes.reduce((n,r)=>n+r.spent,0);c.hitDie=c.classes[0]?.hitDie||8;}
export function advance(c,{name,source='Custom',hitDie=8,hpGain,subclass='',features=[]}){
 name=String(name||'').trim().slice(0,300);if(!name)throw Error('Enter a class name.');
 const rows=classRows(c).map(r=>({...r}));const total=rows.reduce((n,r)=>n+r.level,0);
 if(total>=20)throw Error('Maximum total level is 20.');
 if(![4,6,8,10,12,20].includes(Number(hitDie)))throw Error('Choose a valid Hit Die.');
 const gain=Number(hpGain);if(!Number.isInteger(gain)||gain<1||gain>1000)throw Error('HP gained must be a whole number from 1 to 1000.');
 let row=rows.find(r=>r.name===name&&r.source===source);
 if(!row){row={name,source,hitDie:Number(hitDie),level:0,spent:0,subclass};rows.push(row);}
 row.level++;if(subclass)row.subclass=subclass;
 c.classes=rows;syncClasses(c);
 if(total===0){c.maxHp=gain;c.hp=gain;}else{c.maxHp+=gain;c.hp+=gain;}
 for(const f of features.filter(f=>f.data.className===name&&f.data.classSource===source&&Number(f.data.level)===row.level)){
 const origin=f.kind+'|'+f.name+'|'+f.source+'|'+row.level;
 if(!c.features.some(e=>e.origin===origin))c.features.push({...entry('features'),origin,name:f.name,description:plain(f.data.entries)+'\nSource: '+f.source});
 }
 return row;
}
export function addCompendiumEntry(c,e){
 const description=plain(e.data.entries)+'\nSource: '+e.source;
 if(e.kind==='race'){c.species=e.name;c.features.push({...entry('features'),name:e.name,description});return;}
 if(e.kind==='background'){c.background=e.name;c.features.push({...entry('features'),name:e.name,description});return;}
 const kind=e.kind==='spell'?'spells':e.kind==='item'?'items':'features';
 const origin=e.kind+'|'+e.name+'|'+e.source;
 if(c[kind].some(x=>x.origin===origin))throw Error('This entry is already on the sheet.');
 const value={...entry(kind),name:e.name,description,origin};
 if(kind==='spells'){value.level=Math.max(0,Math.min(9,Number(e.data.level)||0));value.prepared=false;value.ritual=!!e.data.meta?.ritual;value.concentration=!!e.data.duration?.some(d=>d.concentration);}
 if(kind==='items')value.weight=Number(e.data.weight)||0;
 c[kind].push(value);
}
