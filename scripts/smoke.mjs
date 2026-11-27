import {readFileSync} from 'node:fs';import vm from 'node:vm';import assert from 'node:assert/strict';
const html=readFileSync('www/index.html','utf8');const script=html.match(/<script>([\s\S]*?)<\/script>/)[1];new vm.Script(script);
const end=script.indexOf('const $=');assert(end>0);
const ctx=vm.createContext({console});vm.runInContext(script.slice(0,end)+'\nthis.Engine=Engine;',ctx);
for(const [mode,n,black,white] of [['brandubh',7,8,4],['tablut',9,16,8],['hnefatafl',11,24,12],['copenhagen',11,24,12]]){const e=ctx.Engine(mode);let g=e.start();assert.equal(e.n,n);assert.equal(g.b.filter(x=>x===1).length,black);assert.equal(g.b.filter(x=>x===2).length,white);assert.equal(g.b.filter(x=>x===3).length,1);for(let i=0;i<6&&!g.win;i++){const moves=e.moves(g.b,g.turn);assert(moves.length);g=e.record(g,moves[0]);}console.log(mode,'OK');}

// Copenhagen exit-fort proof: valid stable U-wall, rotations, holes, internal
// attackers, trapped king, ordinary captures and shieldwall-vulnerable posts.
{
 const e=ctx.Engine('copenhagen'),n=e.n,at=(x,y)=>y*n+x;
 const make=(rot=0)=>{let b=Array(e.L).fill(0);const set=(x,y,v)=>{for(let i=0;i<rot;i++)[x,y]=[n-1-y,x];b[at(x,y)]=v};for(const [x,y] of [[3,0],[3,1],[4,1],[5,1],[6,1],[6,0]])set(x,y,2);set(4,0,3);set(8,8,1);return b};
 for(let r=0;r<4;r++)assert(e.exitFort(make(r)),'rotated secure fort '+r);
 const b=make();assert.equal(e.apply(b,[at(8,8),at(8,7)]).win,2);assert.equal(e.apply(b,[at(4,0),at(5,0)]).why,'Выходная крепость');
 const gap=b.slice();gap[at(5,1)]=0;assert(!e.exitFort(gap),'open wall');
 const invaded=b.slice();invaded[at(5,0)]=1;assert(!e.exitFort(invaded),'attacker in interior');
 const trapped=b.slice();trapped[at(5,0)]=2;assert(!e.exitFort(trapped),'king cannot move');
 const loose=b.slice();loose[at(3,1)]=0;loose[at(2,1)]=2;assert(!e.exitFort(loose),'vulnerable edge support');
 assert(!ctx.Engine('hnefatafl').exitFort(b),'Copenhagen only');
 // Both published diagrams from https://aagenielsen.dk/copenhagen_rules.php
 // (edgefort.png and taget10.png), represented as their bottom-edge coordinates.
 const diagrams=[
  {king:[4,10],white:[[3,10],[6,10],[4,9],[5,9]]},
  {king:[5,10],white:[[4,10],[6,10],[4,9],[6,9],[4,8],[5,8]]}
 ];
 for(const d of diagrams)for(let rot=0;rot<4;rot++){
  const a=Array(e.L).fill(0),set=(x,y,v)=>{for(let i=0;i<rot;i++)[x,y]=[n-1-y,x];a[at(x,y)]=v};
  set(...d.king,3);for(const xy of d.white)set(...xy,2);set(8,3,1);
  assert(e.exitFort(a),'published exit fort rotation '+rot);
 }
 console.log('Copenhagen exit-fort invariant, published examples, rotations and negative cases OK');
}
