import {exportExchange,importExchange,validateExchange} from "./content-contract.js";
const apps=["compendium","homebrew","characters","shops","atlas","journal","encounters"];
for(const app of apps){const doc=exportExchange(app,[{name:"Test fixture",notes:"roundtrip"}]);if(importExchange(app,doc).length!==1)throw Error(app+" failed");try{importExchange(apps[(apps.indexOf(app)+1)%apps.length],doc);throw Error("Mismatch was accepted")}catch(e){if(e.message==="Mismatch was accepted")throw e}console.log(app,doc.category,"OK")}
try{validateExchange({contract:"x",schemaVersion:"1.0.0",packId:"sample",category:"items",entries:[]});throw Error("Invalid contract accepted")}catch(e){if(e.message==="Invalid contract accepted")throw e}console.log("negative contract case OK");
