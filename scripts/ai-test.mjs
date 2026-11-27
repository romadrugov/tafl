import {readFileSync} from 'node:fs';import vm from 'node:vm';import assert from 'node:assert/strict';
const html=readFileSync('www/index.html','utf8'),src=html.match(/<script>([\s\S]*?)<\/script>/)[1];
const ctx=vm.createContext({console});vm.runInContext(src.slice(0,src.indexOf('const $='))+'\nthis.Engine=Engine;',ctx);
const modes=['brandubh','tablut','hnefatafl','copenhagen'];const seed=(n)=>()=>{n=(Math.imul(n,1664525)+1013904223)>>>0;return n/4294967296};
function state(e,b,turn){return {...e.start(),b,turn,keys:[b.join('')+turn]}}
function check(e,g,level,rand=seed(9)){const r=e.choose(g,level,{random:rand});assert(r&&e.moves(g.b,g.turn).some(m=>m.join()===r.m.join()));return r}
function replyWins(e,g,m){const a=e.record(g,m);return a.win===3?false:a.win?a.win!==g.turn:e.moves(a.b,a.turn).some(x=>e.record(a,x).win===a.turn)}
for(const mode of modes){
 const e=ctx.Engine(mode),n=e.n,idx=(x,y)=>y*n+x;
 // A king one move away from safety must be noticed by every level, by either side.
 let b=Array(e.L).fill(0);b[idx(0,1)]=3;b[idx(1,1)]=2;b[idx(1,3)]=1;b[idx(n-2,n-2)]=1;
 if(mode==='tablut'){b=Array(e.L).fill(0);b[idx(1,1)]=3;b[idx(2,1)]=2;b[idx(3,0)]=1;b[idx(n-2,n-2)]=1}
 let g=state(e,b,2);
 for(let l=0;l<3;l++){let r=check(e,g,l);assert.equal(e.record(g,r.m).win,2,mode+' immediate white win '+l)}
 // Block a direct escape on the next turn when a safe defense exists.
 b=Array(e.L).fill(0);b[idx(0,2)]=3;b[idx(0,n-1)]=0;b[idx(2,1)]=1;b[idx(2,n-2)]=1;b[idx(1,2)]=2;b[idx(0,0)]=0;
 // Single open route to the upper edge/corner; lower route blocked.
 b[idx(0,3)]=2;b[idx(n-2,1)]=1;b[idx(1,0)]=1;
 if(mode==='tablut'){b=Array(e.L).fill(0);b[idx(2,2)]=3;b[idx(1,2)]=2;b[idx(3,2)]=2;b[idx(2,3)]=2;b[idx(3,1)]=1;b[idx(0,0)]=0;b[idx(0,1)]=1;b[idx(n-2,1)]=1}
 g=state(e,b,1);
 assert(!e.moves(b,1).some(m=>e.record(g,m).win===1),mode+' fixture has direct black win');
 const safe=e.moves(b,1).filter(m=>!replyWins(e,g,m));assert(safe.length,mode+' fixture has no defense');assert(e.moves(b,1).some(m=>replyWins(e,g,m)),mode+' fixture has no trap');
 for(let l=1;l<3;l++){let r=check(e,g,l);assert(!replyWins(e,g,r.m),mode+' misses forced defense '+l)}
 let aware=check(e,g,0,()=>0);assert(!replyWins(e,g,aware.m),mode+' attentive novice misses defense');
 let misses=0,notices=0;const rng=seed(420);for(let i=0;i<80;i++){let r=check(e,g,0,rng);if(replyWins(e,g,r.m))misses++;else notices++}
 assert(misses>0&&notices>0,mode+' novice must sometimes miss and sometimes notice');console.log(mode+' easy fixture: '+misses+' misses / '+notices+' defenses (80 seeded choices)');
 const opening=e.start();const next=e.record(opening,e.moves(opening.b,1)[0]);
 for(const [side,g] of [[1,opening],[2,next]])for(let l=0;l<3;l++){let t=Date.now(),r=check(e,g,l);assert(r.depth>=1);if(l>0)assert(r.depth>=2);console.log(JSON.stringify({mode,side,level:l,depth:r.depth,work:r.nodes,ms:Date.now()-t,move:r.m,safe:r.safeMoves,legal:r.legalMoves}))}
}
console.log('AI tactical safety and all mode/side/level checks passed');
