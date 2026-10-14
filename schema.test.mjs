import {validateExchange} from "./content-contract.js";
const good={contract:"sc.homebrew.entries",schemaVersion:"1.0.0",packId:"test-pack",category:"items",entries:[{id:"test-item",name:"Test Item",type:"item"}]};
validateExchange(good);
for(const [label,bad] of [["invalid contract",{...good,contract:"invalid"}],["invalid schema version",{...good,schemaVersion:"2.0.0"}],["invalid currency",{...good,entries:[{...good.entries[0],price:{amount:5,currency:"beans"}}]}],["negative price",{...good,entries:[{...good.entries[0],price:{amount:-1,currency:"gp"}}]}],["blank name",{...good,entries:[{...good.entries[0],name:"   "}]}],["unknown field",{...good,strange:true}]]){let rejected=false;try{validateExchange(bad)}catch(e){rejected=true;console.log("PASS rejected",label,e.message.slice(0,100))}if(!rejected)throw Error("Accepted invalid: "+label)}
console.log("Schema contract tests PASS");
