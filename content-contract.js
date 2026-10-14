const CONTRACT="sc.homebrew.entries",VERSION="1.0.0";
export const categories={compendium:"locations",homebrew:"homebrew",characters:"characters",shops:"shops",atlas:"atlas",journal:"journal",encounters:"encounters"};
const names=new Set(Object.values(categories));
const ID=/^[a-z0-9][a-z0-9-]{1,63}$/;
const slug=s=>String(s||"entry").toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,"").slice(0,60)||"entry";
function assert(ok,msg){if(!ok)throw new Error("Contract v1: "+msg)}
export function validateExchange(doc,expectedCategory){
 assert(doc&&typeof doc==="object"&&!Array.isArray(doc),"expected an object");
 assert(doc.contract===CONTRACT,"contract must be "+CONTRACT);
 assert(typeof doc.schemaVersion==="string"&&/^1\./.test(doc.schemaVersion),"unsupported schemaVersion");
 assert(ID.test(doc.packId||""),"invalid packId");
 assert(names.has(doc.category),"unknown category");
 if(expectedCategory)assert(doc.category===categories[expectedCategory],"category mismatch for "+expectedCategory);
 assert(Array.isArray(doc.entries),"entries must be an array");
 const used=new Set();
 for(const [index,e] of doc.entries.entries()){
  assert(e&&typeof e==="object"&&!Array.isArray(e),"entry "+index+" is not an object");
  assert(ID.test(e.id||""),"invalid entry id at "+index);
  assert(typeof e.name==="string"&&e.name.trim().length>0,"missing name at "+index);
  assert(typeof e.type==="string"&&e.type.trim().length>0,"missing type at "+index);
  assert(!used.has(e.id),"duplicate entry ID "+e.id);used.add(e.id);
 }
 return doc;
}
export function exportExchange(app,records,packId="shattered-crucible-user"){
 assert(categories[app],"unknown extension "+app);
 assert(ID.test(packId),"invalid pack ID");
 const used=new Set();
 const entries=records.map((r,i)=>{
  const name=String(r.name||r.title||"Untitled "+(i+1)).trim();
  let raw=String(r.id||slug(name)).toLowerCase(),candidate=ID.test(raw)?raw:slug(name);
  if(candidate.length<2)candidate="id-"+candidate;
  let id=candidate,count=2;while(used.has(id)){id=(candidate.slice(0,55)+"-"+count++).slice(0,64)}used.add(id);
  return {...r,id,name,type:String(r.type||categories[app].replace(/s$/,"")||"entry")};
 });
 return validateExchange({contract:CONTRACT,schemaVersion:VERSION,packId,category:categories[app],entries},app);
}
export function importExchange(app,doc){
 validateExchange(doc,app);
 return doc.entries.map(e=>({...e,title:app==="journal"?(e.title||e.name):e.title}));
}
export function exportText(app,records){return JSON.stringify(exportExchange(app,records),null,2)}
