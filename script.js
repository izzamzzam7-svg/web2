const $=s=>document.querySelector(s);
const pages={login:$("#loginPage"),intro:$("#introPage"),main:$("#mainPage")};
function showPage(name){Object.values(pages).forEach(p=>p.classList.remove("active"));pages[name].classList.add("active")}
const typeText="WELCOME APK XETRYMIN PROJECT\nDEVELOPER TANZZURA";
let ti=0; const typing=$("#typingLogin");
(function type(){if(ti<typeText.length){typing.innerHTML+=typeText[ti]==="\n"?"<br>":typeText[ti];ti++;setTimeout(type,65)}else setTimeout(()=>{typing.innerHTML="";ti=0;type()},1600)})();

$("#confirmBtn").onclick=()=>{showPage("intro"); const v=$("#introVideo");v.currentTime=0;v.play().catch(()=>{}); setTimeout(finishIntro,24000)};
$("#skipBtn").onclick=finishIntro;
let introDone=false;
function finishIntro(){if(introDone)return;introDone=true;$("#introVideo").pause();showPage("main");renderHome();$("#verifiedOverlay").classList.add("show")}
$("#introVideo").onended=finishIntro;
$("#closeVerify").onclick=$("#goHome").onclick=()=>{$("#verifiedOverlay").classList.remove("show")};

function toast(){const t=$("#toast");t.classList.add("show");setTimeout(()=>t.classList.remove("show"),1800)}
function marquee(text){return `<div class="marquee"><span>${text}</span></div>`}
function deviceInfo(){
 const ua=navigator.userAgent;
 let phone="Android";
 if(/Android/.test(ua)){let m=ua.match(/Android[^;]*;[^;]*;\s*([^)]+)/); if(m) phone=m[1].trim()}
 const ram=navigator.deviceMemory?navigator.deviceMemory+" GB":"Tidak tersedia";
 return {phone,ram}
}
function renderHome(){
 document.querySelectorAll(".nav-btn").forEach(b=>b.classList.toggle("active-nav",b.dataset.tab==="home"));
 const d=deviceInfo();
 $("#content").innerHTML=`
 ${marquee("WELCOME XETRYMIN PROJECT • DEVELOPER TANZZURA •")}
 <img class="home-image" src="xetrymin.jpg">
 <div class="info-card">
 <div class="clock" id="clock">00:00:00</div><div class="date" id="date"></div>
 <div class="status-grid">
 <div class="status-item"><b>BATERAI LIVE</b><span id="battery">Memuat...</span></div>
 <div class="status-item"><b>STATUS</b><span>ONLINE</span></div>
 <div class="status-item"><b>HANDPHONE</b>${d.phone}</div>
 <div class="status-item"><b>RAM</b>${d.ram}</div>
 </div></div>`;
 updateClock(); getBattery();
}
function updateClock(){const c=$("#clock"),d=$("#date");if(!c)return;const n=new Date();c.textContent=n.toLocaleTimeString("id-ID");d.textContent=n.toLocaleDateString("id-ID",{weekday:"long",day:"numeric",month:"long",year:"numeric"});setTimeout(updateClock,1000)}
async function getBattery(){try{if(navigator.getBattery){const b=await navigator.getBattery();const u=()=>{const el=$("#battery");if(el)el.textContent=Math.round(b.level*100)+"% "+(b.charging?"⚡":"");};u();b.addEventListener("levelchange",u);b.addEventListener("chargingchange",u)}else $("#battery").textContent="Tidak didukung perangkat"}catch(e){}}

function renderTools(){
 document.querySelectorAll(".nav-btn").forEach(b=>b.classList.toggle("active-nav",b.dataset.tab==="tools"));
 const items=["PLAT NOMER OSINT","IPHONE QUOTE","FF LOBY","TOOLS ISLAMI"];
 $("#content").innerHTML=`${marquee("WELCOME TOOLS • TERIMAKASIH SUDAH MENCOBA •")}<div class="section-title">TOOLS</div><div class="tool-list">${items.map((x,i)=>`<div class="item tool-item"><div class="num">${i+1}</div><div><h3>${x}</h3><p>Tekan untuk membuka</p></div></div>`).join("")}</div>`;
 document.querySelectorAll(".tool-item").forEach(x=>x.onclick=toast);
}
function renderGame(){
 document.querySelectorAll(".nav-btn").forEach(b=>b.classList.toggle("active-nav",b.dataset.tab==="game"));
 $("#content").innerHTML=`${marquee("GAME XETRYMIN PROJECT • PILIH GAME •")}<div class="section-title">GAME</div>
 <div class="game-list">
 <div class="item game-item" data-game="chess"><div class="num">1</div><div><h3>GAME CATUR</h3><p>Main catur sederhana</p></div></div>
 <div class="item game-item" data-game="snake"><div class="num">2</div><div><h3>ULAR CACING</h3><p>Remote control layar</p></div></div>
 <div class="item game-item" data-game="block"><div class="num">3</div><div><h3>BLOCK BLAST</h3><p>Game blok sederhana</p></div></div></div>`;
 document.querySelectorAll(".game-item").forEach(x=>x.onclick=()=>openGame(x.dataset.game));
}
document.querySelectorAll(".nav-btn").forEach(b=>b.onclick=()=>{if(b.dataset.tab==="home")renderHome();if(b.dataset.tab==="tools")renderTools();if(b.dataset.tab==="game")renderGame()});

function openGame(g){if(g==="chess")chess();else if(g==="snake")snake();else blockBlast()}
function chess(){const pieces=["♜","♞","♝","♛","♚","♝","♞","♜","♟","♟","♟","♟","♟","♟","♟","♟","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","♙","♙","♙","♙","♙","♙","♙","♙","♖","♘","♗","♕","♔","♗","♘","♖"];$("#content").innerHTML=`${marquee("GAME CATUR • XETRYMIN PROJECT")}<h2 style="text-align:center">CATUR</h2><div class="chess">${pieces.map(p=>`<div class="sq">${p}</div>`).join("")}</div><p style="text-align:center;color:#aaa">Versi sederhana — pilih permainan untuk bersenang-senang.</p>`}
function snake(){let html=`${marquee("ULAR CACING • XETRYMIN PROJECT")}<div class="canvas-wrap"><canvas id="cv" class="gamecanvas" width="320" height="320"></canvas></div><div class="game-controls"><button id="up">↑</button><button id="left">←</button><button id="down">↓</button><button id="right">→</button></div>`;$("#content").innerHTML=html;const c=$("#cv"),ctx=c.getContext("2d"),s=16;let snake=[[10,10],[9,10],[8,10]],food=[4,4],dir=[1,0],running=true;
 const move=(x,y)=>{if(x!==-dir[0]||y!==-dir[1])dir=[x,y]};$("#up").onclick=()=>move(0,-1);$("#down").onclick=()=>move(0,1);$("#left").onclick=()=>move(-1,0);$("#right").onclick=()=>move(1,0);
 document.onkeydown=e=>({ArrowUp:()=>move(0,-1),ArrowDown:()=>move(0,1),ArrowLeft:()=>move(-1,0),ArrowRight:()=>move(1,0)}[e.key]||(()=>{}))();
 const loop=()=>{if(!running||!$("#cv"))return;let h=[snake[0][0]+dir[0],snake[0][1]+dir[1]];if(h[0]<0||h[1]<0||h[0]>=20||h[1]>=20||snake.some((p,i)=>i&&p[0]===h[0]&&p[1]===h[1])){snake=[[10,10],[9,10],[8,10]];dir=[1,0]}snake.unshift(h);if(h[0]===food[0]&&h[1]===food[1])food=[Math.floor(Math.random()*20),Math.floor(Math.random()*20)];else snake.pop();ctx.clearRect(0,0,320,320);ctx.fillStyle="#fff";ctx.fillRect(food[0]*s,food[1]*s,s,s);ctx.fillStyle="#788cff";snake.forEach(p=>ctx.fillRect(p[0]*s,p[1]*s,s-2,s-2));setTimeout(loop,120)};loop()}
function blockBlast(){const cells=Array(64).fill(0);$("#content").innerHTML=`${marquee("BLOCK BLAST • XETRYMIN PROJECT")}<h2 style="text-align:center">BLOCK BLAST</h2><div id="blocks" style="display:grid;grid-template-columns:repeat(8,1fr);gap:4px;max-width:430px;margin:auto"></div><p style="text-align:center;color:#aaa">Tekan kotak untuk mengisi blok.</p>`;const b=$("#blocks");cells.forEach((_,i)=>{let x=document.createElement("div");x.style.cssText="aspect-ratio:1;background:#17203c;border-radius:7px;border:1px solid #ffffff18";x.onclick=()=>{x.style.background="#7b8cff"};b.appendChild(x)})}
