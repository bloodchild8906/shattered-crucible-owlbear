import {contentSchema} from "./contract-schema.js";
function check(value,schema,path="$",issues=[]){
 if(schema.const!==undefined&&value!==schema.const)issues.push(path+" must equal "+JSON.stringify(schema.const));
 if(schema.type){const type=Array.isArray(value)?"array":value===null?"null":typeof value;if(type!==schema.type)issues.push(path+" must be "+schema.type)}
 if(schema.enum&&!schema.enum.includes(value))issues.push(path+" must be one of "+schema.enum.join(", "));
 if(typeof value==="string"){
   if(schema.minLength!==undefined&&value.length<schema.minLength)issues.push(path+" is too short");
   if(schema.pattern&&!new RegExp(schema.pattern).test(value))issues.push(path+" does not match "+schema.pattern);
 }
 if(typeof value==="number"&&schema.minimum!==undefined&&value<schema.minimum)issues.push(path+" must be >= "+schema.minimum);
 if(Array.isArray(value)){
   if(schema.minItems!==undefined&&value.length<schema.minItems)issues.push(path+" has too few items");
   if(schema.items)for(let i=0;i<value.length;i++)check(value[i],schema.items,path+"["+i+"]",issues);
 }
 if(value&&typeof value==="object"&&!Array.isArray(value)){
   for(const field of schema.required||[])if(!(field in value))issues.push(path+" missing "+field);
   for(const [key,v] of Object.entries(value)){
     if(schema.properties?.[key])check(v,schema.properties[key],path+"."+key,issues);
     else if(schema.additionalProperties===false)issues.push(path+" unexpected property "+key);
     else if(schema.additionalProperties&&typeof schema.additionalProperties==="object")check(v,schema.additionalProperties,path+"."+key,issues);
   }
 }
 return issues;
}
export function schemaErrors(document){return check(document,contentSchema)}
export function assertSchema(document){const errors=schemaErrors(document);if(errors.length)throw new Error("Contract JSON Schema validation failed: "+errors.slice(0,12).join("; "));return document}
