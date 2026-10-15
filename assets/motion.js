(function(){
"use strict";
var reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
var nav = document.getElementById("tabs"), body = document.body;

/* Indicateur d'onglet qui glisse */
if(nav){
  var ink = document.createElement("span");
  ink.className = "tab-ink"; ink.setAttribute("aria-hidden","true");
  nav.appendChild(ink);
  var place = function(animate){
    var a = nav.querySelector('.tab[aria-current="true"]');
    if(!a){ nav.classList.remove("ink-on"); return; }
    if(!animate) ink.style.transition = "none";
    ink.style.setProperty("--x", (a.offsetLeft+12)+"px");
    ink.style.setProperty("--w", Math.max(0,a.offsetWidth-24)+"px");
    nav.classList.add("ink-on");
    if(!animate){ void ink.offsetWidth; ink.style.transition = ""; }
    var l = a.offsetLeft, r = l + a.offsetWidth;
    if(l < nav.scrollLeft || r > nav.scrollLeft + nav.clientWidth){
      nav.scrollTo({left:Math.max(0,l-16), behavior: reduce ? "auto" : "smooth"});
    }
  };
  new MutationObserver(function(){ place(true); }).observe(nav,{attributes:true,subtree:true,attributeFilter:["aria-current"]});
  window.addEventListener("resize", function(){ place(false); });
  if(document.fonts && document.fonts.ready) document.fonts.ready.then(function(){ place(false); });
  place(false);
}

/* Entrée en cascade des cartes, uniquement quand la vue change */
var timer, lastView = null;
function currentView(){ return (location.hash||"#drills").replace(/^#/,"").split("/")[0] || "drills"; }
function enter(){
  if(reduce) return;
  body.classList.remove("enter"); void body.offsetWidth; body.classList.add("enter");
  clearTimeout(timer); timer = setTimeout(function(){ body.classList.remove("enter"); }, 1500);
}
function onView(){ var v = currentView(); if(v !== lastView){ lastView = v; enter(); } }
window.addEventListener("hashchange", onView);
lastView = currentView();

/* Écran de chargement : le ballon rebondit jusqu'à ce que la page soit prête (1,3 s minimum, 6 s maximum) */
var splash = document.querySelector(".splash");
var splashOn = splash && getComputedStyle(splash).display !== "none";
function leave(){
  if(!splash || !splash.parentNode || splash.classList.contains("done")) return;
  splash.classList.add("done");
  setTimeout(enter, 250);
}
if(splashOn){
  var loaded = new Promise(function(res){
    if(document.readyState === "complete") res(); else window.addEventListener("load", res, {once:true});
  });
  var fonts = (document.fonts && document.fonts.ready)
    ? Promise.race([document.fonts.ready, new Promise(function(r){ setTimeout(r, 2500); })])
    : Promise.resolve();
  Promise.all([loaded, fonts]).then(function(){ setTimeout(leave, Math.max(0, 1300 - performance.now())); });
  setTimeout(leave, 6000);
  splash.addEventListener("animationend", function(e){
    if(e.animationName === "splash-leave" || e.animationName === "splash-out") splash.remove();
  });
  setTimeout(function(){ if(splash.parentNode) splash.remove(); }, 9500);
} else {
  setTimeout(enter, 0);
}

/* Ombre de l'en-tête au défilement */
var bar = document.querySelector(".topbar");
if(bar){
  var onScroll = function(){ bar.classList.toggle("scrolled", window.scrollY > 4); };
  window.addEventListener("scroll", onScroll, {passive:true}); onScroll();
}
})();
