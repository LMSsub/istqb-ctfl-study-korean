// 데이터 형식 통일: 예전 배열 형식과 새 객체 형식을 모두 같은 모양으로 바꿈
import {CFG,chOf} from './util.js';
const L=CFG.letters;

// 예전 해설의 "a·d는" 같은 보기 글자를 {a}{d} 자리표시자로 변환 (보기를 섞어도 글자가 맞게 바뀜)
const toPlaceholder=(e,n)=>e.replace(/(^|[^A-Za-z0-9{])([a-e])(?![A-Za-z0-9}])/g,(m,p,l)=>L.indexOf(l)<n?`${p}{${l}}`:m);
const finalize=q=>({...q,ch:chOf(q.lo)});

/* 내부 문제 형식
 { id, level:'K1~K3', lo:'4.2.2', ch:4, question, options:[문자열], answer: 번호 또는 [번호…],
   explanation(보기는 {a} 형태), source:{ type:'sample'|'variant'|'generated', base:'A-14' } } */
export function normalize(r,type){
 if(Array.isArray(r)){
  const [id,level,lo,question,options,answer,explanation,base]=r;
  return finalize({id,level,lo,question,options,answer,explanation:toPlaceholder(explanation,options.length),
   source:base?{type:'variant',base}:{type}});
 }
 // 새 객체 형식: 정답은 보기 글자('b') 또는 배열(['a','c'])
 const answer=[].concat(r.answer).map(a=>typeof a==='number'?a:L.indexOf(a));
 return finalize({id:r.id,level:r.level,lo:r.lo,question:r.question,
  options:r.options.map(o=>typeof o==='string'?o:o.text),
  answer:Array.isArray(r.answer)?answer:answer[0],
  explanation:r.explanation,source:r.source||{type}});
}

export function fromGenerated(g,r,options){
 return finalize({id:g.id,level:g.k,lo:g.lo,question:r.q,options,answer:0,explanation:r.e,source:{type:'generated',base:g.base||''}});
}

export const srcShort=q=>q.source.type==='generated'?`🎲 ${q.source.base?q.source.base+' 유형':'계산'}`
 :q.source.type==='variant'?`🧩 ${q.source.base} 변형`:'';
export const srcLong=q=>q.source.type==='generated'?`🎲 자동 생성${q.source.base?' ('+q.source.base+' 유형)':''}`
 :q.source.type==='variant'?`🧩 응용 (${q.source.base} 변형)`:`샘플 ${q.id}`;
