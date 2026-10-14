import {interpret5etools,toHomebrewExchange} from "./fiveetools-interpreter.js";import {importExchange} from "./content-contract.js";
const source={_meta:{sources:[{json:"HOME",full:"Example Homebrew"}]},spell:[{name:"Flame Arc",source:"HOME",level:2,school:"V",entries:["A short burst of fire."]},{name:"Copy Spell",_copy:{name:"Other"},source:"HOME"}],monster:[{name:"Mud Beast",source:"HOME",cr:"2",hp:{average:30}}],notSupported:[{name:"Other"}]};
const x=interpret5etools(source);
if(x.report.converted!==2||x.report.skipped.length!==2)throw Error(JSON.stringify(x.report));
const doc=toHomebrewExchange(x);const r=importExchange("homebrew",doc);if(r.length!==2||!r.find(e=>e.name==="Flame Arc")?.mechanics.level)throw Error("Conversion failed");
console.log("5e.tools conversion PASS; skipped reports:",x.report.skipped.map(e=>e.reason).join(", "));
