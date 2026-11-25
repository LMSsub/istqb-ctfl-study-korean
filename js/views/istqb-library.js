// 용어집 · 오답 노트
import {CH,LO} from '../../data/syllabus.js';
import {GL} from '../../data/glossary.js';
import {$,esc,render,chOf,CFG} from '../util.js';
import {Bank} from '../bank.js';
import {State} from '../storage.js';
import {srcLong} from '../schema.js';
import {termCard} from './overlays.js';

export const UI={glTab:'all',glKw:''};

export function viewGlossary(){
 render(`<h2 style="margin:0 0 10px">📘 용어 · 실러버스</h2>
 <input class="search" id="kw" data-input="gl-search" placeholder="용어 검색 (예: 경계값, 리뷰, 리스크)" value="${esc(UI.glKw)}">
 <div class="tabs" id="gltabs"></div><div id="gl"></div>
 <button class="btn" data-act="home">← 처음으로</button>`);
 glossaryTabs();glossaryList();
}
export function glossaryTabs(){
 const tabs=[['all','전체'],['1','1장'],['2','2장'],['3','3장'],['4','4장'],['5','5장'],['6','6장'],['toc','📑 목차']];
 $('gltabs').innerHTML=tabs.map(([k,t])=>`<button class="tab ${UI.glTab===k?'on':''}" data-act="gl-tab" data-tab="${k}">${t}</button>`).join('');
}
export function glossaryList(){
 const el=$('gl'),kw=UI.glKw.trim().toLowerCase(),tab=UI.glTab;
 if(tab==='toc'&&!kw){
  let h='',last=0;
  Object.keys(LO).forEach(lo=>{
   const c=chOf(lo);if(c!==last){h+=`<h3 class="toch">${CH[c]}</h3>`;last=c;}
   const n=Bank.countByLo(lo);
   h+=`<button class="toc" data-act="lo" data-lo="${lo}"><span class="toct"><b>FL-${lo}</b> ${esc(LO[lo])}</span><span>${n?n+'문항':'—'}</span></button>`;
  });
  el.innerHTML=h;return;
 }
 const list=GL.filter(g=>(tab==='all'||tab==='toc'||chOf(g[0])===+tab)&&(!kw||(g[0]+g[1]+g[2]).toLowerCase().includes(kw)));
 el.innerHTML=list.length?list.map(termCard).join(''):'<p class="muted">검색 결과가 없어요.</p>';
}

export function viewWrong(){
 const ids=Object.keys(State.wrong);
 const rows=ids.map(id=>{
  const q=Bank.byId(id),g=Bank.genById(id);
  return {id,n:State.wrong[id],
   title:q?q.question.split('\n')[0]:g?'🎲 '+g.name:id,
   lo:q?q.lo:g?g.lo:'',
   src:q?srcLong(q):g?`🎲 자동 생성${g.base?' ('+g.base+' 유형)':''}`:'삭제된 문제'};
 }).sort((x,y)=>x.lo.localeCompare(y.lo));
 render(`<h2 style="margin:0 0 6px">📕 오답 노트</h2>
 <p class="small muted" style="margin:0 0 12px">틀린 문제가 자동으로 쌓여요. 다시 풀어서 맞히면 노트에서 빠져요.</p>
 ${ids.length?`<button class="btn pri wide" data-act="start" data-mode="wrong">🔁 오답 다시 풀기 (${Math.min(ids.length,CFG.maxPool)}문항)</button>
  <div class="box">${rows.map(r=>`<div class="wn"><div>${esc(r.title.length>70?r.title.slice(0,70)+'…':r.title)}<br>
   <small>${r.lo?'FL-'+r.lo+' · ':''}${esc(r.src)} · 틀린 횟수 ${r.n}</small></div>
   <button data-act="wrong-del" data-id="${esc(r.id)}">삭제</button></div>`).join('')}</div>
  <button class="link" data-act="wrong-clear">오답 노트 비우기</button>`
 :'<div class="box">🎉 저장된 오답이 없어요. 문제를 풀면 틀린 문제가 여기에 모여요.</div>'}
 <div><button class="btn" data-act="home">← 처음으로</button></div>`);
}
