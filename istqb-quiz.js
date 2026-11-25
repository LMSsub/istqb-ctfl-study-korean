// 풀이 진행 (화면 그리기는 views가 담당)
import {Bank} from './bank.js';
import {Grade} from './grade.js';
import {State,save,Progress,Settings,Session} from './storage.js';
import {CFG,shuffle} from './util.js';

export const MODES={
 easy:{label:'난이도 하',instant:true,pick:p=>Bank.leastSeen(p.filter(q=>q.level!=='K3'),10)},
 mid:{label:'난이도 중',instant:true,pick:p=>Bank.leastSeen(p.filter(q=>q.level==='K3'),6).concat(Bank.leastSeen(p.filter(q=>q.level!=='K3'),14))},
 full:{label:'실전 모의고사',instant:false,minutes:CFG.examMinutes,
  pick:p=>Object.entries(CFG.dist).flatMap(([c,n])=>Bank.leastSeen(p.filter(q=>q.ch===+c),n))},
 app:{label:'응용 문제',instant:true,empty:'응용 문제가 없어요.',
  pick:p=>Bank.leastSeen(p.filter(q=>q.source.type!=='sample'),CFG.appCount)},
 wrong:{label:'오답 노트',instant:true,empty:'오답 노트가 비어 있어요!',
  pick:p=>Bank.leastSeen(p.filter(q=>State.wrong[q.id]),CFG.maxPool)},
 lo:{label:'학습목표 집중',instant:true,empty:'이 학습목표에는 아직 문제가 없어요.',
  pick:(p,lo)=>Bank.leastSeen(p.filter(q=>q.lo===lo),CFG.maxPool)}
};

export const Quiz={
 cur:null,timer:null,onTick:null,onTimeout:null,
 active(){return !!this.cur&&!this.cur.done;},
 labelOf(c){return c.mode==='lo'?`FL-${c.arg} 집중`:(MODES[c.mode]||{label:'문제 풀이'}).label;},
 saved(){const s=Session.get();return s&&!s.done&&MODES[s.mode]&&s.qs&&s.qs.length?s:null;},
 persist(){if(this.active())Session.set(this.cur);},

 start(mode,arg){ // 문제가 없으면 안내 문구를 돌려줌
  const m=MODES[mode],picked=m.pick(Bank.pool(),arg);
  if(!picked.length)return m.empty;
  this.stopTimer();
  this.cur={mode,arg:arg||'',qs:shuffle(picked).map(q=>Bank.prepare(q)),ans:{},lock:{},rec:{},i:0,
   end:m.minutes?Date.now()+m.minutes*60000:null,done:false,added:0,instant:Settings.instant&&m.instant};
  this.runTimer();this.persist();return null;
 },
 resume(){ // 'ok' | 'timeout' | 'none'
  const s=this.saved();if(!s){Session.clear();return 'none';}
  s.ans=s.ans||{};s.lock=s.lock||{};s.rec=s.rec||{};this.cur=s;
  if(s.end&&Date.now()>=s.end){this.finish();return 'timeout';}
  this.runTimer();return 'ok';
 },
 choose(j){
  const c=this.cur;if(!this.active()||c.lock[c.i])return;
  const q=c.qs[c.i];
  if(Grade.isMulti(q)){
   let a=c.ans[c.i]||[];
   a=a.includes(j)?a.filter(x=>x!==j):a.length<q.answer.length?[...a,j]:[...a.slice(1),j];
   c.ans[c.i]=a;
  }else c.ans[c.i]=j;
  if(c.instant&&Grade.answered(q,c.ans[c.i])){c.lock[c.i]=true;this.recordAt(c.i);} // 즉시 채점이면 바로 기록
  this.persist();
 },
 recordAt(i){
  const c=this.cur;if(c.rec[i])return;c.rec[i]=true;
  if(Progress.record(c.qs[i].id,Grade.isCorrect(c.qs[i],c.ans[i])))c.added++;
 },
 move(d){const c=this.cur;c.i=Math.max(0,Math.min(c.qs.length-1,c.i+d));this.persist();},
 jump(i){this.cur.i=i;this.persist();},
 unanswered(){const c=this.cur;return c.qs.filter((q,i)=>!Grade.answered(q,c.ans[i])).length;},
 finish(){
  const c=this.cur;this.stopTimer();
  if(!c.done){c.qs.forEach((_,i)=>this.recordAt(i));c.done=true;}
  State.session=null;save();
 },
 runTimer(){this.stopTimer();if(this.cur&&this.cur.end)this.timer=setInterval(()=>this.tick(),1000);},
 tick(){
  const c=this.cur;if(!c||!c.end||c.done)return;
  const left=c.end-Date.now();
  if(left<=0){this.finish();if(this.onTimeout)this.onTimeout();return;}
  if(this.onTick)this.onTick(left);
 },
 stopTimer(){if(this.timer){clearInterval(this.timer);this.timer=null;}},
 pause(){this.stopTimer();this.persist();this.cur=null;},   // 나중에 이어 풀기
 discard(){this.stopTimer();this.cur=null;Session.clear();} // 버리기
};
