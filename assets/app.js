const products = [
  {name:"Pulsa Reguler",category:"Pulsa",desc:"Berbagai operator seluler",icon:"▣"},
  {name:"Paket Data",category:"Data",desc:"Paket internet pilihan",icon:"◉"},
  {name:"Top Up Game",category:"Game",desc:"Isi ulang game favorit",icon:"🎮"},
  {name:"Token PLN",category:"PLN",desc:"Token listrik prabayar",icon:"ϟ"},
  {name:"E-Wallet",category:"Pulsa",desc:"Isi saldo dompet digital",icon:"◇"},
  {name:"Voucher Game",category:"Game",desc:"Voucher digital",icon:"✦"},
  {name:"Paket Telepon",category:"Data",desc:"Paket komunikasi",icon:"⌁"},
  {name:"Tagihan",category:"PLN",desc:"Pembayaran tagihan",icon:"▤"}
];
const grid = document.querySelector("#productGrid");
function renderProducts(filter="Semua"){
  grid.innerHTML="";
  products.filter(p=>filter==="Semua"||p.category===filter).forEach(p=>{
    const card=document.createElement("article"); card.className="product-card";
    card.innerHTML=`<div class="product-icon">${p.icon}</div><h3>${p.name}</h3><p>${p.desc}</p><span class="demo-label">Harga dan supplier belum dihubungkan</span>`;
    grid.appendChild(card);
  });
}
renderProducts();
document.querySelectorAll("[data-filter]").forEach(btn=>btn.addEventListener("click",()=>{
  document.querySelectorAll("[data-filter]").forEach(x=>x.classList.remove("active"));
  btn.classList.add("active"); renderProducts(btn.dataset.filter);
}));
const login=document.querySelector("#loginDialog"), info=document.querySelector("#infoDialog");
document.querySelector("#loginBtn").addEventListener("click",()=>login.showModal());
document.querySelector("#accountNav").addEventListener("click",()=>login.showModal());
function showInfo(title,message){document.querySelector("#infoTitle").textContent=title;document.querySelector("#infoText").textContent=message;info.showModal();}
document.querySelector("#supportBtn").addEventListener("click",()=>showInfo("Contact Support","Kontak support belum diatur. Owner dapat menambahkannya setelah backend dan Admin Panel dibuat."));
document.querySelector("#year").textContent=new Date().getFullYear();
