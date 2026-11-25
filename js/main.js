// 시작점: 테마 · 버튼 동작 · 이벤트 연결
import {$,toast,fmtTime} from './util.js';
import {Settings,Progress,Backup} from './storage.js';
import {Quiz} from './quiz.js';
import {Overlay,LOModal,Dict,BackupModal} from './views/overlays.js';
import {viewHome} from './views/home.js';
import {UI,viewGlossary,glossaryTabs,glossaryList,viewWrong} from './views/library.js';
import {viewQuiz,viewResult,viewReview,updateTimer} from './views/quiz.js';

const Theme={
 init(){const sys=window.matchMedia&&matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';this.apply(Settings.theme||sys);},
 apply(t){document.documentElement.dataset.theme=t;$('th').textContent=t==='dark'?'☀️':'🌙';},
 toggle(){const t=document.documentElement.dataset.theme==='dark'?'light':'dark';Settings.setTheme(t);this.apply(t);}
};

// 풀이 화면을 떠날 때: 풀던 문제는 저장해 두고(이어 풀기) 다른 화면으로
function leave(view){Quiz.pause();Overlay.closeAll();view();}
function startQuiz(mode,arg){
 const err=Quiz.start(mode,arg);
 if(err){alert(err);return;}
 Overlay.closeAll();viewQuiz();window.scrollTo(0,0);
}

Quiz.onTick=updateTimer;
Quiz.onTimeout=()=>{viewResult(true);alert('시간이 다 됐어요! 자동으로 제출했어요.');};

const ACTIONS={
 home(){
  if(Quiz.active()&&Quiz.cur.end&&!confirm('모의고사 타이머는 나가 있어도 계속 흘러가요. 처음 화면으로 갈까요?'))return;
  leave(viewHome);
 },
 theme:()=>Theme.toggle(),
 glossary:d=>{if(d.tab)UI.glTab=d.tab;leave(viewGlossary);},
 'gl-tab':d=>{UI.glTab=d.tab;glossaryTabs();glossaryList();},
 start:d=>{
  if(!Quiz.active()&&Quiz.saved()&&!confirm('풀던 문제가 있어요. 새로 시작하면 풀던 문제는 사라져요(이미 채점된 기록은 남아요). 시작할까요?'))return;
  startQuiz(d.mode,d.arg||undefined);
 },
 resume(){
  const r=Quiz.resume();
  if(r==='none'){toast('이어 풀 문제가 없어요');viewHome();}
  else if(r==='timeout'){viewResult(true);alert('시험 시간이 이미 끝나서 자동으로 제출했어요.');}
  else{viewQuiz();window.scrollTo(0,0);}
 },
 discard(){if(confirm('풀던 문제를 버릴까요? (이미 채점된 기록은 남아요)')){Quiz.discard();viewHome();}},
 choose:d=>{Quiz.choose(+d.i);viewQuiz();},
 move:d=>{Quiz.move(+d.d);viewQuiz();window.scrollTo(0,0);},
 jump:d=>{Quiz.jump(+d.i);viewQuiz();},
 submit(){
  const un=Quiz.unanswered();
  if(un&&!confirm(`아직 ${un}문항을 풀지 않았어요. 그래도 제출할까요?`))return;
  Quiz.finish();viewResult(false);
 },
 review:d=>viewReview(d.f==='wrong'),
 'wrong-view':()=>leave(viewWrong),
 'wrong-del':d=>{Progress.removeWrong(d.id);viewWrong();},
 'wrong-clear':()=>{if(confirm('오답 노트를 모두 비울까요?')){Progress.clearWrong();viewWrong();}},
 'seen-reset':()=>{if(confirm('출제 기록을 초기화할까요?')){Progress.clearSeen();viewHome();}},
 lo:d=>LOModal.open(d.lo),
 'modal-close':()=>Overlay.close('modal'),
 'dict-open':()=>Dict.open(),
 'dict-close':()=>Overlay.close('dict'),
 'dict-cat':d=>{Dict.cat=d.cat;Dict.render();},
 backup:()=>BackupModal.open(),
 'bk-copy':()=>BackupModal.copy(),
 'bk-restore'(){
  const v=$('bkin').value.trim();
  if(!v){toast('백업 코드를 먼저 붙여넣어 주세요');return;}
  let d;try{d=Backup.decode(v);}catch(e){alert('백업 코드가 올바르지 않아요. 처음부터 끝까지 빠짐없이 붙여넣었는지 확인해 주세요.');return;}
  if(!confirm(`백업(${d.at?fmtTime(d.at):'날짜 미상'}) 기록으로 바꿀까요?\n본 문제 ${Object.keys(d.seen).length}개 · 오답 ${Object.keys(d.wrong).length}개`))return;
  Backup.apply(d);toast('복원했어요');
  if(Quiz.active())Overlay.close('modal');else leave(viewHome);
 }
};

document.addEventListener('click',e=>{
 const ov=e.target.closest('[data-overlay]');
 if(ov&&e.target===ov){Overlay.close(ov.id);return;}
 const el=e.target.closest('[data-act]');
 if(!el||el.disabled)return;
 const fn=ACTIONS[el.dataset.act];
 if(fn)fn(el.dataset,e);
});
document.addEventListener('input',e=>{
 const k=e.target.dataset.input;
 if(k==='gl-search'){UI.glKw=e.target.value;glossaryList();}
 else if(k==='dict-search')Dict.render();
});
document.addEventListener('change',e=>{
 if(e.target.dataset.change==='instant')Settings.setInstant(e.target.checked);
});
document.addEventListener('keydown',e=>{if(e.key==='Escape')Overlay.closeAll();});
// 휴대폰에서 앱 전환·화면 끄기 직전에 풀던 상태 저장
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden')Quiz.persist();});
window.addEventListener('pagehide',()=>Quiz.persist());

Theme.init();
viewHome();
window.__ctflReady=true;
