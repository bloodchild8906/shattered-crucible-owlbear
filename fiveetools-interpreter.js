import {validateExchange} from "./content-contract.js";
const categories={item:"items",baseitem:"items",spell:"spells",monster:"monsters",race:"species",subrace:"species",class:"classes",subclass:"subclasses",background:"backgrounds",feat:"feats",optionalfeature:"feats",recipe:"recipes"};
const slug=s=>String(s||"entry").toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"").slice(0,55);
function stringifyEntries(entries,depth=0){if(depth>8)return "";return (Array.isArray(entries)?entries:[entries]).map(x=>typeof x==="string"?x:x&&typeof x==="object"?[x.name||"",x.entry||"",x.entries?stringifyEntries(x.entries,depth+1):"",x.items?stringifyEntries(x.items,depth+1):""].filter(Boolean).join(" "):"").join("\n").slice(0,16000)}
export function interpret5etools(doc,packId="imported-5etools"){
 if(!doc||Array.isArray(doc)||typeof doc!=="object")throw Error("Expected a 5e.tools JSON object");
 if(doc.contract==="sc.homebrew.entries")return {documents:[validateExchange(doc)],report:{converted:doc.entries.length,skipped:[],format:"contract-v1"}};
 const documents=[],skipped=[],seen=new Set();let converted=0;
 for(const [key,rows] of Object.entries(doc)){
  if(key.startsWith("_"))continue;
  if(!Array.isArray(rows)){skipped.push({category:key,reason:"Not a list"});continue}
  if(!categories[key]){skipped.push({category:key,count:rows.length,reason:"Unsupported category"});continue}
  const entries=[];
  for(const [index,raw] of rows.entries()){
   if(!raw||typeof raw.name!=="string"||!raw.name.trim()){skipped.push({category:key,index,reason:"Missing name"});continue}
   if(raw._copy){skipped.push({category:key,index,name:raw.name,reason:"Unresolved _copy inheritance"});continue}
   const base=slug(key+"-"+(raw.source||"unknown")+"-"+raw.name);let id=base,n=2;while(seen.has(categories[key]+":"+id))id=base.slice(0,55)+"-"+n++;seen.add(categories[key]+":"+id);
   const mechanics={};for(const f of ["level","school","time","range","components","duration","cr","ac","hp","speed","str","dex","con","int","wis","cha","size","alignment","dmg1","dmgType","rarity","value","weight","className","classSource","prerequisite","ability","resist","immune","trait","action","bonus","reaction","legendary","classFeatures","subclassFeatures","entriesHigherLevel"])if(raw[f]!==undefined)mechanics[f]=raw[f];
   entries.push({id,name:raw.name,type:key,description:stringifyEntries(raw.entries||raw.entry||[]),source:{system:"5etools",code:raw.source||"",page:raw.page??null},mechanics});converted++;
  }
  if(entries.length)documents.push(validateExchange({contract:"sc.homebrew.entries",schemaVersion:"1.0.0",packId,category:categories[key],entries}));
 }
 return {documents,report:{converted,skipped,format:"5etools"}};
}
export function toHomebrewExchange(result){
 const entries=result.documents.flatMap(doc=>doc.entries.map(e=>({...e,originCategory:doc.category,originRef:"sc://"+doc.packId+"/"+doc.category+"/"+e.id})));
 return validateExchange({contract:"sc.homebrew.entries",schemaVersion:"1.0.0",packId:"imported-5etools",category:"homebrew",entries});
}
