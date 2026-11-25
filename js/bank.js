// 문제 은행: 기출 + 응용 + 자동 생성
import {RAW} from '../data/samples.js';
import {VAR} from '../data/variants.js';
import {GENERATORS} from './generators/index.js';
import {normalize,fromGenerated} from './schema.js';
import {State} from './storage.js';
import {CFG,shuffle} from './util.js';

const STATIC=[...RAW.map(r=>normalize(r,'sample')),...VAR.map(r=>normalize(r,'variant'))];

function generate(g){
 for(let t=0;t<30;t++){
  let r=null;try{r=g.make();}catch(e){console.warn(g.id,e);}
  if(!r)continue;
  const o=[r.ans];r.wrongs.forEach(w=>{if(!o.includes(w))o.push(w);});
  if(o.length>=4)return fromGenerated(g,r,o.slice(0,4));
 }
 return null;
}

export const Bank={
 static:STATIC,generators:GENERATORS,generate,
 pool(){return STATIC.concat(GENERATORS.map(generate).filter(Boolean));},
 byId(id){return STATIC.find(q=>q.id===id)||null;},
 genById(id){return GENERATORS.find(g=>g.id===id)||null;},
 countByLo(lo){return STATIC.filter(q=>q.lo===lo).length+GENERATORS.filter(g=>g.lo===lo).length;},
 leastSeen(list,n){return shuffle(list).sort((x,y)=>(State.seen[x.id]||0)-(State.seen[y.id]||0)).slice(0,n);},
 // 보기 순서를 섞고 정답·해설의 보기 글자를 맞춰 바꿈
 prepare(q){
  const L=CFG.letters,p=shuffle(q.options.map((_,i)=>i)),inv={};
  p.forEach((orig,pos)=>{inv[orig]=pos;});
  return {...q,
   options:p.map(i=>q.options[i]),
   answer:Array.isArray(q.answer)?q.answer.map(x=>inv[x]).sort((x,y)=>x-y):inv[q.answer],
   explanation:q.explanation.replace(/\{([a-e])\}/g,(m,l)=>{const o=L.indexOf(l);return o<q.options.length?L[inv[o]]:l;})
  };
 }
};
