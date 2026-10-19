/* Smoke tests for InNav hi-fi building and vertical navigation model. */
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=require('node:path').join(__dirname,'..');
let base=fs.readFileSync(root+'/app.js','utf8').replace(/init\(\);\s*$/,'');
let extra=fs.readFileSync(root+'/experience.js','utf8').replace("seedIfNeeded();view='splash';render();",'').replace(/\}\)\(\);\s*$/,`globalThis.exp={makeE6,ensureData,fixtureTypes};})();`);
const dummy={addEventListener:()=>{},querySelector:()=>null,querySelectorAll:()=>[]};
const ctx={console,Math,Date,JSON,document:dummy,window:dummy,localStorage:{getItem:()=>null,setItem:()=>{}},setTimeout,Blob,URL,confirm:()=>true};
vm.createContext(ctx);vm.runInContext(base+'\nglobalThis.core={shortestPath,validate,validStructure};',ctx);vm.runInContext(extra,ctx);
const p=ctx.exp.makeE6();assert(ctx.core.validStructure(p));assert.equal(p.floors.length,11);assert.equal(p.rooms.length,33);assert(p.fixtures.some(o=>o.type==='door'));assert(p.fixtures.some(o=>o.type==='escalator'));
const first=p.nodes.find(n=>n.floorId===p.floors[0].id&&n.type==='lift');const last=p.nodes.find(n=>n.floorId===p.floors[10].id&&n.type==='lift');assert(ctx.core.shortestPath(p,first.id,last.id)?.ids.length>=11);
assert.equal(ctx.core.validate(p).filter(i=>i.level==='error').length,0);assert.equal(JSON.parse(JSON.stringify(p)).fixtures.length,p.fixtures.length);
console.log('PASS: 11-level Block E6, persistent fixtures, cross-floor routing, validation, JSON roundtrip');