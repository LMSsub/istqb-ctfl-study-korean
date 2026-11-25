// 기존 계산 문제 6종. 생성기 형식: { id, lo, k, base(바탕 기출), name, make() → {q, ans, wrongs, e} | null }
import {rand,num,usd} from '../util.js';

export const BASIC=[
 {id:'G-BVA',lo:'4.2.2',k:'K3',base:'A-A15',name:'경계값 분석 계산',make(){
  const lo=rand(1,60),hi=lo+rand(6,40),v3=Math.random()<.5;
  const two=[lo-1,lo,hi,hi+1].join(', '),three=[lo-2,lo-1,lo,lo+1,hi-1,hi,hi+1,hi+2].join(', ');
  return {
   q:`입력 필드는 ${lo} 이상 ${hi} 이하의 정수만 허용하고, 그 밖의 값은 거부한다.\n\n${v3?'3값':'2값'} 경계값 분석으로 100% 커버리지를 달성하기 위한 테스트 값으로 올바른 것은?`,
   ans:v3?three:two,
   wrongs:v3?[two,[lo-1,lo,lo+1,hi-1,hi,hi+1].join(', '),[lo,lo+1,hi-1,hi].join(', ')]
            :[[lo,hi].join(', '),three,[lo-1,lo+1,hi-1,hi+1].join(', ')],
   e:`분할은 {…${lo-1}}, {${lo}…${hi}}, {${hi+1}…}이고 경계값은 ${lo-1}, ${lo}, ${hi}, ${hi+1}이에요. `+
     (v3?`3값 BVA는 각 경계값과 그 양옆 값을 모두 테스트하므로 ${three}이에요.`:`2값 BVA는 각 경계값과 인접 분할의 가장 가까운 값이므로 ${two}이에요.`)
  };}},
 {id:'G-EP',lo:'4.2.1',k:'K3',base:'D-20',name:'동등 분할 개수',make(){
  const names=['무료','어린이 요금','청소년 요금','성인 요금','경로 요금'],t=rand(3,5),lines=[];let st=0;
  for(let i=0;i<t;i++){
   if(i===t-1)lines.push(`${st}세 이상: ${names[i]}`);
   else{const en=st+rand(3,12);lines.push(`${st}~${en}세: ${names[i]}`);st=en+1;}
  }
  return {
   q:`놀이공원 요금은 나이(정수)에 따라 정해진다.\n\n${lines.join('\n')}\n음수 나이: 오류 메시지 표시\n\n동등 분할로 유효·무효 분할을 모두 커버하기 위한 최소 테스트 케이스 수는?`,
   ans:`${t+1}개`,wrongs:[`${t}개`,`${t+2}개`,`${t*2}개`],
   e:`유효 분할 ${t}개(요금 구간)와 무효 분할 1개(음수)로 총 ${t+1}개예요. 변수가 하나라 테스트 1개가 분할 1개만 커버해요.`
  };}},
 {id:'G-STMT',lo:'4.3.1',k:'K2',base:'B-24',name:'구문 커버리지 겹침',make(){
  const x=rand(35,80),y=rand(Math.max(101-x,20),95);
  return {
   q:`같은 코드를 대상으로 테스트 T1은 ${x}%, 테스트 T2는 ${y}%의 구문 커버리지를 달성했다.\n\nT1과 T2가 모두 실행한 구문은 전체 구문의 최소 몇 %인가?`,
   ans:`${x+y-100}%`,wrongs:[`${Math.abs(x-y)}%`,`${100-x}%`,`${100-y}%`,'알 수 없다'],
   e:`두 커버리지의 합은 ${x+y}%인데 전체는 100%를 넘을 수 없어요. 따라서 최소 ${x+y-100}%는 두 테스트가 함께 실행한 구문이에요.`
  };}},
 {id:'G-3PT',lo:'5.1.4',k:'K3',base:'A-32',name:'3점 추정',make(){
  let a,m,b;do{a=rand(2,10);m=a+rand(1,6);b=m+rand(3,15);}while((a+4*m+b)%6!==0);
  const E=(a+4*m+b)/6;
  return {
   q:`3점 추정 기법으로 테스트 노력을 추정한다.\n\n낙관치 = ${a}인일, 최빈치 = ${m}인일, 비관치 = ${b}인일\n\n추정치(E)는?`,
   ans:`${E}인일`,wrongs:[`${num((a+m+b)/3)}인일`,`${m}인일`,`${num((a+b)/2)}인일`],
   e:`E = (낙관치 + 4×최빈치 + 비관치) / 6 = (${a} + 4×${m} + ${b}) / 6 = ${E}인일. 표준편차는 (비관치 − 낙관치) / 6 = ${num((b-a)/6)}이에요.`
  };}},
 {id:'G-EXT',lo:'5.1.4',k:'K3',base:'',name:'외삽법 추정',make(){
  const A=[rand(4,15),rand(4,15),rand(4,15),rand(4,15)],ans=(3*A[3]+A[2])/4;
  return {
   q:`팀은 다음 외삽법 모델로 반복주기별 작업량(M/D)을 추정한다.\n\nE(n) = (3 × A(n−1) + A(n−2)) / 4\n(E: 예상 작업량, A: 실제 작업량)\n\n실제 작업량: A(1)=${A[0]}, A(2)=${A[1]}, A(3)=${A[2]}, A(4)=${A[3]}\n\n반복주기 #5의 예상 작업량은?`,
   ans:`${num(ans)} M/D`,wrongs:[`${num((A[2]+A[3])/2)} M/D`,`${num((3*A[2]+A[3])/4)} M/D`,`${num((A[0]+A[1]+A[2]+A[3])/4)} M/D`],
   e:`E(5) = (3 × A(4) + A(3)) / 4 = (3 × ${A[3]} + ${A[2]}) / 4 = ${num(ans)} M/D예요. A(4)에 가중치 3이 붙어요.`
  };}},
 {id:'G-RATIO',lo:'5.1.4',k:'K3',base:'B-31',name:'비율 기반 추정',make(){
  const r=[0.1,0.15,0.2,0.25][rand(0,3)],d=[rand(4,12)*1e5,rand(4,12)*1e5,rand(4,12)*1e5],sum=d[0]+d[1]+d[2];
  const t1=Math.round(d[0]*r*(0.6+Math.random()*0.8)/1e4)*1e4,t2=Math.round(d[1]*r*(0.6+Math.random()*0.8)/1e4)*1e4,t3=Math.round(sum*r)-t1-t2;
  if(t1<=0||t2<=0||t3<=0)return null;
  const nd=rand(5,15)*1e5,ans=nd*r;
  return {
   q:`비율 기반 추정으로 새 프로젝트의 테스트 노력을 추정한다. 유사한 과거 프로젝트 데이터는 다음과 같다.\n\nP1: 개발 ${usd(d[0])} / 테스트 ${usd(t1)}\nP2: 개발 ${usd(d[1])} / 테스트 ${usd(t2)}\nP3: 개발 ${usd(d[2])} / 테스트 ${usd(t3)}\n\n새 프로젝트의 예상 개발 노력은 ${usd(nd)}이다. 예상 테스트 노력은?`,
   ans:usd(ans),wrongs:[usd((t1+t2+t3)/3),usd(nd*(r===0.1?0.2:0.1)),usd(nd*(r+0.05))],
   e:`평균 개발 노력 ${usd(sum/3)}, 평균 테스트 노력 ${usd((t1+t2+t3)/3)} → 비율 ${r*100}%. ${usd(nd)} × ${r*100}% = ${usd(ans)}예요.`
  };}}
];
