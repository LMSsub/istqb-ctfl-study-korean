// 홈 화면
import {render,esc,fmtTime,CFG} from '../util.js';
import {Bank} from '../bank.js';
import {Quiz} from '../quiz.js';
import {Grade} from '../grade.js';
import {State,Settings,Env,canStore} from '../storage.js';

const card=(attrs,ic,t,d)=>`<button class="card" ${attrs}><div class="ic">${ic}</div><h3>${t}</h3><p>${d}</p></button>`;

function warnBoxes(){
 return Env.warnings().map(w=>`<div class="warnbox"><b>⚠️ 기록 저장 주의</b>${esc(w)}<br>
  ${Env.embedded?`<a href="${esc(location.href)}" target="_blank" rel="noopener">↗ 새 창에서 열기</a> · `:''}
  <button class="link" data-act="backup">📦 백업 코드로 기록 지키기</button></div>`).join('');
}
function resumeBox(){
 const s=Quiz.saved();if(!s)return '';
 const done=s.qs.filter((q,j)=>Grade.answered(q,s.ans[j])).length;
 const left=s.end?` · 남은 시간 약 ${Math.max(0,Math.ceil((s.end-Date.now())/60000))}분`:'';
 return `<div class="box resume"><b>⏸ 풀던 문제가 있어요</b>
  <p class="small muted" style="margin:4px 0 0">${esc(Quiz.labelOf(s))} · ${done}/${s.qs.length}문항 풀이${left}</p>
  <div class="acts"><button class="btn pri" data-act="resume">▶ 이어서 풀기</button><button class="btn" data-act="discard">버리기</button></div></div>`;
}

export function viewHome(){
 const seen=Bank.static.filter(q=>State.seen[q.id]).length,wc=Object.keys(State.wrong).length;
 const varCnt=Bank.static.filter(q=>q.source.type==='variant').length;
 const save=canStore?(State.savedAt?`이 기기에 자동 저장 중 · 마지막 저장 ${fmtTime(State.savedAt)}`:'이 기기에 자동 저장돼요'):'⚠️ 저장이 안 되는 환경이에요';
 render(`<section class="hero"><h2>CTFL 4.0 합격 준비</h2><p>실제 시험: 40문항 · 60분 · 26점(65%) 이상 합격</p></section>
 ${warnBoxes()}${resumeBox()}
 <div class="grid">
  ${card('data-act="glossary"','📘','용어 · 실러버스','핵심 개념과 학습목표 목차')}
  ${card('data-act="start" data-mode="easy"','🌱','난이도 하',`개념 문제 10개<br>${Grade.passLine(10)}점 이상 합격`)}
  ${card('data-act="start" data-mode="mid"','🔥','난이도 중',`계산 포함 20개<br>${Grade.passLine(20)}점 이상 합격`)}
  ${card('data-act="start" data-mode="app"','🧩','응용 문제',`기출 변형 + 계산 ${CFG.appCount}개<br>${Grade.passLine(CFG.appCount)}점 이상 합격`)}
  ${card('data-act="start" data-mode="full"','🏆','실전 모의고사',`40문항 · 60분<br>${Grade.passLine(40)}점 이상 합격`)}
  ${card('data-act="wrong-view"','📕','오답 노트',wc?`저장된 오답 ${wc}문항`:'아직 비어 있어요')}
 </div>
 <div class="box"><div class="setrow"><div><b>⚡ 즉시 채점 모드</b><p>답을 고르면 바로 정답과 해설을 보여주고 기록도 바로 저장돼요. 실전 모의고사는 항상 마지막에 채점해요.</p></div>
  <label class="sw"><input type="checkbox" data-change="instant" ${Settings.instant?'checked':''}><span></span></label></div></div>
 <div class="box small">🔁 지금까지 본 문제 <b>${seen} / ${Bank.static.length}</b> · 적게 나온 문제부터 출제돼요. 보기 순서는 매번 바뀌고, 🎲 계산 문제는 숫자가 새로 만들어져요.
  <br>💾 ${save}
  <div class="links"><button class="link" data-act="backup">📦 기록 백업 · 복원</button><button class="link" data-act="seen-reset">출제 기록 초기화</button></div></div>
 <p class="src">문제 출처: ISTQB® CTFL v4.0 Sample Exam A(추가 문제 포함)·B·D (KSTQB 번역본) + 기출 변형 ${varCnt}문항 + 자동 생성 ${Bank.generators.length}종<br>해설과 용어 정의는 학습용으로 요약한 것입니다.</p>`);
}
