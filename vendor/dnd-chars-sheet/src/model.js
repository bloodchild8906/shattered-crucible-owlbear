export const ABILITIES=['str','dex','con','int','wis','cha'];
export const SKILLS={Acrobatics:'dex','Animal Handling':'wis',Arcana:'int',Athletics:'str',Deception:'cha',History:'int',Insight:'wis',Intimidation:'cha',Investigation:'int',Medicine:'wis',Nature:'int',Perception:'wis',Performance:'cha',Persuasion:'cha',Religion:'int','Sleight of Hand':'dex',Stealth:'dex',Survival:'wis'};
export const uid=()=>globalThis.crypto.randomUUID();
export const clamp=(n,min,max,fallback=min)=>Number.isFinite(Number(n))?Math.max(min,Math.min(max,Number(n))):fallback;
export const mod=n=>Math.floor((n-10)/2);
export const sign=n=>(n>=0?'+':'')+n;
const text=(s,n=12000)=>typeof s==='string'?s.slice(0,n):'';
const num=(s,a=-1000,b=1000,f=0)=>clamp(s,a,b,f);
export function blank(){return {schema:1,classes:[],id:uid(),name:'New Character',entityType:'PC',portrait:'',tokenFrame:'gold',cr:'',owner:'',creatureType:'',size:'Medium',player:'',species:'',className:'',subclass:'',background:'',alignment:'',rules:'2024',level:1,abilities:Object.fromEntries(ABILITIES.map(a=>[a,10])),saves:[],skills:{},skillBonuses:{},acBase:10,acDex:true,acDexCap:10,shield:0,acBonus:0,speed:30,initiativeBonus:0,maxHp:10,hp:10,tempHp:0,hitDie:8,hitDiceSpent:0,spellAbility:'wis',spellAttackBonus:0,spellDcBonus:0,saveBonus:0,slots:Array(9).fill(0),spentSlots:Array(9).fill(0),attacks:[],spells:[],items:[],features:[],resources:[],forms:[],activeForm:null,conditions:[],concentration:'',inspiration:false,deathSuccess:0,deathFail:0,notes:'',backstory:'',personality:'',contacts:'',proficiencies:'',inventoryNotes:'',gold:0,silver:0,copper:0};}
export function entry(kind){const base={id:uid(),name:'New '+kind.replace(/s$/,''),description:'',origin:''};return {...base,...({attacks:{spellAttack:false,ability:'str',proficient:true,bonus:0,damage:'1d6+@mod',damageType:'',range:'',heal:false},spells:{level:1,prepared:true,always:false,castingTime:'1 action',range:'',duration:'',components:'',concentration:false,ritual:false,roll:'',rollKind:'none',save:'',damageType:''},items:{quantity:1,weight:0,equipped:false,attuned:false,requiresAttunement:false,ac:0,saves:0,spellAttack:0,spellDc:0,roll:''},features:{roll:''},resources:{max:1,used:0,reset:'long',shortAmount:0},forms:{str:10,dex:10,con:10,ac:10,speed:30,tempHp:0,resource:'Wild Shape',attacks:[]}}[kind]||{})};}
export function validate(raw){
 if(!raw||typeof raw!=='object'||Array.isArray(raw)||raw.schema!==1)throw Error('Use a dnd-chars-sheet JSON export (schema 1).');
 const c=blank();c.id=text(raw.id,100)||uid();
 for(const k of ['name','player','species','className','subclass','background','alignment','rules','concentration','portrait','tokenFrame','cr','owner','creatureType','size'])c[k]=text(raw[k],k==='portrait'?180000:300);
 c.name=c.name||'Unnamed Character';c.entityType=['PC','NPC','Familiar','Monster'].includes(raw.entityType)?raw.entityType:'PC';c.tokenFrame=['gold','silver','arcane','nature','infernal','none'].includes(raw.tokenFrame)?raw.tokenFrame:'gold';if(c.portrait&&(!/^(https:\/\/|data:image\/(?:png|jpeg|webp);base64,)/i.test(c.portrait)||c.portrait.length>180000))c.portrait='';
 for(const k of ['notes','backstory','personality','contacts','proficiencies','inventoryNotes'])c[k]=text(raw[k]);
 for(const a of ABILITIES)c.abilities[a]=num(raw.abilities?.[a],1,30,10);
 c.level=Math.floor(num(raw.level,1,20,1));c.maxHp=Math.floor(num(raw.maxHp,1,9999,10));c.hp=num(raw.hp,0,c.maxHp,c.maxHp);c.tempHp=num(raw.tempHp,0,9999);
 for(const k of ['acBase','shield','acBonus','initiativeBonus','spellAttackBonus','spellDcBonus','saveBonus'])c[k]=num(raw[k],-100,100,k==='acBase'?10:0);
 c.acDex=raw.acDex===true;c.acDexCap=num(raw.acDexCap,0,10,10);c.speed=num(raw.speed,0,1000,30);c.hitDie=[4,6,8,10,12,20].includes(raw.hitDie)?raw.hitDie:8;c.hitDiceSpent=num(raw.hitDiceSpent,0,c.level);
 c.spellAbility=ABILITIES.includes(raw.spellAbility)?raw.spellAbility:'wis';c.saves=ABILITIES.filter(a=>raw.saves?.includes(a));
 for(const k of Object.keys(SKILLS)){c.skills[k]=[0,0.5,1,2].includes(raw.skills?.[k])?raw.skills[k]:0;c.skillBonuses[k]=num(raw.skillBonuses?.[k],-100,100);}
 for(const k of ['slots','spentSlots'])c[k]=Array.from({length:9},(_,i)=>Math.floor(num(raw[k]?.[i],0,20)));
 c.spentSlots=c.spentSlots.map((v,i)=>Math.min(v,c.slots[i]));
 for(const k of ['attacks','spells','items','features','resources','forms']){
 c[k]=(Array.isArray(raw[k])?raw[k]:[]).slice(0,150).map(r=>{
 r=r&&typeof r==='object'?r:{};const e=entry(k);
 for(const field of Object.keys(e)){
 if(field==='id')e.id=uid();
 else if(typeof e[field]==='boolean')e[field]=r[field]===true;
 else if(typeof e[field]==='number')e[field]=num(r[field]);
 else if(typeof e[field]==='string')e[field]=text(r[field],field==='description'?12000:300);
 }
 if(k==='attacks'){e.ability=ABILITIES.includes(e.ability)?e.ability:'str';if(!e.damage)e.damage='1d6';}
 if(k==='spells'){e.level=Math.floor(num(e.level,0,9));if(!['none','attack','damage','heal'].includes(e.rollKind))e.rollKind='none';}
 if(k==='resources'){e.max=Math.floor(num(e.max,0,999));e.used=Math.floor(num(e.used,0,e.max));e.shortAmount=Math.floor(num(e.shortAmount,0,999));if(!['none','short','long'].includes(e.reset))e.reset='long';}
 if(k==='items'){e.quantity=num(e.quantity,0,9999);e.weight=num(e.weight,0,9999);}
 if(k==='forms'){for(const a of ['str','dex','con'])e[a]=num(e[a],1,30,10);e.ac=num(e.ac,0,100,10);e.speed=num(e.speed,0,1000,30);e.tempHp=num(e.tempHp,0,9999);e.attacks=(Array.isArray(r.attacks)?r.attacks:[]).slice(0,10).map(a=>({name:text(a?.name,100),bonus:num(a?.bonus,-100,100),damage:text(a?.damage,100)}));}
 return e;
 });}
 // New entry IDs deliberately sever external identity; active form references use an index.
 c.activeForm=Number.isInteger(raw.activeForm)&&raw.activeForm>=0&&raw.activeForm<c.forms.length?raw.activeForm:null;
 c.conditions=(Array.isArray(raw.conditions)?raw.conditions:[]).slice(0,30).map(s=>text(s,80));
 c.inspiration=raw.inspiration===true;c.deathSuccess=Math.floor(num(raw.deathSuccess,0,3));c.deathFail=Math.floor(num(raw.deathFail,0,3));
 for(const k of ['gold','silver','copper'])c[k]=num(raw[k],0,9999999);

 if(Array.isArray(raw.classes)&&raw.classes.length){
 let remaining=20;
 c.classes=[];
 for(const r of raw.classes.slice(0,20)){
 if(!remaining||!r||typeof r.name!=='string'||!r.name.trim())continue;
 const level=Math.floor(num(r.level,1,remaining,1));remaining-=level;
 c.classes.push({name:text(r.name,300),source:text(r.source,100)||'Custom',subclass:text(r.subclass,300),level,hitDie:[4,6,8,10,12,20].includes(Number(r.hitDie))?Number(r.hitDie):8,spent:Math.floor(num(r.spent,0,level))});
 }
 if(c.classes.length){c.level=c.classes.reduce((n,r)=>n+r.level,0);c.className=c.classes.map(r=>r.name+' '+r.level).join(' / ');c.subclass=c.classes.map(r=>r.subclass).filter(Boolean).join(' / ');c.hitDiceSpent=c.classes.reduce((n,r)=>n+r.spent,0);}
 }
 return c;
}
export function stats(c){const f=c.activeForm===null?null:c.forms[c.activeForm];const abilities={...c.abilities,...(f?{str:f.str,dex:f.dex,con:f.con}:{})};const mods=Object.fromEntries(ABILITIES.map(a=>[a,mod(abilities[a])]));const pb=2+Math.floor((c.level-1)/4);const items=c.items.filter(i=>i.equipped&&(!i.requiresAttunement||i.attuned));const sum=k=>items.reduce((n,i)=>n+Number(i[k]||0),0);const saveBonus=c.saveBonus+sum('saves');return {abilities,mods,pb,ac:(f?f.ac:c.acBase+(c.acDex?Math.min(mods.dex,c.acDexCap):0)+c.shield+c.acBonus)+sum('ac'),initiative:mods.dex+c.initiativeBonus,spellAttack:mods[c.spellAbility]+pb+c.spellAttackBonus+sum('spellAttack'),spellDc:8+mods[c.spellAbility]+pb+c.spellDcBonus+sum('spellDc'),saves:Object.fromEntries(ABILITIES.map(a=>[a,mods[a]+(c.saves.includes(a)?pb:0)+saveBonus])),skills:Object.fromEntries(Object.entries(SKILLS).map(([k,a])=>[k,mods[a]+Math.floor(pb*(c.skills[k]||0))+(c.skillBonuses[k]||0)])),speed:f?f.speed:c.speed};}
export function changeHp(c,amount){if(amount<0){const absorb=Math.min(c.tempHp,-amount);c.tempHp-=absorb;amount+=absorb;}c.hp=clamp(c.hp+amount,0,c.maxHp);if(c.hp>0){c.deathSuccess=0;c.deathFail=0;}}
export function rest(c,kind){if(kind==='long'){c.hp=c.maxHp;c.tempHp=0;c.spentSlots.fill(0);c.activeForm=null;c.concentration='';c.deathFail=0;c.deathSuccess=0;c.hitDiceSpent=c.rules==='2014'?Math.max(0,c.hitDiceSpent-Math.max(1,Math.floor(c.level/2))):0;}

 if(kind==='long'&&c.classes?.length){let recover=c.rules==='2014'?Math.max(1,Math.floor(c.level/2)):c.level;for(const row of c.classes){const count=Math.min(row.spent,recover);row.spent-=count;recover-=count;}c.hitDiceSpent=c.classes.reduce((n,r)=>n+r.spent,0);}
 for(const r of c.resources){if(kind==='long'&&r.reset!=='none')r.used=0;else if(kind==='short'&&r.reset==='short')r.used=0;else if(kind==='short'&&r.shortAmount)r.used=Math.max(0,r.used-r.shortAmount);}}
export function resolveExpression(expression,c,ability='str'){const s=stats(c);return expression.replace(/@mod\b/g,String(s.mods[ability])).replace(/@spell\b/g,String(s.mods[c.spellAbility])).replace(/@prof\b/g,String(s.pb)).replace(/@level\b/g,String(c.level)).replace(/\+\-/g,'-').replace(/--/g,'+');}
export function parseDice(expression){const s=String(expression).replace(/\s/g,'').toLowerCase();if(!s||s.length>180)throw Error('Enter dice such as 2d6+3.');const chunks=s.match(/[+-]?(?:\d*d\d+|\d+)/g);if(!chunks||chunks.join('')!==s)throw Error('Use dice and numbers, for example 1d20+5.');let count=0;return chunks.map(t=>{const m=t.match(/^([+-]?)(\d*)d(\d+)$/);if(m){const n=Number(m[2]||1),sides=Number(m[3]);count+=n;if(n<1||count>100||sides<2||sides>1000)throw Error('Use at most 100 dice with 2–1000 sides.');return {n,sides,sign:m[1]==='-'?-1:1};}const value=Number(t);if(!Number.isFinite(value)||Math.abs(value)>100000)throw Error('Modifier too large.');return {value};});}
export function randomDie(sides){const bound=Math.floor(4294967296/sides)*sides;let n;do{n=crypto.getRandomValues(new Uint32Array(1))[0];}while(n>=bound);return n%sides+1;}
export function rollDice(expression,{mode='normal',crit=false,random=randomDie}={}){const terms=parseDice(expression),groups=[];let total=0;const advantage=terms.filter(t=>t.sides).length===1&&terms.some(t=>t.sides===20&&t.n===1)&&mode!=='normal';let natural=null;
 for(const t of terms){if('value'in t){total+=t.value;groups.push({text:sign(t.value)});continue;}const adv=advantage&&t.sides===20;const results=Array.from({length:adv?2:t.n*(crit?2:1)},()=>random(t.sides));const value=adv?(mode==='advantage'?Math.max(...results):Math.min(...results)):results.reduce((a,b)=>a+b,0);total+=t.sign*value;if(t.sides===20&&t.n===1&&!crit)natural=value;groups.push({results,sides:t.sides,sign:t.sign,kept:adv?value:null,text:`${t.sign<0?'-':''}[${results.join(', ')}]${adv?' → '+value:''}`});}
 return {expression,total,groups,natural,mode:advantage?mode:'normal',crit};}
