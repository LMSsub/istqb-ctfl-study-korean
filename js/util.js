// 설정과 공통 함수
export const CFG={passRate:0.65,examMinutes:60,maxPool:20,appCount:15,letters:'abcde',dist:{1:8,2:6,3:4,4:11,5:9,6:2}};

export const $=id=>document.getElementById(id);
export const esc=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
export const shuffle=arr=>{const a=arr.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};
export const rand=(a,b)=>a+Math.floor(Math.random()*(b-a+1));
export const num=x=>Number.isInteger(x)?String(x):String(Math.round(x*100)/100);
export const pct=x=>(Math.round(x*1000)/10)+'%';
export const usd=x=>'$'+Math.round(x).toLocaleString('en-US');
export const norm=s=>String(s).toLowerCase().replace(/\s+/g,'');
export const chOf=lo=>+String(lo)[0];
export const fmtTime=t=>new Date(t).toLocaleString('ko-KR',{month:'numeric',day:'numeric',hour:'2-digit',minute:'2-digit'});

export function highlight(text,kw){
 const t=esc(text);if(!kw)return t;
 const k=esc(kw).replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
 return t.replace(new RegExp('('+k+')','gi'),'<mark>$1</mark>');
}
export function render(html,{scroll=true}={}){$('app').innerHTML=html;if(scroll)window.scrollTo(0,0);}

let toastTimer=null;
export function toast(msg){
 let el=$('toast');
 if(!el){el=document.createElement('div');el.id='toast';el.className='toast';document.body.appendChild(el);}
 el.textContent=msg;el.classList.add('show');
 clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove('show'),2200);
}
