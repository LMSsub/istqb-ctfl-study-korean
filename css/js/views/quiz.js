// 문제 풀이 · 결과 화면
import {CH} from '../../data/syllabus.js';
import {$,esc,render,CFG} from '../util.js';
import {Quiz} from '../quiz.js';
import {Grade,summarize,verdict} from '../grade.js';
import {srcShort,srcLong} from '../schema.js';
import {Env} from '../storage.js';
import {loButton} from './overlays.js';

export function updateTimer(left){
 const el=$('timer');if(!el)return;
 const m=Math.floor(left/60000),s=Math.floor(left%60000/1000);
 el.textContent=`⏱ ${m}:${String(s).padStart(2,'0')}`;el.className=left<300000?'warn':'';
}

export function viewQuiz(){
 const c=Quiz.cur,q=c.qs[c.i],n=c.qs.length,a=c.ans[c.i],locked=!!c.lock[c.i],L=CFG.letters;
 const answeredCnt=c.qs.filter((x,j)=>Grade.answered(x,c.ans[j])).length;
 let pill='';
 if(c.instant){
  const lk=c.qs.filter((x,j)=>c.lock[j]).length,ok=c.qs.filter((x,j)=>c.lock[j]&&Grade.isCorrect(x,c.ans[j])).length;
  pill=`<span class="pill">✔ ${ok}/${lk}</span>`;
 }
 const optCls=j=>['opt',Grade.isSelected(a,j)&&'on',locked&&Grade.isKey(q,j)&&'ok',locked&&!Grade.isKey(q,j)&&Grade.isSelected(a,j)&&'ng'].filter(Boolean).join(' ');
 const dotCls=j=>c.instant&&c.lock[j]?(Grade.isCorrect(c.qs[j],c.ans[j])?'g':'r'):(Grade.answered(c.qs[j],c.ans[j])?'ok':'');
 const correct=Grade.isCorrect(q,a),src=srcShort(q);
 const feedback=locked?`<div class="fb ${correct?'o':'x'}"><b>${correct?'⭕ 정답이에요!':`❌ 틀렸어요. 정답은 ${Grade.fmt(q.answer)}예요.`}</b>
  <p>💡 ${esc(q.explanation)}</p>${loButton(q.lo)}</div>`:'';
 render(`<div class="qhead"><span>${esc(Quiz.labelOf(c))}</span>${pill}<span>${c.i+1} / ${n}</span>${c.end?'<span id="timer"></span>':''}</div>
 <div class="bar"><div style="width:${answeredCnt/n*100}%"></div></div>
 <div class="qcard"><div class="tag">${CH[q.ch]} · ${q.level}${src?' · '+src:''}</div>
  <div class="qt">${esc(q.question)}</div>${Grade.isMulti(q)&&!locked?`<p class="hint">※ 정답 ${q.answer.length}개를 고르세요</p>`:''}
  <div class="opts">${q.options.map((t,j)=>`<button class="${optCls(j)}" data-act="choose" data-i="${j}" ${locked?'disabled':''}><b>${L[j]}</b><span>${esc(t)}</span></button>`).join('')}</div>
  ${feedback}</div>
 <div class="nav"><button data-act="move" data-d="-1" ${c.i?'':'disabled'}>← 이전</button>
  ${c.i===n-1?'<button class="pri" data-act="submit">제출하기</button>':'<button class="pri" data-act="move" data-d="1">다음 →</button>'}</div>
 <div class="dots">${c.qs.map((x,j)=>`<button class="dot ${j===c.i?'cur':''} ${dotCls(j)}" data-act="jump" data-i="${j}">${j+1}</button>`).join('')}</div>
 <div class="links"><button class="link" data-act="home">나가기 (나중에 이어 풀기)</button><button class="link" data-act="submit">지금 제출하기</button></div>`,{scroll:false});
 if(c.end)updateTimer(c.end-Date.now());
}

export function viewResult(timeout){
 const c=Quiz.cur,s=summarize(c),v=verdict(s);
 const rows=Object.keys(s.byCh).sort().map(ch=>{const b=s.byCh[ch],r=b.o/b.t;
  return `<div class="row"><span class="lb">${CH[ch]}</span><span class="tr"><div style="width:${r*100}%;background:var(${r>=CFG.passRate?'--g':'--r'})"></div></span><span class="v">${b.o}/${b.t}</span></div>`;}).join('');
 render(`<div class="res ${s.ok?'pass':'fail'}">${timeout?'<p>⏰ 시간 종료로 자동 제출됐어요</p>':''}
  <div class="big">${s.score} / ${s.n}</div><h2>${v.head}</h2><p>${v.sub}</p>
  ${c.mode!=='full'?`<p class="small">실제 시험(40문항) 환산: 약 ${Math.round(s.rate*40)}점 / 합격 26점</p>`:''}
  ${c.added?`<p class="small">📕 틀린 ${c.added}문항이 오답 노트에 저장됐어요.</p>`:''}</div>
 ${Env.warnings().length?`<div class="warnbox"><b>⚠️ 이 화면에서는 기록이 지워질 수 있어요</b>백업 코드를 복사해 두면 나중에 그대로 되살릴 수 있어요.<br><button class="link" data-act="backup">📦 백업 코드 복사하기</button></div>`:''}
 <div class="box"><h3>📊 단원별 정답률</h3>${rows}
  <p class="small" style="margin:10px 0 0">${s.weak?`👉 가장 약한 단원은 <b>${CH[s.weak.c]}</b>(정답률 ${Math.round(s.weak.r*100)}%)이에요.`:'👏 모든 단원을 다 맞혔어요!'}</p></div>
 <div class="acts">
  <button class="btn pri" data-act="start" data-mode="${c.mode}" data-arg="${esc(c.arg||'')}">🔄 새 문제로 다시 풀기</button>
  ${c.added?'<button class="btn" data-act="start" data-mode="wrong">📕 오답만 풀기</button>':''}
  ${s.weak?`<button class="btn" data-act="glossary" data-tab="${s.weak.c}">📘 ${s.weak.c}장 복습</button>`:''}
  <button class="btn" data-act="home">처음으로</button></div>
 <div class="box"><h3>📝 문제 다시 보기</h3>
  <div class="tabs"><button class="tab on" id="fw" data-act="review" data-f="wrong">틀린 문제만</button><button class="tab" id="fa" data-act="review" data-f="all">전체 보기</button></div>
  <div id="rv"></div></div>`);
 viewReview(true);
}

export function viewReview(onlyWrong){
 const c=Quiz.cur,L=CFG.letters;
 $('fw').classList.toggle('on',onlyWrong);$('fa').classList.toggle('on',!onlyWrong);
 const items=c.qs.map((q,i)=>({q,i,a:c.ans[i],ok:Grade.isCorrect(q,c.ans[i])})).filter(x=>!onlyWrong||!x.ok);
 $('rv').innerHTML=items.length?items.map(x=>`<div class="rv ${x.ok?'o':'x'}">
  <div class="tag">${x.i+1}번 · ${CH[x.q.ch]} · ${x.q.level} · ${esc(srcLong(x.q))}</div>
  <div class="qt">${esc(x.q.question)}</div>
  <div class="small" style="margin:6px 0">${x.q.options.map((t,j)=>`<div>${L[j]}. ${esc(t)}</div>`).join('')}</div>
  <div class="ans">${x.ok?'✅':'❌'} 내 답: <b>${Grade.fmt(x.a)}</b> · 정답: <b>${Grade.fmt(x.q.answer)}</b></div>
  <div class="ex">💡 ${esc(x.q.explanation)}</div>${loButton(x.q.lo)}</div>`).join('')
 :'<p>틀린 문제가 없어요! 🎉</p>';
}
