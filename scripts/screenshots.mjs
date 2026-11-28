import { chromium } from 'playwright';
import {createServer} from 'node:http';import {readFile,mkdir} from 'node:fs/promises';import {resolve,extname} from 'node:path';import assert from 'node:assert/strict';
const root=resolve('www');const server=createServer(async(req,res)=>{try{const p=resolve(root,'.'+(req.url==='/'?'/index.html':req.url.split('?')[0]));if(!p.startsWith(root+'/'))throw Error('path');res.setHeader('Content-Type',({'.html':'text/html','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.png':'image/png'})[extname(p)]||'application/octet-stream');res.end(await readFile(p))}catch{res.writeHead(404);res.end()}});await new Promise(r=>server.listen(0,'127.0.0.1',r));let browser;
try{browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_BIN||undefined,args:['--no-sandbox']});const page=await browser.newPage({viewport:{width:390,height:790},deviceScaleFactor:1,isMobile:true,hasTouch:true,reducedMotion:'reduce'});const chooseSetting=async(id,value)=>{await page.locator('#'+id+'Picker').click();await page.locator('#pickerOptions button[data-value="'+value+'"]').click()};let errs=[];page.on('pageerror',e=>errs.push(String(e)));await page.goto('http://127.0.0.1:'+server.address().port);await page.locator('.slide').first().waitFor();await mkdir('www/shots',{recursive:true});await mkdir('previews',{recursive:true});await page.screenshot({path:'www/shots/gallery.png'});await page.locator('.slide').first().locator('.newChoice').click();await page.locator('#setupStage').waitFor();await page.locator('#opponents [data-value="ai"]').click();await page.screenshot({path:'www/shots/setup.png'});await page.locator('#howToPlay').click();await page.locator('#guidePage').waitFor();assert.equal(await page.locator('.guideCard').count(),5);await page.locator('#guideBack').click();await page.locator('#sides [data-value="1"]').click();await page.locator('#play').click();await page.locator('#board .sq').first().waitFor();await page.screenshot({path:'www/shots/game.png'});// Exercise exact replay, multiple undo/redo, persistence, and branch invalidation.
await page.evaluate(()=>{level=0;start()});
const snap=()=>page.evaluate(()=>JSON.stringify(hist[hist.length-1]));
const play=async()=>{const m=await page.evaluate(()=>e.moves(hist.at(-1).b,human)[0]);await page.locator('#board .sq').nth(m[0]).click();await page.locator('#board .sq').nth(m[1]).click();await page.waitForFunction(()=>!busy);};
const initial=await snap();await play();const one=await snap();await play();const two=await snap();
assert.notEqual(one,two);await page.locator('#undo').click();assert.equal(await snap(),one);await page.locator('#undo').click();assert.equal(await snap(),initial);
await page.locator('#redo').click();assert.equal(await snap(),one);await page.locator('#redo').click();assert.equal(await snap(),two);assert.equal(await page.locator('#redo').isDisabled(),true);
await page.locator('#undo').click();await page.reload();await page.locator('.slide').first().locator('.continueChoice').click();await page.locator('#board .sq').first().waitFor();assert.equal(await snap(),one);await page.locator('#redo').click();assert.equal(await snap(),two);
await page.locator('#undo').click();await play();assert.equal(await page.locator('#redo').isDisabled(),true);
console.log('Multi-round redo, exact snapshots, reload and branch invalidation OK');
await page.locator('#menuBtn').click();await page.locator('#actionButtons button').filter({hasText:/^Rules$/}).click();await page.locator('#guidePage').waitFor();await page.locator('#guideBack').click();await page.reload();await page.locator('#settingsBtn').click();assert.deepEqual(await page.locator('#settingsModal .settingsLine label').evaluateAll(xs=>xs.map(x=>x.htmlFor)),['languagePicker','themeSelectPicker','soundEnabled','animationEnabled']);await page.locator('#aboutBtn').click();assert.equal(await page.locator('#guideClose').count(),0);await page.locator('#guidePage').waitFor();assert.equal(await page.locator('.guideVariant').count(),9);await page.screenshot({path:'previews/about.png'});for(let i=0;i<9;i++){await page.locator('.guideVariant').nth(i).click();assert.equal(await page.locator('.guideCard').count(),i===3?7:i===8?6:5);if(i===0)await page.screenshot({path:'previews/rules.png'});await page.locator('#guideBack').click()}await page.locator('#guideBack').click();for(const locale of ['es','ru','en']){await chooseSetting('language',locale);await page.locator('#aboutBtn').click();assert.ok((await page.locator('#guideTitle').textContent()).length);await page.locator('#guideBack').click()}
// Appearance preferences: explicit, live system changes, reload persistence and guide colors.
await chooseSetting('themeSelect','light');assert.equal(await page.locator('html').getAttribute('data-theme'),'light');
await page.screenshot({path:'previews/light-settings.png'});
await page.locator('#aboutBtn').click();assert.equal(await page.locator('#guidePage').evaluate(x=>getComputedStyle(x).backgroundColor),'rgb(246, 237, 221)');await page.locator('#guideBack').click();
await chooseSetting('themeSelect','dark');assert.equal(await page.locator('html').getAttribute('data-theme'),'dark');
await chooseSetting('themeSelect','system');await page.emulateMedia({colorScheme:'light'});await page.waitForFunction(()=>document.documentElement.dataset.theme==='light');await page.emulateMedia({colorScheme:'dark'});await page.waitForFunction(()=>document.documentElement.dataset.theme==='dark');
await chooseSetting('themeSelect','light');await page.locator('#animationEnabled').uncheck();await page.reload();assert.equal(await page.locator('html').getAttribute('data-theme'),'light');assert.equal(await page.locator('html').getAttribute('data-motion'),'off');
await page.locator('#settingsBtn').click();assert.equal(await page.locator('#themeSelectValue').textContent(),'Light');assert.equal(await page.locator('#animationEnabled').isChecked(),false);
await page.locator('#animationEnabled').check();await page.emulateMedia({reducedMotion:'no-preference'});await page.waitForFunction(()=>document.documentElement.dataset.motion==='on');await page.locator('#closeSettings').click();
// Test actual animation geometry and capture ghost on a controlled Brandubh position.
await page.evaluate(()=>{stop();mode='brandubh';human=1;level=0;e=Engine(mode);hist=[e.start()];future=[];showGame()});
await page.screenshot({path:'previews/light-board.png'});
const anim=await page.evaluate(async()=>{stop();let b=Array(e.L).fill(0);b[14]=1;b[16]=2;b[17]=1;b[24]=3;b[25]=2;const before={...e.start(),b,keys:[b.join('')+'1'],turn:1};const after=e.record(before,[14,15]);if(!after.cap.includes(16))throw Error('capture fixture invalid');hist=[before,after];render();const promise=animateBoardMove(before,after);const ghosts=document.querySelectorAll('.capturedGhost').length;const moving=document.querySelector('.movingCell .piece');const running=moving?.getAnimations().length||0;await promise;return {ghosts,running,left:document.querySelectorAll('.capturedGhost,.movingCell').length}});
assert.equal(anim.ghosts,1);assert.equal(anim.running,1);assert.equal(anim.left,0);
await page.evaluate(()=>{animationPreference=false;storeAppearance()});assert.equal(await page.locator('html').getAttribute('data-motion'),'off');
await page.evaluate(async()=>{const before=hist[0],after=hist[1];await animateBoardMove(before,after);if(document.querySelector('.movingCell,.capturedGhost'))throw Error('animations not disabled')});
console.log('Themes, live system theme, persistence, capture animation, movement and reduced motion checks OK');

// Local shared-table play: explicit selection, no AI, alternating turns, separate saves.
await page.reload();await page.locator('.slide').first().locator('.newChoice').click();
assert.equal(await page.locator('#setupActions').isVisible(),true);assert.equal(await page.locator('#play').isDisabled(),true);assert((await page.locator('#opponentPanel').boundingBox()).height<110);await page.screenshot({path:'previews/opponent-select.png'});
await page.locator('#opponents [data-value="local"]').click();assert.equal(await page.locator('#sidePanel').isHidden(),true);assert.equal(await page.locator('#levelPanel').isHidden(),true);assert.equal(await page.locator('#playersPanel').isVisible(),true);assert.equal(await page.locator('#playerName0').textContent(),'Player 1');assert.equal(await page.locator('#playerName1').textContent(),'Player 2');await page.locator('#editPlayer0').click();await page.locator('#nameInput').fill('Alice');await page.locator('#nameForm button[type=submit]').click();await page.locator('#editPlayer1').click();await page.locator('#nameInput').fill('Bob');await page.locator('#nameForm button[type=submit]').click();await page.locator('#colorPlayer0').click();assert.deepEqual(await page.evaluate(()=>players.map(p=>p.side)),[1,2]);await page.locator('#colorPlayer1').click();assert.deepEqual(await page.evaluate(()=>players.map(p=>p.side)),[2,1]);await page.locator('#colorPlayer0').click();await page.screenshot({path:'previews/local-setup.png'});await page.setViewportSize({width:360,height:640});const sticky=async()=>{const a=await page.locator('#setupActions').boundingBox();assert(a.y>=0&&a.y+a.height<=640);assert(await page.locator('#howToPlay').isVisible());assert(await page.locator('#play').isVisible())};await sticky();await page.locator('#opponents [data-value="ai"]').click();await sticky();await page.evaluate(()=>{$('setupScroll').scrollTop=$('setupScroll').scrollHeight});await sticky();await page.screenshot({path:'previews/compact-setup.png'});await page.locator('#opponents [data-value="local"]').click();await sticky();await page.setViewportSize({width:390,height:790});
await page.locator('#play').click();await page.locator('#localBlack').waitFor();assert.equal(await page.locator('#blackPlayerName').textContent(),'Alice');assert.equal(await page.locator('#whitePlayerName').textContent(),'Bob');
assert.equal(await page.locator('.gameTop').isVisible(),true);assert.equal(await page.locator('#undo').isVisible(),true);assert.equal(await page.locator('#redo').isVisible(),true);assert.equal(await page.locator('#redo').isDisabled(),true);assert.equal(await page.locator('.seatMenu').count(),0);assert.equal(await page.locator('#gameActions').isVisible(),true);assert.equal(await page.locator('#resultLog').isHidden(),true);
assert.equal(await page.locator('#localBlack').evaluate(x=>getComputedStyle(x).transform),'matrix(-1, 0, 0, -1, 0, 0)');
assert.equal(await page.locator('#localBlack').evaluate(x=>x.classList.contains('activeSeat')),true);
await page.screenshot({path:'previews/local-game.png'});
const localPlay=async()=>{const m=await page.evaluate(()=>e.moves(hist.at(-1).b,hist.at(-1).turn)[0]);await page.locator('#board .sq').nth(m[0]).click();await page.locator('#board .sq').nth(m[1]).click();await page.waitForFunction(()=>!busy);};
const localInitial=await snap();await localPlay();const localOne=await snap();assert.equal(await page.evaluate(()=>hist.at(-1).turn),2);assert.equal(await page.locator('#localWhite').evaluate(x=>x.classList.contains('activeSeat')),true);assert.equal(await page.evaluate(()=>worker===null&&hist.at(-1).log.length===1),true);
await localPlay();const localTwo=await snap();assert.equal(await page.evaluate(()=>hist.at(-1).log.length),2);
await page.locator('#undo').click();assert.equal(await snap(),localOne);assert.equal(await page.locator('#redo').isVisible(),true);await page.screenshot({path:'previews/local-toolbar.png'});await page.locator('#undo').click();assert.equal(await snap(),localInitial);await page.locator('#redo').click();assert.equal(await snap(),localOne);await page.locator('#redo').click();assert.equal(await snap(),localTwo);assert.equal(await page.locator('#redo').isVisible(),true);assert.equal(await page.locator('#redo').isDisabled(),true);
await page.locator('#menuBtn').click();assert.equal(await page.locator('#actionModal').isVisible(),true);assert.equal(await page.locator('#actionButtons button').filter({hasText:/Undo|Redo/}).count(),0);await page.locator('#actionButtons button').filter({hasText:/^Save and exit$/}).click();
assert.equal(await page.locator('.slide').first().locator('.continueChoice').isVisible(),true);assert.equal(await page.locator('.slide').first().locator('.continueLocalChoice').isVisible(),true);
await page.reload();await page.locator('.slide').first().locator('.continueLocalChoice').click();assert.equal(await snap(),localTwo);assert.equal(await page.evaluate(()=>opponent), 'local');assert.equal(await page.locator('#blackPlayerName').textContent(),'Alice');assert.equal(await page.locator('#whitePlayerName').textContent(),'Bob');assert.deepEqual(await page.evaluate(()=>players.map(p=>p.side)),[1,2]);
for(const k of ['brandubh','tablut','hnefatafl','copenhagen','historical','ardri','tawlbwrdd','magpie','berserk']){await page.evaluate(k=>{mode=k;opponent='local';start()},k);await localPlay();await localPlay();assert.equal(await page.evaluate(()=>hist.at(-1).log.length),2);const rect=await page.locator('#board').boundingBox();assert(Math.abs(rect.width-rect.height)<2);assert(rect.y>=0&&rect.y+rect.height<=790);}
await page.setViewportSize({width:360,height:640});const fit=await page.evaluate(()=>{const a=$('localBlack').getBoundingClientRect(),b=$('board').getBoundingClientRect(),c=$('localWhite').getBoundingClientRect();return a.top>=-1&&a.bottom<=b.top&&b.bottom<=c.top&&c.bottom<=innerHeight+1});assert(fit);
console.log('Local two-player mode, nine variants, separate autosaves, single-turn history and compact layout OK');
for(const k of ['brandubh','tablut','hnefatafl','copenhagen','historical','ardri','tawlbwrdd','magpie','berserk']){
 await page.evaluate(k=>{mode=k;opponent='local';start()},k);
 const actual=await page.evaluate(()=>({goals:document.querySelectorAll('#board .goal .squareIcon').length,expected:Array.from({length:e.L},(_,i)=>i).filter(e.goal).length,throne:document.querySelectorAll('#board .throneMark').length,hasThrone:e.restricted(e.T),king:document.querySelectorAll('#board .king .pieceIcon').length,officers:document.querySelectorAll('#board .commander .pieceIcon,#board .knight .pieceIcon').length,color:getComputedStyle(document.querySelector('#board .goal')).backgroundColor}));
 assert.equal(actual.goals,actual.expected);assert.equal(actual.throne,Number(actual.hasThrone));assert.equal(actual.king,1);assert.equal(actual.officers,k==='berserk'?5:0);assert.equal(actual.color,'rgb(133, 134, 124)');
 await page.screenshot({path:'previews/royal-'+k+'.png'});
}
console.log('Royal board SVG symbols and graphite special squares verified in all nine variants');

await page.setViewportSize({width:390,height:790});
await page.evaluate(()=>{clockChoice=0;mode='berserk';opponent='local';start();const b=Array(e.L).fill(0);b[23]=5;b[24]=1;b[26]=1;b[60]=3;b[108]=1;hist=[{...e.start(),b,turn:2,keys:[b.join('')+'2']}];future=[];render()});
await page.locator('#board .sq').nth(23).click();await page.locator('#board .sq').nth(25).click();
assert(await page.locator('#finishChain').isVisible());assert.equal(await page.evaluate(()=>draft.join()),'23,25');assert.equal(await page.evaluate(()=>hist.at(-1).log.length),0);
await page.evaluate(()=>window.taflBack());assert.equal(await page.evaluate(()=>draft.join()),'23,25');await page.evaluate(()=>window.taflBack());
assert(await page.locator('#finishChain').isVisible());await page.locator('#board .sq').nth(27).click();await page.waitForFunction(()=>!busy);
assert.equal(await page.evaluate(()=>hist.at(-1).log.at(-1).m.join()),'23,25,27');assert.equal(await page.evaluate(()=>hist.at(-1).log.at(-1).cap),2);
await page.locator('#undo').click();assert.equal(await page.evaluate(()=>hist.at(-1).b[23]),5);await page.locator('#redo').click();assert.equal(await page.evaluate(()=>hist.at(-1).b[27]),5);
await page.locator('#undo').click();await page.locator('#board .sq').nth(23).click();await page.locator('#board .sq').nth(25).click();await page.locator('#finishChain').click();await page.waitForFunction(()=>!busy);
assert.equal(await page.evaluate(()=>hist.at(-1).log.at(-1).m.join()),'23,25');assert.equal(await page.evaluate(()=>hist.at(-1).turn),1);console.log('Berserk UI: jump, pause, continue, finish, undo and redo OK');


// Results are keyed per game, undo removes result, redo restores it once.
await page.evaluate(()=>{stop();mode='brandubh';opponent='local';e=Engine(mode);gameId=newGameId();const b=Array(e.L).fill(0);b[1]=3;b[24]=1;b[16]=2;const before={...e.start(),b,turn:2,keys:[b.join('')+'2']};hist=[before,e.record(before,[1,0])];future=[];persist();showGame();persist()});
assert.equal(await page.evaluate(()=>readResults().filter(x=>x.id===gameId).length),1);
await page.locator('#undo').click();assert.equal(await page.evaluate(()=>readResults().filter(x=>x.id===gameId).length),0);
await page.locator('#redo').click();assert.equal(await page.evaluate(()=>readResults().filter(x=>x.id===gameId).length),1);
await page.evaluate(()=>{stop();gameId=newGameId();mode='tablut';opponent='ai';human=2;level=1;recordResult({win:2,why:'Король спасся',log:[1,2]});gameId=newGameId();mode='brandubh';human=1;level=0;recordResult({win:2,why:'Король спасся',log:[1]});menu()});
await page.locator('#statsBtn').click();assert.deepEqual(await page.locator('#statsAi strong').allTextContents(),['2','1','1','0','50%']);assert.deepEqual(await page.locator('#statsLocal strong').allTextContents(),['1','0','1','0']);
await page.locator('#statsVariant').selectOption('tablut');assert.deepEqual(await page.locator('#statsAi strong').allTextContents(),['1','1','0','0','100%']);
await page.locator('#statsVariant').selectOption('all');await page.locator('#statsSide').selectOption('1');assert.deepEqual(await page.locator('#statsAi strong').allTextContents(),['1','0','1','0','0%']);await page.locator('#statsSide').selectOption('all');
await page.locator('#statsLevel').selectOption('1');assert.deepEqual(await page.locator('#statsAi strong').allTextContents(),['1','1','0','0','100%']);await page.locator('#statsLevel').selectOption('all');
await page.screenshot({path:'previews/statistics.png'});await page.locator('#statsBack').click();await page.reload();await page.locator('#statsBtn').click();assert.deepEqual(await page.locator('#statsAi strong').allTextContents(),['2','1','1','0','50%']);assert.equal(await page.locator('.recentGame').count(),3);await page.locator('#statsBack').click();
console.log('Statistics filters, separate local record, undo/redo idempotency and reload OK');

// Chess clocks: default off, equal independent budgets, switching, no
// reset by selection, no animation charge, timeout, saved remaining time.
await page.setViewportSize({width:390,height:790});
await page.locator('.slide').first().locator('.newChoice').click();
assert.equal(await page.locator('#clockPanel').isHidden(),true);assert.equal(await page.locator('#clockChoices [data-value="0"]').getAttribute('aria-pressed'),'true');
await page.locator('#opponents [data-value="local"]').click();
assert.equal(await page.locator('#clockPanel').isVisible(),true);await page.locator('#clockChoices [data-value="5"]').click();await page.screenshot({path:'previews/clock-setup.png'});
await page.evaluate(()=>{clockChoice=5;mode='brandubh';opponent='local';start()});
assert.equal(await page.locator('#blackLocalClock').isVisible(),true);assert.equal(await page.locator('#undo').isVisible(),true);assert.equal(await page.locator('#undo').isDisabled(),true);assert.equal(await page.evaluate(()=>clockSide),1);
const beforeClocks=await page.evaluate(()=>clockSnapshot().remaining);
assert(beforeClocks[1]<=300000&&beforeClocks[1]>298000);assert.equal(beforeClocks[2],300000);
await page.evaluate(()=>{clockStarted-=62000});await localPlay();
const afterBlack=await page.evaluate(()=>clockSnapshot().remaining);
assert(afterBlack[1]<239000&&afterBlack[1]>235000);assert(afterBlack[2]>298000);assert.equal(await page.evaluate(()=>clockSide),2);
await page.evaluate(()=>{clockStarted-=20000});await localPlay();
const afterWhite=await page.evaluate(()=>clockSnapshot().remaining);assert(afterWhite[2]<281000&&afterWhite[2]>277000);assert(afterWhite[1]<=afterBlack[1]&&afterWhite[1]>afterBlack[1]-2000);
await page.screenshot({path:'previews/local-clock.png'});
await page.locator('#menuBtn').click();await page.locator('#actionButtons button').filter({hasText:/^Save and exit$/}).click();
const savedClock=await page.evaluate(()=>readSave('brandubh','local').clock);assert.equal(savedClock.limit,5);
await page.reload();await page.locator('.slide').first().locator('.continueLocalChoice').click();
const restored=await page.evaluate(()=>clockSnapshot().remaining);assert.equal(restored[2],savedClock.remaining[2]);assert(restored[1]<=savedClock.remaining[1]&&restored[1]>savedClock.remaining[1]-2000);
await page.evaluate(()=>{clockStarted-=400000;clockCheck()});
assert.equal(await page.evaluate(()=>hist.at(-1).win),2);assert.equal(await page.evaluate(()=>hist.at(-1).why),'Время вышло');assert.equal(await page.locator('#blackLocalClock').textContent(),'0:00');assert.equal(await page.evaluate(()=>clockSide),0);
assert.equal(await page.evaluate(()=>readResults().filter(r=>r.id===gameId&&r.win===2&&r.clockMinutes===5).length),1);
assert.equal(await page.evaluate(()=>readSave('brandubh','local')),null);
await page.evaluate(()=>{clockChoice=10;mode='brandubh';opponent='ai';human=1;level=0;start()});
assert.equal(await page.locator('#blackAiClock').isVisible(),true);assert.equal(await page.evaluate(()=>clockSide),1);
await page.evaluate(()=>{clockStarted-=610000;clockCheck()});assert.equal(await page.evaluate(()=>hist.at(-1).win),2);assert.equal(await page.evaluate(()=>hist.at(-1).why),'Время вышло');
await page.evaluate(()=>{clockChoice=20;mode='brandubh';opponent='ai';human=2;level=0;start()});
await page.waitForFunction(()=>!busy&&clockSide===2);const aiClocks=await page.evaluate(()=>clockSnapshot().remaining);assert(aiClocks[1]<1200000&&aiClocks[1]>1190000);assert(aiClocks[2]>1198000);
await page.screenshot({path:'previews/ai-clock.png'});
await page.evaluate(()=>{clockSuspend()});assert.equal(await page.evaluate(()=>clockStarted),null);
await page.evaluate(()=>{clockStart(2)});assert.equal(await page.evaluate(()=>clockSide),2);
await page.evaluate(()=>{clockChoice=0;mode='brandubh';opponent='local';start()});assert.equal(await page.locator('#blackLocalClock').isHidden(),true);assert.equal(await page.locator('#undo').isVisible(),true);
console.log('Independent chess clocks, alternating turns, persistence, timeout, AI and local play OK');

// Native Back delegates to this same handler. Pause survives rules/history
// and background visibility changes; no stale worker can commit while paused.
await page.evaluate(()=>{clockChoice=5;mode='brandubh';opponent='local';start();clockStarted-=12000;window.taflBack()});
assert.equal(await page.locator('#actionModal').isVisible(),true);assert.equal(await page.locator('#menuBtn').getAttribute('aria-label'),'Pause');
const pausedTime=await page.evaluate(()=>clockSnapshot().remaining);
assert.equal(await page.evaluate(()=>matchPaused&&clockSide===0&&clockStarted===null),true);
await page.waitForTimeout(350);assert.deepEqual(await page.evaluate(()=>clockSnapshot().remaining),pausedTime);
await page.locator('#actionButtons button').filter({hasText:/^Rules$/}).click();
assert.equal(await page.locator('#guidePage').isVisible(),true);assert.deepEqual(await page.evaluate(()=>clockSnapshot().remaining),pausedTime);
await page.evaluate(()=>window.taflBack());assert.equal(await page.locator('#actionModal').isVisible(),true);
await page.locator('#actionButtons button').filter({hasText:/^Game log$/}).click();
await page.waitForTimeout(200);assert.deepEqual(await page.evaluate(()=>clockSnapshot().remaining),pausedTime);
await page.evaluate(()=>window.taflBack());assert.equal(await page.locator('#actionModal').isVisible(),true);
await page.evaluate(()=>{clockReady();document.dispatchEvent(new Event('visibilitychange'))});assert.deepEqual(await page.evaluate(()=>clockSnapshot().remaining),pausedTime);
await page.screenshot({path:'previews/pause-menu.png'});
await page.evaluate(()=>window.taflBack());assert.equal(await page.locator('#actionModal').isHidden(),true);assert.equal(await page.evaluate(()=>!matchPaused&&clockSide===1&&clockStarted!==null),true);
await page.waitForTimeout(200);assert((await page.evaluate(()=>clockLeft(1)))<pausedTime[1]);assert.equal(await page.evaluate(()=>clockLeft(2)),pausedTime[2]);
await page.locator('#menuBtn').click();assert.equal(await page.evaluate(()=>matchPaused),true);
await page.locator('#actionButtons button').filter({hasText:/^Resume$/}).click();assert.equal(await page.evaluate(()=>!matchPaused),true);
await page.evaluate(()=>{clockChoice=5;mode='brandubh';opponent='ai';human=2;level=0;start();window.taflBack()});
assert.equal(await page.evaluate(()=>matchPaused&&worker===null&&hist.at(-1).log.length===0),true);
const botPaused=await page.evaluate(()=>clockSnapshot().remaining);await page.waitForTimeout(500);
assert.equal(await page.evaluate(()=>hist.at(-1).log.length),0);assert.deepEqual(await page.evaluate(()=>clockSnapshot().remaining),botPaused);
await page.evaluate(()=>window.taflBack());await page.waitForFunction(()=>!busy&&clockSide===2);
assert.equal(await page.evaluate(()=>hist.at(-1).log.length),1);
await page.evaluate(()=>{clockChoice=0;mode='brandubh';opponent='local';start();window.taflBack()});assert.equal(await page.evaluate(()=>matchPaused),true);await page.evaluate(()=>window.taflBack());assert.equal(await page.evaluate(()=>!matchPaused),true);
await page.evaluate(()=>menu());await page.evaluate(()=>window.taflBack());assert.equal(await page.locator('#settingsModal').isVisible(),true);await page.evaluate(()=>window.taflBack());assert.equal(await page.locator('#settingsModal').isHidden(),true);
await page.evaluate(()=>setup('brandubh'));await page.evaluate(()=>window.taflBack());assert.equal(await page.locator('#galleryStage').isVisible(),true);

// Both modes use exactly the same ordered pause actions.
for(const kind of ['local','ai']){
 await page.evaluate(kind=>{clockChoice=5;mode='brandubh';opponent=kind;human=1;start();window.taflBack()},kind);
 assert.deepEqual(await page.locator('#actionButtons button').allTextContents(),['Resume','Restart','Game log','Rules','Save and exit','Exit without saving']);
 assert.equal(await page.locator('#actionButtons button').first().getAttribute('class'),'primary');
 const remaining=await page.evaluate(()=>clockSnapshot().remaining);
 await page.locator('#actionButtons button').filter({hasText:/^Restart$/}).click();
 await page.evaluate(()=>window.taflBack());
 assert.deepEqual(await page.locator('#actionButtons button').allTextContents(),['Resume','Restart','Game log','Rules','Save and exit','Exit without saving']);
 assert.deepEqual(await page.evaluate(()=>clockSnapshot().remaining),remaining);
 await page.locator('#actionButtons button').filter({hasText:/^Resume$/}).click();
 assert.equal(await page.evaluate(()=>matchPaused),false);
}
console.log('Pause menu, Back routing, frozen clocks, nested rules/history, cancelled AI worker and menu order OK');

// UI polish regression: picker dimensions, custom selection, Back,
 // setup header, conditional controls and pause-only game log.
await page.evaluate(()=>{menu();$('settingsBtn').click()});
const langRect=await page.locator('#languagePicker').boundingBox(),themeRect=await page.locator('#themeSelectPicker').boundingBox();
assert.equal(langRect.width,themeRect.width);assert.equal(langRect.height,themeRect.height);
assert.equal(await page.locator('#language').isHidden(),true);assert.equal(await page.locator('#themeSelect').isHidden(),true);
await page.locator('#languagePicker').click();assert.equal(await page.locator('#pickerModal').isVisible(),true);
assert.equal(await page.locator('#pickerOptions button[aria-pressed=true]').getAttribute('data-value'),'en');
await page.screenshot({path:'previews/language-picker.png'});await page.evaluate(()=>window.taflBack());
assert.equal(await page.locator('#pickerModal').isHidden(),true);assert.equal(await page.locator('#settingsModal').isVisible(),true);
await chooseSetting('themeSelect','dark');await page.locator('#themeSelectPicker').click();await page.screenshot({path:'previews/dark-picker.png'});await page.locator('#pickerClose').click();
await chooseSetting('themeSelect','light');await page.locator('#closeSettings').click();
await page.evaluate(()=>setup('brandubh'));
assert.equal(await page.locator('#brandHeader').isHidden(),true);assert.equal(await page.locator('#clockPanel').isHidden(),true);
assert.equal(await page.locator('#howToPlay').textContent(),'Rules');assert.equal(await page.locator('#setupActions button').count(),1);
const titleBox=await page.locator('.setupHead').boundingBox(),rulesBox=await page.locator('#howToPlay').boundingBox();assert(rulesBox.x>titleBox.x+titleBox.width/2);assert(rulesBox.y<100);
await page.locator('#opponents [data-value="ai"]').click();assert.equal(await page.locator('#clockPanel').isVisible(),true);
await page.screenshot({path:'previews/setup-polished.png'});
await page.locator('#setupBack').click();assert.equal(await page.locator('#brandHeader').isVisible(),true);
await page.evaluate(()=>{clockChoice=0;mode='brandubh';opponent='ai';human=1;start()});
assert.equal(await page.locator('#historyBtn').count(),0);assert.equal(await page.locator('#gameActions').isVisible(),true);assert.equal(await page.locator('#resultLog').isHidden(),true);
await page.locator('#menuBtn').click();assert.equal(await page.locator('#closeAction').isHidden(),true);assert.equal(await page.locator('#actionText').isHidden(),true);
await page.screenshot({path:'previews/pause-polished.png'});await page.locator('#actionButtons button').filter({hasText:/^Restart$/}).click();
assert.equal(await page.locator('#actionText').isVisible(),true);await page.evaluate(()=>window.taflBack());assert.equal(await page.locator('#actionText').isHidden(),true);
console.log('Custom pickers, aligned fields, conditional time control, compact setup and clean pause UI OK');

// Bottom controls for live and completed games, including all result kinds.
for(const kind of ['ai','local']){
 await page.setViewportSize({width:360,height:640});
 await page.evaluate(kind=>{clockChoice=0;mode='brandubh';opponent=kind;human=2;start();stop();e=Engine(mode);const b=Array(e.L).fill(0);b[1]=3;b[24]=1;b[16]=2;const before={...e.start(),b,turn:2,keys:[b.join('')+'2']};hist=[before];future=[];persist();render()},kind);
 assert.equal(await page.locator('.gameTop #undo').count(),0);
 assert.equal(await page.locator('#moveControls #undo').isVisible(),true);
 assert.equal(await page.locator('#resultLog').isHidden(),true);
 const board=await page.locator('#board').boundingBox(),undo=await page.locator('#undo').boundingBox();assert(undo.y>=board.y+board.height);
 await page.evaluate(()=>{hist.push(e.record(hist.at(-1),[1,0]));persist();render()});
 for(const win of [2,1,3]){
  await page.evaluate(win=>{hist[hist.length-1]={...hist.at(-1),win};persist();render()},win);
  assert.equal(await page.locator('#resultLog').isVisible(),true);
  assert.equal(await page.locator('#undo').isEnabled(),true);
  assert.equal(await page.locator('#redo').isVisible(),true);assert.equal(await page.locator('#redo').isDisabled(),true);
  assert.equal(await page.locator('#newGameAction').isVisible(),true);assert.equal(await page.locator('#menuGameAction').isVisible(),true);
 }
 await page.locator('#resultLog').click();assert.equal(await page.locator('#historyModal').isVisible(),true);await page.locator('#closeHistory').click();
 await page.screenshot({path:'previews/'+kind+'-result-controls.png'});
 await page.locator('#undo').click();assert.equal(await page.evaluate(()=>hist.at(-1).win),0);assert.equal(await page.locator('#resultLog').isHidden(),true);assert.equal(await page.locator('#redo').isVisible(),true);
 await page.locator('#redo').click();assert.equal(await page.locator('#resultLog').isVisible(),true);assert.equal(await page.locator('#redo').isVisible(),true);assert.equal(await page.locator('#redo').isDisabled(),true);
 if(kind==='local'){const rect=await page.locator('#gameActions').boundingBox();assert(rect.y+rect.height<=640+1)}
}
await page.evaluate(()=>{clockChoice=5;mode='brandubh';opponent='local';start()});
assert.equal(await page.locator('#gameActions').isVisible(),true);
await page.evaluate(()=>{clockStarted-=400000;clockCheck()});
assert.equal(await page.locator('#undo').isVisible(),true);assert.equal(await page.locator('#undo').isDisabled(),true);assert.equal(await page.locator('#resultLog').isVisible(),true);
console.log('Bottom undo/redo, result-only log, result undo/redo and timed-game restrictions OK');

for(const locale of ['en','es','ru']){
 for(const humanSide of [1,2]){
  await page.evaluate(({locale,humanSide})=>{lang=locale;applyLanguage();clockChoice=0;mode='brandubh';opponent='ai';human=humanSide;start();stop();render()},{locale,humanSide});
  assert.equal(await page.locator('#title').textContent(),'Brandubh');
  const a=await page.locator('#undo').boundingBox(),b=await page.locator('#redo').boundingBox(),s=await page.locator('#status').boundingBox();
  assert(a&&b&&s&&Math.abs(a.y-b.y)<1&&s.y>=a.y+a.height);
  assert.equal(await page.locator('#redo').isDisabled(),true);
  const black=await page.locator('#blackCard').boundingBox(),white=await page.locator('#whiteCard').boundingBox(),bc=await page.locator('#bc').boundingBox(),wc=await page.locator('#wc').boundingBox();
  assert(Math.abs(black.height-white.height)<1&&Math.abs(bc.y-wc.y)<1);
  await page.evaluate(()=>{future=[hist.at(-1)];render()});
  const after=await page.locator('#undo').boundingBox();assert.equal(after.x,a.x);assert.equal(after.y,a.y);
 }
}
await page.evaluate(()=>{lang='en';applyLanguage();clockChoice=0;mode='brandubh';opponent='ai';human=2;start();stop();render()});
await page.screenshot({path:'previews/aligned-game.png'});
console.log('Stable undo/redo positions, left title, bottom status and aligned localized player cards OK');

await page.evaluate(()=>{menu();setup('brandubh')});
await page.locator('#opponents [data-value="ai"]').click();
assert.equal(await page.locator('#levels button').count(),4);
await page.locator('#levels [data-value="3"]').click();
assert.equal(await page.evaluate(()=>level),3);
assert.equal(await page.locator('#levels [data-value="3"]').textContent(),'Impossible');
await page.evaluate(()=>{clockChoice=0;human=1;start();stop();persist();render()});
assert.equal(await page.evaluate(()=>readSave('brandubh','ai').level),3);
assert.equal(await page.locator('#whiteMeta').textContent(),'Impossible');
await page.evaluate(()=>menu());await page.evaluate(()=>resume('brandubh','ai'));assert.equal(await page.evaluate(()=>level),3);
await page.evaluate(()=>{menu();$('statsBtn').click()});assert.equal(await page.locator('#statsLevel option[value="3"]').textContent(),'Impossible');
await page.locator('#statsBack').click();
console.log('Impossible selection, saved match, player card and statistics filter OK');
assert.deepEqual(errs,[]);console.log('Guide, all variants and locales, setup and game smoke test OK')}finally{if(browser)await browser.close();server.close()}
