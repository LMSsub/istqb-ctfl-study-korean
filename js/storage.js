// 저장 · 백업 · 실행 환경 점검
const KEY='ctfl_state';
const OLD={seen:'ctfl_seen_v2',wrong:'ctfl_wrong_v1',instant:'ctfl_instant',theme:'ctfl_theme'};
const mem={};

export const canStore=(()=>{try{const t='__ctfl_test__';localStorage.setItem(t,'1');const ok=localStorage.getItem(t)==='1';localStorage.removeItem(t);return ok;}catch(e){return false;}})();
function read(k){
 if(canStore){try{const v=localStorage.getItem(k);if(v!==null)return JSON.parse(v);}catch(e){}}
 return k in mem?mem[k]:null;
}
function write(k,v){mem[k]=v;if(!canStore)return false;try{localStorage.setItem(k,JSON.stringify(v));return true;}catch(e){return false;}}

// 저장 구조를 하나로 통합. 예전 키가 있으면 자동으로 옮겨 옴(예전 키는 지우지 않음)
function load(){
 const s=read(KEY)||{v:1,seen:read(OLD.seen)||{},wrong:read(OLD.wrong)||{},
  settings:{instant:!!read(OLD.instant),theme:read(OLD.theme)},session:null,savedAt:null};
 s.seen=s.seen||{};s.wrong=s.wrong||{};s.settings=s.settings||{};if(s.session===undefined)s.session=null;
 return s;
}
export const State=load();
export function save(){State.savedAt=Date.now();return write(KEY,State);}

// 브라우저가 저장소를 임의로 지우지 않도록 요청 (지원 브라우저만)
try{if(canStore&&navigator.storage&&navigator.storage.persist)navigator.storage.persisted().then(p=>p||navigator.storage.persist()).catch(()=>{});}catch(e){}

export const Progress={
 record(id,correct){
  State.seen[id]=(State.seen[id]||0)+1;
  if(correct){delete State.wrong[id];return false;}
  State.wrong[id]=(State.wrong[id]||0)+1;return true;
 },
 removeWrong(id){delete State.wrong[id];save();},
 clearWrong(){State.wrong={};save();},
 clearSeen(){State.seen={};save();}
};
export const Settings={
 get instant(){return !!State.settings.instant;},
 setInstant(v){State.settings.instant=!!v;save();},
 get theme(){return State.settings.theme||null;},
 setTheme(t){State.settings.theme=t;save();}
};
export const Session={
 get(){return State.session;},
 set(c){State.session=c;save();},
 clear(){if(State.session){State.session=null;save();}}
};

const UA=navigator.userAgent||'';
export const Env={
 mobile:/Android|iPhone|iPad|iPod/i.test(UA)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1),
 inApp:/KAKAOTALK|NAVER\(inapp|Instagram|FBAN|FBAV|Line\//i.test(UA),
 embedded:(()=>{try{return window.self!==window.top;}catch(e){return true;}})(),
 local:/^(file|content|blob):$/.test(location.protocol),
 warnings(){
  const w=[];
  if(!canStore)w.push('이 브라우저는 저장 기능이 막혀 있어요(사생활 보호 모드 등). 지금 푼 기록은 창을 닫으면 사라져요.');
  else if(this.embedded&&this.mobile)w.push('노션처럼 다른 페이지 안에 넣어진 화면에서는 휴대폰 기록이 지워질 수 있어요. 새 창에서 열어 주세요.');
  else if(this.inApp)w.push('카카오톡·네이버 같은 앱 안의 브라우저는 기록이 자주 지워져요. 메뉴에서 “다른 브라우저로 열기”를 눌러 주세요.');
  else if(this.mobile&&this.local)w.push('휴대폰에서 파일을 직접 열면 기록이 초기화될 수 있어요. 웹 주소로 접속해 주세요.');
  return w;
 }
};

export const Backup={
 encode(){
  const d={v:1,at:Date.now(),seen:State.seen,wrong:State.wrong,settings:{instant:!!State.settings.instant}};
  return 'CTFL-'+btoa(unescape(encodeURIComponent(JSON.stringify(d))));
 },
 decode(code){
  const s=String(code).trim().replace(/^CTFL-/,'').replace(/\s+/g,'');
  const d=JSON.parse(decodeURIComponent(escape(atob(s))));
  if(!d||typeof d.seen!=='object'||typeof d.wrong!=='object')throw new Error('형식 오류');
  return d;
 },
 apply(d){
  State.seen=d.seen||{};State.wrong=d.wrong||{};
  if(d.settings&&typeof d.settings.instant==='boolean')State.settings.instant=d.settings.instant;
  save();
 }
};
