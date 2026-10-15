(function(){
"use strict";
var G=330, W=480, H=360, RAD=Math.PI/180;
var L={torso:56,head:20,up:30,fore:28,thigh:42,shin:42};
var NUM=["t","h","a1","b1","a2","b2","l1","m1","l2","m2","air","dx"];
var ZERO={t:0,h:0,a1:0,b1:0,a2:0,b2:0,l1:0,m1:0,l2:0,m2:0,air:0,dx:0};
var PIN={head:"#2f6bff",hip:"#e5383b",w1:"#ff8a1f",w2:"#ffd21f",e:"#8a3ffc",k:"#ff5fa2",f:"#ff5fa2"};

var ANIMS={
 "form-shooting":{view:"side",hx:200,hoop:true,
  desc:"Tir à une main : le ballon repose sur la main, le coude est à 90° sous le ballon, le bras s'étend vers le haut, le poignet claque, puis le ballon part vers le panier.",
  base:{t:6,l1:16,m1:-9,l2:-6,m2:-14,a2:40,b2:150},
  keys:[
   {d:650,a1:78,b1:175,ball:{b:"w1",dy:-13}},
   {d:380,t:2,a1:150,b1:152,a2:120,b2:150,l1:4,m1:-2,l2:-8,m2:-10,air:4,ball:{b:"w1",dy:-13}},
   {d:520,t:0,a1:152,b1:118,a2:110,b2:140,l1:2,m1:0,l2:-8,m2:-10,air:6,ball:{b:"w1",dx:22,dy:-34}},
   {d:560,a1:150,b1:110,a2:60,b2:100,l1:8,m1:-4,l2:-6,m2:-12,air:2,ball:{x:330,y:20}},
   {d:520,a1:90,b1:60,a2:50,b2:70,ball:{x:420,y:78}},
   {d:350,a1:30,b1:50,a2:20,b2:40,ball:null}
  ]},
 "mikan":{view:"side",hx:330,hoop:true,
  desc:"Mikan drill : on récupère le ballon sous le panier, on monte genou levé vers la planche, on dépose le ballon, on retombe et on le rattrape pour repartir de l'autre côté.",
  base:{},
  keys:[
   {d:500,dx:-70,t:14,a1:30,b1:150,a2:55,b2:130,l1:24,m1:-14,l2:-12,m2:-24,ball:{b:"w1",dx:6,dy:-8}},
   {d:380,dx:-35,t:10,a1:140,b1:150,a2:100,b2:130,l1:85,m1:8,l2:-12,m2:-14,air:55,ball:{b:"w1",dy:-12}},
   {d:320,dx:0,t:-2,a1:165,b1:170,a2:120,b2:150,l1:70,m1:-4,l2:-6,m2:-12,air:90,ball:{x:432,y:40}},
   {d:420,dx:12,t:4,a1:120,b1:150,a2:80,b2:120,l1:22,m1:-10,l2:-10,m2:-18,air:35,ball:{x:420,y:100}},
   {d:420,dx:-25,t:16,a1:150,b1:160,a2:100,b2:140,l1:28,m1:-16,l2:-14,m2:-28,ball:{b:"w1",dy:-10}}
  ]},
 "slide":{view:"front",hx:240,scroll:150,
  desc:"Glissé défensif vu de face : appuis larges et bas, mains actives. Le pied avant se pose, le pied arrière pousse puis rejoint, sans jamais croiser les pieds.",
  base:{a1:-62,b1:-115,a2:62,b2:115,l1:-34,m1:-4,l2:34,m2:4},
  keys:[
   {d:300},
   {d:260,t:-3,l1:-48,m1:-62,l2:40,m2:40},
   {d:260,l1:-40,m1:-6,l2:22,m2:10}
  ]},
 "stationary":{view:"side",hx:200,
  desc:"Dribble statique : position basse, buste penché, tête haute. Le bras pousse le ballon vers le sol puis le rattrape au bout des doigts, sans le regarder.",
  base:{t:14,h:-8,l1:30,m1:-16,l2:-10,m2:-34,a2:80,b2:110},
  keys:[
   {d:280,a1:28,b1:18,ball:{b:"w1",y:318}},
   {d:280,a1:40,b1:75,ball:{b:"w1",dy:12}}
  ]},
 "box-jump":{view:"side",hx:240,
  desc:"Saut explosif : debout, flexion profonde avec les bras en arrière, extension complète avec les bras qui montent, puis réception amortie.",
  base:{},
  keys:[
   {d:500,t:2,a1:18,b1:24,a2:-20,b2:-28,l1:2,l2:-8,m2:-8},
   {d:420,t:35,h:-10,a1:-62,b1:-42,a2:-48,b2:-30,l1:75,m1:-46,l2:78,m2:-44},
   {d:300,t:-2,a1:170,b1:172,a2:156,b2:160,l1:3,l2:-6,m2:-8,air:70},
   {d:420,t:25,h:-5,a1:70,b1:62,a2:56,b2:48,l1:58,m1:-36,l2:60,m2:-34}
  ]}
};
Object.keys(ANIMS).forEach(function(id){
  var A=ANIMS[id]; A.total=0;
  A.keys=A.keys.map(function(k){ var o={}; NUM.forEach(function(n){ o[n]=(k[n]!=null?k[n]:(A.base[n]!=null?A.base[n]:ZERO[n])); }); o.d=k.d; o.ball=k.ball===undefined?null:k.ball; A.total+=k.d; return o; });
});

function dir(a){ return [Math.sin(a*RAD), Math.cos(a*RAD)]; }
function limb(o,A,B,l1,l2){ var d1=dir(A), e=[o[0]+d1[0]*l1,o[1]+d1[1]*l1], d2=dir(B); return [e,[e[0]+d2[0]*l2,e[1]+d2[1]*l2]]; }
function solve(p,hx){
  var hip=[0,0], up=[Math.sin(p.t*RAD),-Math.cos(p.t*RAD)], neck=[up[0]*L.torso,up[1]*L.torso];
  var hd=[Math.sin((p.t+p.h)*RAD),-Math.cos((p.t+p.h)*RAD)], head=[neck[0]+hd[0]*L.head,neck[1]+hd[1]*L.head];
  var a=limb(neck,p.a1,p.b1,L.up,L.fore), b=limb(neck,p.a2,p.b2,L.up,L.fore), c=limb(hip,p.l1,p.m1,L.thigh,L.shin), d=limb(hip,p.l2,p.m2,L.thigh,L.shin);
  var low=Math.max(c[1][1],d[1][1]), oy=G-low-p.air, ox=hx+p.dx;
  function T(q){ return [q[0]+ox,q[1]+oy]; }
  return {hip:T(hip),neck:T(neck),head:T(head),e1:T(a[0]),w1:T(a[1]),e2:T(b[0]),w2:T(b[1]),k1:T(c[0]),f1:T(c[1]),k2:T(d[0]),f2:T(d[1])};
}
function ease(u){ return 0.5-0.5*Math.cos(Math.PI*u); }
function lerp(a,b,u){ return a+(b-a)*u; }
function at(A,time){
  var t=((time%A.total)+A.total)%A.total, i=0, c=0;
  while(i<A.keys.length-1 && t>=c+A.keys[i].d){ c+=A.keys[i].d; i++; }
  var k0=A.keys[i], k1=A.keys[(i+1)%A.keys.length], u=(t-c)/k0.d, e=ease(u), p={};
  NUM.forEach(function(n){ p[n]=lerp(k0[n],k1[n],e); });
  return {p:p,i:i,u:u,e:e,k0:k0,k1:k1,prog:t/A.total};
}
function resolveBall(s,J){
  if(!s) return null;
  if(s.b){ var q=J[s.b]; return [q[0]+(s.dx||0), s.y!=null?s.y:q[1]+(s.dy||0)]; }
  return [s.x,s.y];
}
function ballAt(st,J){
  var a=resolveBall(st.k0.ball,J), b=resolveBall(st.k1.ball,J);
  if(a&&b) return [lerp(a[0],b[0],st.e),lerp(a[1],b[1],st.e)];
  if(a&&!b) return st.u<0.3?a:null;
  if(!a&&b) return st.u>0.7?b:null;
  return null;
}
function pts(a){ return a.map(function(p){ return p[0].toFixed(1)+","+p[1].toFixed(1); }).join(" "); }
function two(arr,cls){ var s=pts(arr); return '<polyline class="'+cls+' l2" points="'+s+'" transform="translate(.9 .7)"/><polyline class="'+cls+'" points="'+s+'"/>'; }
function stick(J,front,ghost){
  var far=front?"":" far", g=ghost?" gh":"", out="";
  function pl(a,c){ return ghost?'<polyline class="ln'+g+'" points="'+pts(a)+'"/>':two(a,"ln"+c); }
  function foot(f,sgn){ var a=front?[[f[0]-6*sgn,f[1]],[f[0]+6*sgn,f[1]]]:[f,[f[0]+11,f[1]]]; return pl(a,""); }
  out+=pl([J.hip,J.k2,J.f2],far)+pl([J.neck,J.e2,J.w2],far);
  out+=foot(J.f2,1);
  out+=pl([J.hip,J.neck],"")+'<circle class="ln'+g+'" cx="'+J.head[0].toFixed(1)+'" cy="'+J.head[1].toFixed(1)+'" r="12" fill="none"/>';
  out+=pl([J.hip,J.k1,J.f1],"")+pl([J.neck,J.e1,J.w1],"");
  out+=foot(J.f1,1);
  return out;
}
function pin(c,p,r){ return '<circle class="pin" cx="'+p[0].toFixed(1)+'" cy="'+p[1].toFixed(1)+'" r="'+r+'" fill="'+c+'"/>'; }
function pins(J){
  return pin(PIN.head,J.head,6.5)+pin(PIN.hip,J.hip,6.5)+pin(PIN.e,J.e2,6.5)+pin(PIN.k,J.k2,6.5)+pin(PIN.f,J.f2,7)+pin(PIN.w2,J.w2,7.5)+pin(PIN.e,J.e1,5)+pin(PIN.k,J.k1,5)+pin(PIN.f,J.f1,5.5)+pin(PIN.w1,J.w1,5.5);
}
function ballSvg(b){
  var x=b[0].toFixed(1), y=b[1].toFixed(1);
  return '<g transform="translate('+x+' '+y+')"><circle r="11" fill="#ff8a1f" stroke="#1b0f05" stroke-width="2.4"/><path d="M-11 0H11M0 -11V11" stroke="#1b0f05" stroke-width="1.6" fill="none"/><path d="M-7.5 -8Q-2 0 -7.5 8M7.5 -8Q2 0 7.5 8" stroke="#1b0f05" stroke-width="1.4" fill="none"/></g>';
}
function scene(A,prog){
  var s='<path class="ln" d="M16 '+G+'Q120 '+(G-2)+' 240 '+G+'T464 '+G+'"/><path class="ln l2" d="M16 '+(G+3)+'Q140 '+(G+1)+' 260 '+(G+3)+'T464 '+(G+3)+'" opacity=".5"/>';
  if(A.scroll){ var off=(prog*A.scroll)%60; for(var i=-1;i<9;i++){ var x=i*60+off; if(x>16&&x<464) s+='<path class="ln" d="M'+x.toFixed(1)+' '+(G+10)+'v10"/>'; } }
  if(A.hoop){
    s+='<path class="ln" d="M440 24V86"/><path class="ln l2" d="M443 24V86" opacity=".5"/><path class="ln" d="M402 53H440"/>';
    s+='<path class="ln" d="M404 54L412 82M412 54L416 84M420 54V86M428 54L424 84M436 54L428 82M408 68H432" opacity=".7"/>';
    s+='<path class="ln" d="M440 86V'+G+'" opacity=".25"/>';
  }
  return s;
}
function trail(A,key){
  var pts_=[], n=70, i, st, J;
  for(i=0;i<=n;i++){ st=at(A,A.total*i/n); J=solve(st.p,A.hx); pts_.push(J[key]); }
  return pts_;
}

function build(id){
  var A=ANIMS[id], uid=id+"-"+Math.floor(Math.random()*1e6);
  var wrap=document.createElement("div"); wrap.className="anim-wrap";
  var legend='<li><i style="background:'+PIN.head+'"></i>Tête : bleu</li><li><i style="background:'+PIN.hip+'"></i>Bassin : rouge</li><li><i style="background:'+PIN.w1+'"></i><i style="background:'+PIN.w2+'"></i>Mains : orange et jaune</li><li><i style="background:'+PIN.e+'"></i>Coudes : violet</li><li><i style="background:'+PIN.k+'"></i>Genoux et pieds : rose</li>';
  wrap.innerHTML='<svg class="anim-svg" viewBox="0 0 '+W+' '+H+'" role="img" aria-label="'+A.desc.replace(/"/g,"&quot;")+'">'+
    '<defs><filter id="pcl-'+uid+'" x="-4%" y="-4%" width="108%" height="108%"><feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="2" seed="1"/><feDisplacementMap in="SourceGraphic" scale="3" xChannelSelector="R" yChannelSelector="G"/></filter></defs>'+
    '<rect width="'+W+'" height="'+H+'" fill="#f1ead9"/><g class="g-ghost"></g><g class="g-sketch" filter="url(#pcl-'+uid+')"></g><g class="g-pins"></g></svg>'+
    '<div class="anim-ctl"><button type="button" class="b-play"></button><button type="button" class="b-onion" aria-pressed="true">Calques</button></div>'+
    '<ul class="legend" aria-label="Légende des repères colorés">'+legend+'</ul>';
  var svg=wrap.querySelector("svg"), gGhost=svg.querySelector(".g-ghost"), gSk=svg.querySelector(".g-sketch"), gPin=svg.querySelector(".g-pins");
  var turb=svg.querySelector("feTurbulence"), bPlay=wrap.querySelector(".b-play"), bOn=wrap.querySelector(".b-onion");
  var reduce=matchMedia("(prefers-reduced-motion: reduce)").matches, playing=!reduce, onion=true, t0=performance.now(), tPause=0, step=0, lastSeed=0, seed=1;
  var ghosts="", trails="";
  function buildOnion(){
    ghosts=""; A.keys.forEach(function(k){ ghosts+=stick(solve(k,A.hx),A.view==="front",true); });
    trails=""; [["w1",PIN.w1],["w2",PIN.w2]].forEach(function(q){ trails+='<polyline class="trail" stroke="'+q[1]+'" points="'+pts(trail(A,q[0]))+'"/>'; });
  }
  buildOnion();
  function label(){ bPlay.textContent=reduce?"Pose suivante":(playing?"Pause":"Lecture"); if(!reduce) bPlay.setAttribute("aria-pressed",String(!playing)); }
  function render(st){
    var J=solve(st.p,A.hx), b=ballAt(st,J);
    gGhost.innerHTML=onion?trails+ghosts:"";
    gSk.innerHTML=scene(A,st.prog)+stick(J,A.view==="front",false)+(b?ballSvg(b):"");
    gPin.innerHTML=pins(J);
  }
  function stepRender(){ var k=A.keys[step%A.keys.length], c=0, i; for(i=0;i<step%A.keys.length;i++) c+=A.keys[i].d; render(at(A,c)); }
  function frame(now){
    if(!wrap.isConnected) return;
    if(wrap.offsetParent!==null){
      if(!reduce){
        var tt=playing?(now-t0):tPause; if(playing) tPause=tt;
        render(at(A,tt));
        if(now-lastSeed>90){ lastSeed=now; seed=seed%7+1; turb.setAttribute("seed",seed); }
      }
    }
    requestAnimationFrame(frame);
  }
  bPlay.addEventListener("click",function(){
    if(reduce){ step++; stepRender(); return; }
    playing=!playing; if(playing) t0=performance.now()-tPause; label();
  });
  bOn.addEventListener("click",function(){ onion=!onion; bOn.setAttribute("aria-pressed",String(onion)); gGhost.innerHTML=onion?trails+ghosts:""; });
  label();
  if(reduce) stepRender(); else requestAnimationFrame(frame);
  return wrap;
}

var seq=0;
function enhance(){
  var m=(location.hash||"").match(/^#drills\/([\w-]+)$/); if(!m||!ANIMS[m[1]]) return;
  var body=document.getElementById("panel-body"); if(!body) return;
  var h3=Array.prototype.filter.call(body.querySelectorAll(".block > h3"),function(h){ return h.textContent==="Vidéo"; })[0];
  if(!h3) return; var block=h3.parentNode; if(block.dataset.demo) return; block.dataset.demo="1";
  seq++; var idV="demo-v-"+seq, idA="demo-a-"+seq, tV="demo-tv-"+seq, tA="demo-ta-"+seq;
  h3.textContent="Démonstration";
  var vid=document.createElement("div"); vid.id=idV; vid.setAttribute("role","tabpanel"); vid.setAttribute("aria-labelledby",tV);
  while(h3.nextSibling) vid.appendChild(h3.nextSibling);
  var tabs=document.createElement("div"); tabs.className="demo-tabs"; tabs.setAttribute("role","tablist"); tabs.setAttribute("aria-label","Type de démonstration");
  tabs.innerHTML='<button type="button" role="tab" id="'+tV+'" aria-controls="'+idV+'" aria-selected="true">Vidéo</button><button type="button" role="tab" id="'+tA+'" aria-controls="'+idA+'" aria-selected="false" tabindex="-1">Animation</button>';
  var ani=document.createElement("div"); ani.id=idA; ani.setAttribute("role","tabpanel"); ani.setAttribute("aria-labelledby",tA); ani.hidden=true;
  block.appendChild(tabs); block.appendChild(vid); block.appendChild(ani);
  var built=false, bV=tabs.children[0], bA=tabs.children[1];
  function show(which){
    var a=which==="a"; bA.setAttribute("aria-selected",String(a)); bV.setAttribute("aria-selected",String(!a));
    bA.tabIndex=a?0:-1; bV.tabIndex=a?-1:0; vid.hidden=a; ani.hidden=!a;
    if(a&&!built){ ani.appendChild(build(m[1])); built=true; }
  }
  bV.addEventListener("click",function(){ show("v"); }); bA.addEventListener("click",function(){ show("a"); });
  tabs.addEventListener("keydown",function(e){ if(e.key==="ArrowRight"){ show("a"); bA.focus(); } else if(e.key==="ArrowLeft"){ show("v"); bV.focus(); } });
}
var body=document.getElementById("panel-body");
if(body){ new MutationObserver(enhance).observe(body,{childList:true}); enhance(); }
window.HoopsAnim={ANIMS:ANIMS,solve:solve,at:at,L:L,G:G,W:W,H:H,PIN:PIN};
})();
