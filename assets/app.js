(function(){
"use strict";
var D = window.HOOPS, $ = function(id){return document.getElementById(id)};
var VID = window.HOOPS_VIDEOS || {};
var state = {cat:"all", lvl:0, q:""};
var PROG = "hoops-progress-v1", SHOTS = "hoops-shots-v1";
var SPOTS = ["Coin gauche","Aile gauche","Axe (haut de la raquette)","Aile droite","Coin droit","Lancers francs"];
function load(k, def){ try{ return JSON.parse(localStorage.getItem(k)) || def; }catch(e){ return def; } }
function store(k, v){ try{ localStorage.setItem(k, JSON.stringify(v)); }catch(e){} }
var progress = load(PROG, {}), shots = load(SHOTS, []);
function esc(s){ return String(s).replace(/[&<>"']/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]}); }
function norm(s){ return s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,""); }
var catName = {}; D.cats.forEach(function(c){catName[c.id]=c.name});
var byId = {}; D.drills.forEach(function(d){byId[d.id]=d});
var mById = {}; D.matchups.forEach(function(m){mById[m.id]=m});
function lvlBadge(n){ return '<span class="lvl lvl-'+n+'">'+esc(D.levels[n])+'</span>'; }
function lvlText(t){ return '<span class="lvl lvl-'+norm(t)+'">'+esc(t)+'</span>'; }
function reduced(){ return matchMedia("(prefers-reduced-motion: reduce)").matches; }

var ICON = {
  tir:'<path d="M3 20C5 9 10 5 17 8"/><path d="M15 12h7M16 12l1 4M21 12l-1 4M18.5 12v4"/><circle cx="17" cy="7.5" r="1.6"/>',
  dribble:'<circle cx="12" cy="6.5" r="3.5"/><path d="M12 10v7M8 21h8M9 17l3 4 3-4"/>',
  finition:'<path d="M5 3h14v8H5z"/><path d="M9 11l1 5M15 11l-1 5M12 11v5"/><circle cx="12" cy="20" r="2"/>',
  defense:'<path d="M12 3l7 3v5c0 5-3 8-7 10-4-2-7-5-7-10V6z"/>',
  physique:'<path d="M13 3L5 14h6l-1 7 8-11h-6z"/>'
};
function icon(cat){
  return '<span class="tile-ico" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">'+(ICON[cat]||"")+'</svg>'+
    '<img class="ico-img" src="assets/img/'+cat+'.png" alt="" loading="lazy" decoding="async" onerror="this.remove()"></span>';
}

function renderFilters(){
  var c = '<button type="button" class="fchip" data-cat="all" aria-pressed="'+(state.cat==="all")+'">Toutes</button>';
  D.cats.forEach(function(x){ c += '<button type="button" class="fchip" data-cat="'+x.id+'" aria-pressed="'+(state.cat===x.id)+'">'+esc(x.name)+'</button>'; });
  $("cat-filters").innerHTML = c;
  var l = '<button type="button" class="fchip" data-lvl="0" aria-pressed="'+(state.lvl===0)+'">Tous niveaux</button>';
  [1,2,3].forEach(function(n){ l += '<button type="button" class="fchip" data-lvl="'+n+'" aria-pressed="'+(state.lvl===n)+'">'+esc(D.levels[n])+'</button>'; });
  $("lvl-filters").innerHTML = l;
}
function filtered(){
  var q = norm(state.q.trim());
  return D.drills.filter(function(d){
    if(state.cat!=="all" && d.cat!==state.cat) return false;
    if(state.lvl && d.level!==state.lvl) return false;
    if(q && norm(d.name+" "+d.desc+" "+catName[d.cat]).indexOf(q)<0) return false;
    return true;
  });
}
function renderDrills(sel){
  var list = filtered();
  $("drill-grid").innerHTML = list.map(function(d){
    return '<a class="tile'+(d.id===sel?' selected':'')+'" href="#drills/'+d.id+'" '+(d.id===sel?'aria-current="true"':'')+'>'+
      '<span class="tile-top">'+icon(d.cat)+'<span class="chip cat">'+esc(catName[d.cat])+'</span></span>'+
      '<span class="tile-name">'+esc(d.name)+'</span>'+
      '<span class="chips">'+lvlBadge(d.level)+'<span class="chip">'+d.min+' min</span></span></a>';
  }).join("");
  $("no-drills").hidden = list.length>0;
  $("drills-cov").innerHTML = '<strong>'+list.length+'</strong> drill'+(list.length>1?'s':'')+' sur '+D.drills.length;
}

function renderMatchups(sel){
  $("matchup-grid").innerHTML = D.matchups.map(function(m){
    return '<a class="tile'+(m.id===sel?' selected':'')+'" href="#matchups/'+m.id+'" '+(m.id===sel?'aria-current="true"':'')+'>'+
      '<span class="chips"><span class="chip cat">VS</span>'+lvlText(m.level)+'</span>'+
      '<span class="tile-name">'+esc(m.name)+'</span>'+
      '<span class="tile-desc">'+esc(m.tells)+'</span></a>';
  }).join("");
}

function renderSessions(){
  $("session-list").innerHTML = D.sessions.map(function(s){
    var done = s.blocks.filter(function(b,i){return progress[s.id+":"+i]}).length;
    var pct = Math.round(done/s.blocks.length*100);
    var items = s.blocks.map(function(b,i){
      var d = byId[b.drill], key = s.id+":"+i, id = "chk-"+s.id+"-"+i;
      return '<li><label class="check" for="'+id+'"><input type="checkbox" id="'+id+'" data-key="'+key+'" '+(progress[key]?'checked':'')+'>'+
        '<span class="nm">'+esc(d.name)+'</span><span class="mn">'+b.min+' min</span></label>'+
        '<a class="open" href="#drills/'+d.id+'">Voir le drill</a></li>';
    }).join("");
    return '<article class="session"><h2>'+esc(s.name)+'</h2><p class="focus">'+esc(s.focus)+'</p>'+
      '<div class="bar" role="progressbar" aria-label="Progression de '+esc(s.name)+'" aria-valuemin="0" aria-valuemax="100" aria-valuenow="'+pct+'"><span style="width:'+pct+'%"></span></div>'+
      '<p class="coverage" style="margin-bottom:8px"><strong>'+done+'</strong> / '+s.blocks.length+' blocs</p>'+
      '<ul class="blocks">'+items+'</ul></article>';
  }).join("");
}

function listHtml(arr, cls){ return '<ul class="notes '+(cls||'')+'">'+arr.map(function(x){return '<li>'+esc(x)+'</li>'}).join("")+'</ul>'; }
var YT_ICON='<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M23 7.2s-.2-1.6-.9-2.3c-.9-.9-1.9-.9-2.4-1C16.6 3.6 12 3.6 12 3.6s-4.6 0-7.7.3c-.5.1-1.5.1-2.4 1-.7.7-.9 2.3-.9 2.3S.8 9.1.8 11v1.8c0 1.9.2 3.8.2 3.8s.2 1.6.9 2.3c.9.9 2 .9 2.5 1 1.8.2 7.6.3 7.6.3s4.6 0 7.7-.4c.5-.1 1.5-.1 2.4-1 .7-.7.9-2.3.9-2.3s.2-1.9.2-3.8V11c0-1.9-.2-3.8-.2-3.8zM9.7 14.9V8.5l6.3 3.2-6.3 3.2z"/></svg>';
function videoBlock(d){
  var id = VID[d.id] || d.video, h = '<div class="block"><h3>Vidéo</h3>';
  if(id && /^[A-Za-z0-9_-]{11}$/.test(id)){
    h += '<div class="lite" data-yt="'+id+'" data-title="'+esc(d.name)+'">'+
      '<button type="button" class="lite-btn" aria-label="Lire la vidéo : '+esc(d.name)+'" style="background-image:url(https://i.ytimg.com/vi/'+id+'/hqdefault.jpg)"><span class="lite-play" aria-hidden="true"></span></button></div>'+
      '<a class="yt-open" href="https://www.youtube.com/watch?v='+id+'" target="_blank" rel="noopener noreferrer">'+YT_ICON+'<span>Ouvrir sur YouTube</span></a>';
  } else {
    var q = encodeURIComponent((d.yt||d.name)+" basketball drill");
    h += '<a class="yt-open" href="https://www.youtube.com/results?search_query='+q+'" target="_blank" rel="noopener noreferrer">'+YT_ICON+'<span>Chercher des vidéos sur YouTube</span></a>';
  }
  return h+'</div>';
}
function tips(d){
  return '<ul class="tips">'+
    d.points.map(function(p){return '<li class="ok"><span class="sr-only">À faire : </span>'+esc(p)+'</li>'}).join("")+
    d.errors.map(function(e){return '<li class="no"><span class="sr-only">Erreur : </span>'+esc(e)+'</li>'}).join("")+'</ul>';
}
function openDrill(id){
  var d = byId[id]; if(!d) return closePanel();
  $("panel-title").textContent = d.name;
  $("panel-sub").textContent = catName[d.cat]+' · '+D.levels[d.level]+' · '+d.min+' min · '+d.reps;
  var rel = D.matchups.filter(function(m){return m.drills.indexOf(id)>=0}).map(function(m){return '<a class="link-drill" href="#matchups/'+m.id+'">'+esc(m.short)+'</a>'}).join("");
  $("panel-body").innerHTML =
    '<div><p class="lead">'+esc(d.desc)+'</p>'+videoBlock(d)+
    '<div class="block"><h3>Étapes</h3><ol class="steps">'+d.steps.map(function(s){return '<li>'+esc(s)+'</li>'}).join("")+'</ol></div></div>'+
    '<div><img class="cover" src="assets/img/'+d.cat+'.png" alt="" loading="lazy" decoding="async" onerror="this.remove()">'+
    '<div class="block"><h3>À retenir</h3>'+tips(d)+'</div>'+
    '<div class="block"><h3>Matchups liés</h3>'+(rel||'<p>Aucun pour l’instant.</p>')+'</div></div>';
  showPanel();
}
function openMatchup(id){
  var m = mById[id]; if(!m) return closePanel();
  $("panel-title").textContent = "Moi vs "+m.name;
  $("panel-sub").innerHTML = lvlText(m.level)+' &nbsp; '+esc(m.tells);
  $("panel-body").innerHTML =
    '<div><div class="block"><h3>À faire</h3>'+listHtml(m.best)+'</div>'+
    '<div class="block"><h3>À éviter</h3>'+listHtml(m.avoid,"bad")+'</div></div>'+
    '<div><div class="block"><h3>Le conseil</h3><p>'+esc(m.note)+'</p></div>'+
    '<div class="block"><h3>Drills à travailler</h3>'+
      m.drills.map(function(i){return '<a class="link-drill" href="#drills/'+i+'">'+esc(byId[i].name)+'</a>'}).join("")+'</div></div>';
  showPanel();
}
function showPanel(){ $("panel").hidden=false; $("panel-title").focus({preventScroll:true}); $("panel").scrollIntoView({block:"start", behavior: reduced()?"auto":"smooth"}); }
function closePanel(){ $("panel").hidden=true; }
$("panel-body").addEventListener("click", function(e){
  var b = e.target.closest(".lite-btn"); if(!b) return;
  var box = b.parentNode, id = box.dataset.yt;
  if(!/^[A-Za-z0-9_-]{11}$/.test(id)) return;
  box.innerHTML = '<iframe src="https://www.youtube-nocookie.com/embed/'+id+'?autoplay=1&rel=0" title="Vidéo : '+box.dataset.title+'" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen referrerpolicy="no-referrer"></iframe>';
  box.querySelector("iframe").focus();
});

function pct(m,a){ return a ? Math.round(m/a*100)+" %" : "—"; }
function today(){ var d=new Date(); return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0"); }
function fmtDate(s){ var p=s.split("-"); return p[2]+"/"+p[1]+"/"+p[0]; }
function saveShots(){ store(SHOTS, shots); $("c-tracker").textContent = shots.length; }
function renderTracker(){
  if(!$("spot-fields").children.length){
    $("spot-fields").innerHTML = SPOTS.map(function(n,i){
      return '<fieldset class="spot"><legend>'+esc(n)+'</legend><div class="spot-row">'+
        '<label for="m'+i+'">Réussis<input type="number" inputmode="numeric" min="0" max="999" id="m'+i+'" placeholder="0"></label>'+
        '<label for="a'+i+'">Tentés<input type="number" inputmode="numeric" min="0" max="999" id="a'+i+'" placeholder="0"></label></div></fieldset>';
    }).join("");
    $("shot-date").value = today();
  }
  var tm=0, ta=0, per = SPOTS.map(function(){return {m:0,a:0}});
  shots.forEach(function(s){ s.spots.forEach(function(x,i){ per[i].m+=x.m; per[i].a+=x.a; tm+=x.m; ta+=x.a; }); });
  var st = '<div class="stat"><div class="pct">'+pct(tm,ta)+'</div><div class="lbl">Total</div><div class="frac">'+tm+' / '+ta+'</div></div>';
  SPOTS.forEach(function(n,i){ st += '<div class="stat"><div class="pct">'+pct(per[i].m,per[i].a)+'</div><div class="lbl">'+esc(n)+'</div><div class="frac">'+per[i].m+' / '+per[i].a+'</div></div>'; });
  $("shot-stats").innerHTML = st;
  $("shot-history").innerHTML = shots.length ? shots.slice().reverse().slice(0,15).map(function(s){
    var m=0, a=0; s.spots.forEach(function(x){m+=x.m; a+=x.a});
    return '<li><span class="when">'+fmtDate(s.date)+'</span><span class="sum">'+m+' / '+a+' · '+pct(m,a)+'</span>'+
      '<button type="button" data-del="'+s.id+'" aria-label="Supprimer la session du '+fmtDate(s.date)+'">✕</button></li>';
  }).join("") : '<li>Aucune session enregistrée pour l’instant.</li>';
}
$("shot-form").addEventListener("submit", function(e){
  e.preventDefault();
  var err = $("shot-error"), arr = [], any = false, bad = null;
  SPOTS.forEach(function(n,i){
    var m = parseInt($("m"+i).value||"0",10), a = parseInt($("a"+i).value||"0",10);
    if(isNaN(m)||isNaN(a)||m<0||a<0||m>a) bad = bad||n;
    if(a>0) any = true;
    arr.push({m:m||0, a:a||0});
  });
  if(bad){ err.textContent = "Vérifie « "+bad+" » : les tirs réussis ne peuvent pas dépasser les tirs tentés."; err.hidden=false; return; }
  if(!any){ err.textContent = "Entre au moins une zone avec des tirs tentés."; err.hidden=false; return; }
  err.hidden = true;
  shots.push({id:Date.now(), date:$("shot-date").value||today(), spots:arr});
  shots.sort(function(x,y){ return x.date<y.date?-1 : x.date>y.date?1 : x.id-y.id; });
  saveShots();
  SPOTS.forEach(function(n,i){ $("m"+i).value=""; $("a"+i).value=""; });
  renderTracker();
});
$("shot-history").addEventListener("click", function(e){
  var b = e.target.closest("[data-del]"); if(!b) return;
  if(!confirm("Supprimer cette session ?")) return;
  shots = shots.filter(function(s){ return String(s.id)!==b.dataset.del; });
  saveShots(); renderTracker();
});

var THEMES = {orange:"Orange", ice:"Glace"};
var theme = document.documentElement.getAttribute("data-theme")==="ice" ? "ice" : "orange";
function applyTheme(){
  if(theme==="ice") document.documentElement.setAttribute("data-theme","ice"); else document.documentElement.removeAttribute("data-theme");
  $("theme-name").textContent = THEMES[theme];
}
$("theme-btn").addEventListener("click", function(){
  theme = theme==="ice" ? "orange" : "ice"; applyTheme();
  try{ localStorage.setItem("hoops-theme", theme); }catch(e){}
});

var VIEWS = ["drills","matchups","sessions","tracker"];
var TITLES = {drills:"Drills", matchups:"Matchups", sessions:"Sessions", tracker:"Scores"};
function route(){
  var parts = (location.hash||"#drills").replace(/^#/,"").split("/");
  var view = VIEWS.indexOf(parts[0])>=0 ? parts[0] : "drills", id = parts[1];
  VIEWS.forEach(function(v){ $("view-"+v).hidden = v!==view; });
  Array.prototype.forEach.call(document.querySelectorAll(".tab"), function(a){
    if(a.dataset.view===view) a.setAttribute("aria-current","true"); else a.removeAttribute("aria-current");
  });
  document.title = "Hoops Lab — "+TITLES[view];
  if(view==="drills"){ renderDrills(id); id ? openDrill(id) : closePanel(); }
  else if(view==="matchups"){ renderMatchups(id); id ? openMatchup(id) : closePanel(); }
  else if(view==="sessions"){ renderSessions(); closePanel(); }
  else { renderTracker(); closePanel(); }
}

$("c-drills").textContent = D.drills.length;
$("c-matchups").textContent = D.matchups.length;
$("c-sessions").textContent = D.sessions.length;
$("c-tracker").textContent = shots.length;

$("cat-filters").addEventListener("click", function(e){ var b=e.target.closest("[data-cat]"); if(!b) return; state.cat=b.dataset.cat; renderFilters(); renderDrills(); });
$("lvl-filters").addEventListener("click", function(e){ var b=e.target.closest("[data-lvl]"); if(!b) return; state.lvl=+b.dataset.lvl; renderFilters(); renderDrills(); });
$("search").addEventListener("input", function(e){ state.q=e.target.value; renderDrills(); });
$("session-list").addEventListener("change", function(e){
  var k = e.target.dataset.key; if(!k) return;
  if(e.target.checked) progress[k]=1; else delete progress[k];
  store(PROG, progress);
  var fid = e.target.id; renderSessions(); var el=$(fid); if(el) el.focus();
});
$("panel-close").addEventListener("click", function(){ location.hash = (location.hash||"#drills").replace(/^#/,"").split("/")[0]; });
document.addEventListener("keydown", function(e){ if(e.key==="Escape" && !$("panel").hidden) $("panel-close").click(); });
$("reset").addEventListener("click", function(){
  if(confirm("Effacer ta progression de sessions ET ton historique de tirs ?")){ progress={}; store(PROG,progress); shots=[]; saveShots(); route(); }
});
window.addEventListener("hashchange", route);
applyTheme(); renderFilters(); route();
})();
