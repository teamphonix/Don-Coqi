import assert from 'node:assert/strict';
import worker from '../worker/index.js';
const req=body=>new Request('https://study.example/api/jari',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
const original=globalThis.fetch;
let calls=[];
try{
 globalThis.fetch=async(url,options)=>{
  const payload=JSON.parse(options.body);calls.push(payload);
  assert.match(payload.system_instruction.parts[0].text,/general questions beyond the menu/);
  assert.match(payload.system_instruction.parts[0].text,/Web sources cannot establish this restaurant/);
  assert.equal(payload.generationConfig.maxOutputTokens,8192);
  return new Response(JSON.stringify({candidates:[{content:{parts:[{thought:true,text:'private reasoning'},{text:'Ropa vieja has a cultural history.'}]},finishReason:'STOP',groundingMetadata:{groundingChunks:[{web:{uri:'https://example.org/history',title:'History'}},{web:{uri:'javascript:alert(1)',title:'Unsafe'}}],groundingSupports:[{segment:{endIndex:32},groundingChunkIndices:[0]}],searchEntryPoint:{renderedContent:'<p>Search suggestions</p>'}}}]}));
 };
 const grounded=await worker.fetch(req({message:'Research the origin of ropa vieja',research:true}),{GEMINI_API_KEY:'test'}).then(r=>r.json());
 assert.equal(calls[0].tools[0].google_search.constructor,Object);
 assert.equal(grounded.researchStatus,'grounded');assert.equal(grounded.sources.length,1);assert.match(grounded.reply,/\[1\]/);assert(!grounded.reply.includes('private reasoning'));
 calls=[];
 await worker.fetch(req({message:'What goes in Roast Pork?',research:false}),{GEMINI_API_KEY:'test'});
 assert(!calls[0].tools);
 let n=0;globalThis.fetch=async(url,options)=>{calls.push(JSON.parse(options.body));n++;return new Response(JSON.stringify({candidates:[{content:{parts:[{text:n===1?'First part.':'Completed answer.'}]},finishReason:n===1?'MAX_TOKENS':'STOP'}]}))};
 const continued=await worker.fetch(req({message:'Explain hospitality',research:false}),{GEMINI_API_KEY:'test'}).then(r=>r.json());
 assert.equal(n,2);assert.equal(continued.truncated,false);assert.match(continued.reply,/First part.[\s\S]*Completed answer/);
 globalThis.fetch=async()=>new Response(JSON.stringify({candidates:[{content:{parts:[{text:'Partial.'}]},finishReason:'MAX_TOKENS'}]}));
 const partial=await worker.fetch(req({message:'Long answer',research:false}),{GEMINI_API_KEY:'test'}).then(r=>r.json());assert.equal(partial.truncated,true);
 n=0;globalThis.fetch=async(url,options)=>{const p=JSON.parse(options.body);n++;if(n===1){assert(p.tools);return new Response('{}',{status:400})}assert(!p.tools);assert.match(p.system_instruction.parts[0].text,/research is unavailable/);return new Response(JSON.stringify({candidates:[{content:{parts:[{text:'General knowledge answer.'}]},finishReason:'STOP'}]}))};
 const fallback=await worker.fetch(req({message:'Research a dish origin'}),{GEMINI_API_KEY:'test'}).then(r=>r.json());assert.equal(fallback.researchStatus,'unavailable');assert.equal(n,2);
 console.log('PASS: JARI research sources, unsafe URL rejection, menu grounding, hidden reasoning, automatic continuation, cutoff detection and research fallback.');
}finally{globalThis.fetch=original}
