import {readFileSync} from 'node:fs';import vm from 'node:vm';import assert from 'node:assert/strict';
const html=readFileSync('www/index.html','utf8');const script=html.match(/<script>([\s\S]*?)<\/script>/)[1];new vm.Script(script);
const end=script.indexOf('const $=');assert(end>0);
const ctx=vm.createContext({console});vm.runInContext(script.slice(0,end)+'\nthis.Engine=Engine;',ctx);
for(const [mode,n,black,white] of [['brandubh',7,8,4],['tablut',9,16,8],['hnefatafl',11,24,12],['copenhagen',11,24,12]]){const e=ctx.Engine(mode);let g=e.start();assert.equal(e.n,n);assert.equal(g.b.filter(x=>x===1).length,black);assert.equal(g.b.filter(x=>x===2).length,white);assert.equal(g.b.filter(x=>x===3).length,1);for(let i=0;i<6&&!g.win;i++){const moves=e.moves(g.b,g.turn);assert(moves.length);g=e.record(g,moves[0]);}console.log(mode,'OK');}
