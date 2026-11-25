// 팝업: 학습목표 · 용어 사전 · 백업
import {CH,SEC,LO} from '../../data/syllabus.js';
import {GL} from '../../data/glossary.js';
import {DICT} from '../../data/dictionary.js';
import {$,esc,norm,highlight,chOf,toast} from '../util.js';
import {Bank} from '../bank.js';
import {Quiz} from '../quiz.js';
import {State,Backup} from '../storage.js';

export const Overlay={
 open(id){$(id).classList.add('show');document.body.classList.add('no-scroll');if(id==='dict')$('dictFab').hidden=true;},
 close(id){
  $(id).classList.remove('show');
  if(id==='dict')$('dictFab').hidden=false;
  if(!document.querySelector('.modal.show,.dict.show'))document.body.classList.remove('no-scroll');
 },
 closeAll(){this.close('modal');this.close('dict');}
};

export const termCard=g=>`<div class="term"><h4>${esc(g[1])}<button class="sec" data-act="lo" data-lo="${g[0]}">FL-${g[0]}</button></h4><p>${esc(g[2])}</p></div>`;
export const loButton=lo=>`<button class="lo" data-act="lo" data-lo="${lo}">📖 FL-${lo} ${esc(LO[lo]||'')}</button>`;

export const LOModal={
 open(lo){
  const sec=lo.slice(0,3);
  let items=GL.filter(g=>g[0]===lo);
  if(!items.length)items=GL.filter(g=>g[0].startsWith(sec+'.'));
  const cnt=Bank.countByLo(lo),inQuiz=Quiz.active();
  $('modal').innerHTML=`<div class="mbox">
   <div class="mhead"><div><div class="tag">${CH[chOf(lo)]} › ${sec} ${esc(SEC[sec]||'')}</div><h3>FL-${lo} ${esc(LO[lo]||'')}</h3></div>
   <button class="xb" data-act="modal-close" aria-label="닫기">✕</button></div>
   ${items.map(termCard).join('')||'<p>관련 용어가 없어요.</p>'}
   ${inQuiz?'<p class="small muted">닫으면 풀던 문제로 돌아가요.</p>'
    :cnt?`<button class="btn pri wide" data-act="start" data-mode="lo" data-arg="${lo}">🎯 이 학습목표 문제 풀기 (${cnt}문항)</button>`:''}
  </div>`;
  Overlay.open('modal');
 }
};

export const Dict={
 cat:'전체',
 cats:['전체',...new Set(DICT.map(d=>d[0]))],
 open(){Overlay.open('dict');this.render();if(window.innerWidth>600)setTimeout(()=>$('dq').focus(),60);},
 render(){
  const kw=$('dq').value.trim(),nk=norm(kw);
  $('dchips').innerHTML=this.cats.map(c=>`<button class="tab ${c===this.cat?'on':''}" data-act="dict-cat" data-cat="${esc(c)}">${esc(c)}</button>`).join('');
  let list=DICT.filter(d=>this.cat==='전체'||d[0]===this.cat);
  if(nk){
   const head=d=>norm(d[1]+d[2]+d[3]).includes(nk)?0:1;
   list=list.filter(d=>norm(d.join(' ')).includes(nk)).sort((x,y)=>head(x)-head(y));
  }
  $('dcount').textContent=nk?`“${kw}” 검색 결과 ${list.length}개`:`${this.cat} · ${list.length}개 용어`;
  $('dlist').innerHTML=list.length
   ?list.map(d=>`<div class="dterm"><h4>${highlight(d[1],kw)}<span class="en">${highlight(d[2],kw)}</span><span class="cat">${esc(d[0])}</span></h4>
     <p>${highlight(d[4],kw)}</p>${d[5]?`<div class="dex">예) ${highlight(d[5],kw)}</div>`:''}</div>`).join('')
   :`<div class="dempty">“${esc(kw)}”와 관련된 용어가 없어요.<br>다른 표현으로 검색해 보세요. (예: 버그 → 결함)</div>`;
  $('dlist').scrollTop=0;
 }
};

export const BackupModal={
 open(){
  $('modal').innerHTML=`<div class="mbox">
   <div class="mhead"><div><h3>📦 기록 백업 · 복원</h3>
    <p class="small muted" style="margin:4px 0 0">본 문제 ${Object.keys(State.seen).length}개 · 오답 ${Object.keys(State.wrong).length}개</p></div>
   <button class="xb" data-act="modal-close" aria-label="닫기">✕</button></div>
   <p class="small">기록이 지워질 때를 대비하거나 다른 기기로 옮길 때 써요. 코드를 메모장이나 카톡 “나에게 보내기”에 보관해 두세요.</p>
   <h4 class="bh">① 백업 코드</h4>
   <textarea id="bkout" class="code">${esc(Backup.encode())}</textarea>
   <button class="btn pri wide" data-act="bk-copy">📋 백업 코드 복사</button>
   <h4 class="bh">② 복원하기</h4>
   <textarea id="bkin" class="code" placeholder="CTFL- 로 시작하는 백업 코드를 붙여넣으세요"></textarea>
   <button class="btn wide" data-act="bk-restore">⬆️ 이 코드로 복원</button>
   <p class="small muted">복원하면 이 기기의 기록이 백업 코드 내용으로 바뀌어요.</p>
  </div>`;
  Overlay.open('modal');
 },
 async copy(){
  const ta=$('bkout');if(!ta)return;const t=ta.value;
  try{if(navigator.clipboard&&window.isSecureContext){await navigator.clipboard.writeText(t);toast('📋 복사했어요. 메모장 등에 붙여넣어 두세요');return;}}catch(e){}
  ta.focus();ta.select();try{ta.setSelectionRange(0,t.length);}catch(e){}
  let ok=false;try{ok=document.execCommand('copy');}catch(e){}
  toast(ok?'📋 복사했어요. 메모장 등에 붙여넣어 두세요':'코드를 길게 눌러 전체 선택 후 직접 복사해 주세요');
 }
};
