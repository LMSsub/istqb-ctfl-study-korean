// 채점과 결과 요약
import {CFG} from './util.js';

export const Grade={
 isMulti:q=>Array.isArray(q.answer),
 answered(q,a){return a!==undefined&&a!==null&&(!Array.isArray(q.answer)||(Array.isArray(a)&&a.length===q.answer.length));},
 isCorrect(q,a){if(!Grade.answered(q,a))return false;return Array.isArray(q.answer)?q.answer.every(x=>a.includes(x)):a===q.answer;},
 isSelected:(a,j)=>Array.isArray(a)?a.includes(j):a===j,
 isKey:(q,j)=>Array.isArray(q.answer)?q.answer.includes(j):q.answer===j,
 fmt(a){if(a===undefined||a===null||(Array.isArray(a)&&!a.length))return '미응답';return [].concat(a).map(x=>CFG.letters[x]).join(', ');},
 passLine:n=>Math.ceil(n*CFG.passRate)
};

export function summarize(c){
 const n=c.qs.length,score=c.qs.filter((q,i)=>Grade.isCorrect(q,c.ans[i])).length,pass=Grade.passLine(n),byCh={};
 c.qs.forEach((q,i)=>{const b=byCh[q.ch]||(byCh[q.ch]={t:0,o:0});b.t++;if(Grade.isCorrect(q,c.ans[i]))b.o++;});
 let weak=null;
 Object.entries(byCh).forEach(([ch,b])=>{const r=b.o/b.t;if(r<1&&(!weak||r<weak.r))weak={c:+ch,r};});
 return {n,score,pass,ok:score>=pass,rate:score/n,byCh,weak};
}

export function verdict(s){
 if(s.ok)return {head:`🎉 ${s.score}점 달성! ${s.pass}점이 합격 라인이에요`,
  sub:s.rate>=0.9?'합격이에요! 실전도 자신 있게 가도 좋아요 💪':'합격이에요! 틀린 문제만 복습하면 더 탄탄해져요.'};
 const gap=s.pass-s.score;
 return {head:`😢 ${s.score}점이에요. 합격 라인은 ${s.pass}점이에요`,
  sub:gap<=3?`아깝다! ${gap}점만 더 맞히면 합격이에요. 조금만 더 힘내요!`:`불합격이에요. ${gap}점이 더 필요해요. 좀 더 열심히 해야 해요!`};
}
