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
 const loose=Array(e.L).fill(0);for(const [x,y] of [[3,0],[6,0],[3,1],[5,1],[4,2]])loose[at(x,y)]=2;loose[at(4,0)]=3;loose[at(8,8)]=1;assert(!e.exitFort(loose),'sealed but vulnerable wall: D9/F9 can capture E9');
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

for(const [mode,n] of [['historical',11],['ardri',7],['tawlbwrdd',11],['magpie',7],['berserk',11]]) {
 const e=ctx.Engine(mode),g=e.start();
 assert.equal(e.n,n);assert.equal(g.b.filter(x=>e.S[x]===1).length,n===7?8:24);assert.equal(g.b.filter(x=>e.S[x]===2).length,n===7?5:13);
 assert.equal(e.goal(1),['historical','ardri','tawlbwrdd'].includes(mode));
 assert.equal(e.restricted(e.T),!['ardri','tawlbwrdd'].includes(mode));
 let q=g;for(let i=0;i<6&&!q.win;i++){const m=e.moves(q.b,q.turn)[0];q=e.record(q,m)}
 console.log(mode,'opening, moves and replay OK');
}
{
 const e=ctx.Engine('magpie'),b=Array(e.L).fill(0);b[24]=3;assert.equal(e.dest(b,24).length,4);b.fill(0);b[3]=3;b[2]=b[4]=1;b[17]=1;assert.equal(e.apply(b,[17,10]).win,1);
}
{
 const e=ctx.Engine('berserk'),idx=(x,y)=>y*11+x;
 const b=Array(e.L).fill(0);b[idx(1,2)]=5;b[idx(2,2)]=1;b[idx(4,2)]=1;b[idx(5,5)]=3;b[idx(9,9)]=1;
 const g={...e.start(),b,turn:2,keys:[b.join('')+'2']},m=[idx(1,2),idx(3,2),idx(5,2)];
 assert(e.moves(b,2).some(x=>x.join()===m.join()),'chain generated');const q=e.record(g,m);assert.equal(q.cap.length,2);assert.equal(q.turn,1);assert.equal(q.log.length,1);assert.equal(q.b[idx(5,2)],5);
 assert.throws(()=>e.record(g,[idx(1,2),idx(3,2),idx(3,3)]),'no quiet continuation');
 assert.equal(e.initial().filter(p=>p===4).length,4);assert.equal(e.initial().filter(p=>p===5).length,1);
 let c=Array(e.L).fill(0);c[idx(3,3)]=3;c[idx(2,3)]=4;c[idx(4,6)]=4;assert.equal(e.apply(c,[idx(4,6),idx(4,3)]).win,1);
 console.log('Berserk jumps, optional capture chains, commander capture and atomic history OK');
}

{
 const e=ctx.Engine('tawlbwrdd'),b=e.initial();assert.equal(b[4*11+5],2);assert.equal(b[2*11+5],2);assert.equal(b[1*11+5],1);assert.equal(b[1*11+4],1);assert.equal(b[1*11+6],1);assert.equal(b[4*11+4],0);
}

const lessonSrc=readFileSync('www/tutorial-data.js','utf8');vm.runInContext(lessonSrc+'\nthis.TutorialLessons=TutorialLessons;',ctx);const lessons=ctx.TutorialLessons(ctx.Engine);assert.equal(lessons.length,25);console.log('All tutorial positions and expected engine outcomes validated');

vm.runInContext("let lang='en';const localStorage={getItem:()=>null,setItem:()=>{}};",ctx);vm.runInContext(readFileSync('www/tutorial.js','utf8'),ctx);vm.runInContext(`
renderTutorial=()=>{};
for(const locale of ['en','es','ru']){
 lang=locale;
 for(const [i,l] of tutorialLessons().entries()){
  loadTutorialLesson(i);
  for(const x of l.path)tutorialClick(x);
  if(!tutorialSession.done||tutorialSession.path.join()!==l.path.join())throw Error(locale+' '+l.id+' '+tutorialSession.message);
 }
}
`,ctx);console.log('All 75 localized tutorial click sequences passed');

const tutorialRenderCtx=vm.createContext({console});
vm.runInContext(script.slice(0,end)+'\n'+lessonSrc+'\n'+"\nfunction node(){return {children:[],style:{},dataset:{},className:'',classList:{add(){},toggle(){}},hidden:false,disabled:false,textContent:'',innerHTML:'',setAttribute(){},append(x){this.children.push(x)},replaceChildren(){this.children=[]}}}\nconst nodes=new Map(),$=id=>{if(!nodes.has(id))nodes.set(id,node());return nodes.get(id)},document={createElement:node};\nconst variants=Object.fromEntries(['brandubh','tablut','hnefatafl','ardri','magpie','berserk','copenhagen'].map(k=>[k,{title:k}]));\nconst squareIcon=()=>'',pieceIcon=()=>'',pieceClass=()=>'',localStorage={getItem:()=>null,setItem:()=>{}};\nlet lang='en';\n"+'\n'+readFileSync('www/tutorial.js','utf8')+'\n'+"\nlet count=0;\nfor(const locale of ['en','es','ru']){\n lang=locale;\n for(const [i,l] of tutorialLessons().entries()){\n  loadTutorialLesson(i);\n  if(!$('tutorialNext').disabled)throw Error('Premature next '+l.id);\n  for(const x of l.path)$('tutorialBoard').children[x].onclick();\n  if(!tutorialSession.done||$('tutorialNext').disabled||tutorialSession.path.join()!==l.path.join())throw Error('Render failed '+locale+' '+l.id);\n  // Re-rendering terminal boards and extra taps must never call the engine again.\n  renderTutorial();$('tutorialBoard').children[l.path.at(-1)].onclick();\n  if($('tutorialNext').disabled)throw Error('Terminal render failed '+l.id);\n  count++;\n }\n}\n"+'\nif(count!==75)throw Error("Incomplete tutorial render test");',tutorialRenderCtx);console.log('All 75 tutorial sequences rendered, terminal buttons enabled');
