
const tutorialProgress=(()=>{try{const d=JSON.parse(localStorage.getItem('tafl.tutorial.v1')||'{}');return {visible:d.visible!==false,next:typeof d.next==='string'?d.next:null,done:d.done===true}}catch{return {visible:true,next:null,done:false}}})();
let tutorialCourse=null,tutorialSession=null;
const tutorialWords={
en:{title:'Tutorial',learned:'Completed',hide:'Hide tutorial',show:'Show tutorial',start:'Start',resume:'Continue',again:'Replay',hint:'Hint',next:'Next',finish:'Finish',back:'Back',select:'Select the highlighted piece.',target:'Move to the highlighted square.',choose:'Choose a piece.',invalid:'That move is not allowed.',other:'Try the highlighted move.',retry:'Try another move.',ok:'Correct',capture:'Captured',black:'Black wins',white:'White wins',complete:'Tutorial completed',chain:'Continue with the same piece.'},
ru:{title:'Обучение',learned:'Изучено',hide:'Скрыть обучение',show:'Показывать обучение',start:'Начать',resume:'Продолжить',again:'Повторить',hint:'Подсказка',next:'Далее',finish:'Завершить',back:'Назад',select:'Выбери выделенную фишку.',target:'Нажми на выделенную клетку.',choose:'Выбери фишку.',invalid:'Так ходить нельзя.',other:'Сделай выделенный ход.',retry:'Попробуй другой ход.',ok:'Верно',capture:'Захвачено',black:'Чёрные победили',white:'Белые победили',complete:'Обучение пройдено',chain:'Продолжи той же фигурой.'},
es:{title:'Tutorial',learned:'Completado',hide:'Ocultar tutorial',show:'Mostrar tutorial',start:'Empezar',resume:'Continuar',again:'Repetir',hint:'Pista',next:'Siguiente',finish:'Finalizar',back:'Volver',select:'Elegí la ficha marcada.',target:'Tocá la casilla marcada.',choose:'Elegí una ficha.',invalid:'Esa jugada no está permitida.',other:'Hacé la jugada marcada.',retry:'Probá otra jugada.',ok:'Correcto',capture:'Capturadas',black:'Ganan las negras',white:'Ganan las blancas',complete:'Tutorial completado',chain:'Continuá con la misma ficha.'}};
const tw=key=>(tutorialWords[lang]||tutorialWords.en)[key];
function tutorialLessons(){return tutorialCourse||(tutorialCourse=TutorialLessons(Engine))}
function saveTutorial(){try{localStorage.setItem('tafl.tutorial.v1',JSON.stringify(tutorialProgress))}catch{}}
function galleryModes(){return tutorialProgress.visible?['tutorial',...modes]:modes}
function setTutorialVisible(visible){const k=galleryModes()[slideIndex];tutorialProgress.visible=visible;saveTutorial();slideIndex=Math.max(0,galleryModes().indexOf(visible?'tutorial':k));settings();refreshSave();goSlide(slideIndex,false)}
function tutorialCard(){const card=document.createElement('article');card.className='slide tutorialCard';card.dataset.variant='tutorial';const title=document.createElement('div');title.className='slideHead';const heading=document.createElement('h2');heading.textContent=tw('title');title.append(heading);if(tutorialProgress.done){const badge=document.createElement('span');badge.className='tutorialLearned';badge.textContent='✓ '+tw('learned');title.append(badge)}
 const example=tutorialLessons()[2],pic=document.createElement('div');pic.className='preview tutorialPreview';pic.style.gridTemplateColumns='repeat('+example.engine.n+',1fr)';example.b.forEach((p,i)=>{const c=document.createElement('div');c.className='miniCell '+((i%7+Math.floor(i/7))%2?'alt ':'')+(example.engine.goal(i)?'goal ':'')+(example.engine.restricted(i)?'restricted ':'');c.innerHTML=squareIcon(example.engine,i)+(p?'<span class="piece '+pieceClass(p)+'">'+pieceIcon(p)+'</span>':'');if(i===example.path[1])c.classList.add('tutorialTarget');pic.append(c)});
 const actions=document.createElement('div');actions.className='slideActions';const start=document.createElement('button');start.className='primary tutorialStart';start.textContent=tw(tutorialProgress.done?'again':tutorialProgress.next?'resume':'start');start.onclick=()=>openTutorial();const hide=document.createElement('button');hide.className='tutorialHide';hide.textContent=tw('hide');hide.onclick=()=>setTutorialVisible(false);actions.append(start,hide);card.append(title,pic,actions);return card;
}
function openTutorial(){const list=tutorialLessons();const i=tutorialProgress.done?0:Math.max(0,list.findIndex(l=>l.id===tutorialProgress.next));tutorialSession={index:i};loadTutorialLesson(i);$('tutorialPage').hidden=false;$('tutorialPage').scrollTop=0}
function loadTutorialLesson(i){const l=tutorialLessons()[i];tutorialSession={index:i,b:l.b.slice(),selected:-1,path:[],done:false,cap:[],hint:!l.quiz,message:''};renderTutorial()}
function closeTutorial(){if(!tutorialSession)return;$('tutorialPage').hidden=true;tutorialSession=null;settings();refreshSave()}
function tutorialClick(i){
 const s=tutorialSession,l=tutorialLessons()[s.index],e=l.engine;if(s.done)return;
 const from=s.path.at(-1)??s.selected;
 if(!s.path.length&&e.S[s.b[i]]===l.side){s.selected=i;s.message='';renderTutorial();return}
 if(from<0){s.message=tw('choose');renderTutorial();return}
 const allowed=s.path.length?e.continuations(s.b,from):e.dest(s.b,from);
 if(!allowed.includes(i)){s.message=tw('invalid');renderTutorial();return}
 const path=s.path.length?[...s.path,i]:[from,i],r=e.apply(l.b,path);
 if((!l.quiz||s.hint)&&path.some((x,j)=>x!==l.path[j])){s.message=tw('other');renderTutorial();return}
 if(l.quiz&&(r.cap.length!==l.captures||r.win!==l.winner)){s.message=tw('retry');renderTutorial();return}
 s.b=r.b;s.path=path;s.cap=r.cap;s.selected=i;s.message='';
 s.done=l.quiz||path.length===l.path.length;
 if(s.done){s.selected=-1;if(!tutorialProgress.done){const next=tutorialLessons()[s.index+1];tutorialProgress.next=next?.id||null;if(!next)tutorialProgress.done=true;saveTutorial()}s.message=r.win?tw(r.win===1?'black':'white'):r.cap.length?tw('capture')+' '+r.cap.length:tw('ok')}
 renderTutorial();
}
function renderTutorial(){
 const s=tutorialSession;if(!s)return;const list=tutorialLessons(),l=list[s.index],e=l.engine,offset=lang==='ru'?2:lang==='es'?4:0;
 $('tutorialTitle').textContent=tw('title');$('tutorialBack').setAttribute('aria-label',tw('back'));$('tutorialCounter').textContent=(s.index+1)+' / '+list.length;$('tutorialProgressBar').style.width=((s.index+(s.done?1:0))/list.length*100)+'%';
 $('tutorialLessonTitle').textContent=l.copy[offset];$('tutorialVariant').textContent=variants[l.variant].title;$('tutorialInstruction').textContent=l.copy[offset+1];
 const board=$('tutorialBoard');board.style.gridTemplateColumns='repeat('+e.n+',minmax(0,1fr))';if(board.children.length!==e.L){board.replaceChildren();for(let i=0;i<e.L;i++){const cell=document.createElement('button');cell.type='button';cell.dataset.cell=String(i);cell.onclick=()=>tutorialClick(i);board.append(cell)}}
 const from=s.path.at(-1)??s.selected,targets=from>=0?(s.path.length?e.continuations(s.b,from):e.dest(s.b,from)):[];
 const expectedFrom=l.path[Math.max(0,s.path.length-1)],expectedTo=l.path[s.path.length||1];
 s.b.forEach((p,i)=>{const cell=board.children[i];cell.className='sq '+((i%e.n+Math.floor(i/e.n))%2?'alt ':'')+(e.goal(i)?'goal ':'')+(e.restricted(i)?'restricted ':'')+(s.selected===i?'sel ':'')+(s.done&&s.cap.includes(i)?'cap ':'');
 if(!s.done&&s.hint&&((from!==expectedFrom&&i===expectedFrom)||(from===expectedFrom&&i===expectedTo)))cell.classList.add('tutorialTarget');
 cell.dataset.cell=String(i);cell.setAttribute('aria-label',e.name(i));cell.innerHTML=squareIcon(e,i)+(p?'<span class="piece '+pieceClass(p)+'">'+pieceIcon(p)+'</span>':!s.done&&targets.includes(i)?'<span class="dot"></span>':'');});
 $('tutorialFeedback').textContent=s.message|| (s.path.length&&!s.done?tw('chain'):s.hint?tw(from!==expectedFrom?'select':'target'):tw('choose'));$('tutorialFeedback').classList.toggle('correct',s.done);
 $('tutorialHint').textContent=tw('hint');$('tutorialHint').hidden=s.done||s.hint;$('tutorialNext').textContent=tw(s.index===list.length-1?'finish':'next');$('tutorialNext').disabled=!s.done;
}
function initTutorial(){$('tutorialVisible').checked=tutorialProgress.visible;$('tutorialVisible').onchange=()=>setTutorialVisible($('tutorialVisible').checked);$('tutorialBack').onclick=closeTutorial;$('tutorialHint').onclick=()=>{const s=tutorialSession;s.hint=true;s.message='';s.selected=-1;renderTutorial()};$('tutorialNext').onclick=()=>{const s=tutorialSession;if(!s?.done)return;if(s.index+1<tutorialLessons().length)loadTutorialLesson(s.index+1);else closeTutorial()}}
