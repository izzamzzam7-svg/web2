
  /* ------------------ Intro controls ------------------ */
  const video = document.getElementById("player");
  const bar = document.getElementById("bar");
  const loading = document.getElementById("loading");
  const introOverlay = document.getElementById("introOverlay");
  const app = document.getElementById("app");
  const welcomeBox = document.getElementById("welcomeBox");

  video.addEventListener("loadedmetadata", () => {
    const dur = video.duration || 5;
    document.documentElement.style.setProperty("--duration", dur + "s");
    if (bar) bar.style.animationDuration = dur + "s";
  });

  function tryPlay() {
    video.muted = false;
    video.volume = 1.0;
    video.play().catch(() => {
      video.muted = true;
      video.play().catch(()=>{/* ignore */});
    });
  }

  window.addEventListener("load", tryPlay);

  function showAppAfterIntro() {
    // fade-out intro overlay
    introOverlay.classList.add("hidden");
    // reveal app after fade
    setTimeout(() => {
      introOverlay.style.display = "none";
      app.classList.add("visible");
      app.setAttribute("aria-hidden","false");
      // show welcome popup once (if not shown before)
      if (!localStorage.getItem("welcomeShown")) {
        setTimeout(()=> {
          welcomeBox.classList.add("active");
          welcomeBox.setAttribute("aria-hidden","false");
          localStorage.setItem("welcomeShown","yes");
          setTimeout(()=> {
            welcomeBox.classList.remove("active");
            welcomeBox.setAttribute("aria-hidden","true");
          }, 3000);
        }, 200); // small delay so app visible first
      }
    }, 620); // match CSS fade timing
  }

  video.addEventListener("ended", () => {
    if (loading) loading.classList.add("hidden");
    // small delay so loading hides nicely then transition
    setTimeout(showAppAfterIntro, 300);
  });

  // safety fallback if video can't play/ended event missed
  setTimeout(()=> {
    if (!video.ended && introOverlay && introOverlay.style.display !== "none") {
      try { showAppAfterIntro(); } catch(e){}
    }
  }, 9000);

  /* ------------------ App / Mail logic (original, preserved + fixed) ------------------ */
  const sendBtn = document.getElementById('sendBtn');
  const statusEl = document.getElementById('statusArea');
  const nomorInput = document.getElementById('nomor');
  const alasanSelect = document.getElementById('alasan');

  function enc(v){ return encodeURIComponent(v || ''); }
  function isAndroid(){ return /Android/i.test(navigator.userAgent); }
  function setStatus(t){ statusEl.textContent = t; }
  function normalizeNumber(n){
    if(!n) return n;
    const s=n.trim().replace(/\s+/g,'');
    if(/^[0][0-9]+$/.test(s)) return '62'+s.slice(1);
    if(/^\+/.test(s)) return s;
    return s;
  }

  /* buildTemplate: placeholders for 5 opsi (edit text later) */
  function buildTemplate(nomor, alasan){
    const tampilNomor = (nomor.startsWith('+') || nomor.startsWith('62')) ? nomor : ('+'+nomor);

    switch(alasan){
      case "permafresh":
        return {
          to: 'support@support.whatsapp.com',
          subject: 'Hello whatsapp developer, please help me.',
          body: `Hello developer, my Whatsapp is Vixzz. I would like to ask for help regarding my account being blocked a few hours ago. I don't know the exact reason, but when I woke up and wanted to chat with my girlfriend, my Whatsapp account was blocked permanently. Here is my blocked Whatsapp number:\n${tampilNomor} I beg you to restore it immediately, thank you.`
        };
      case "SPAM":
        return {
          to: 'support@support.whatsapp.com',
          subject: 'tolong saya',
          body: `Hallo developer whatsapp saya vixzz salah satu pengguna whatsapp dari tahun 2023 dan saya saat ini ingin mengeluhkan atas pemblockiran akun whatsapp saya dengan alasan spam pada tanggal [ tanggal ke band ], ini sangat lah aneh karena saya sudah sering membaca layanan ketentuan aplikasi whatsapp dan sudah mematuhinya juga selama 2/3 tahun terakhir dan saya percaya ini adalah kesalahan sistem whatsapp yang salah mendeteksi kesalahan sehingga mungkin hanya chatan biasa pun bisa di anggap spam dan di blockir. Saya mohon untuk pihak whatsapp fix bug ini karena sangat meresahkan dan buka kan akun whatsapp saya [ ${tampilNomor} ] secepat mungkin karena saya ingin menghubungi keluarga saya yang kini sedang ada di luar kota dan saya menyayangi nya, terima kasih.`
        };
      case "PERMA HARD":
        return {
          to: 'support@support.whatsapp.com',
          subject: `please unblock this WhatsApp account [ ${tampilNomor} ] its a system error`,
          body: `Hi developer, I'm contacting you via WhatsApp to request a review of my WhatsApp account, which has been blocked for no apparent reason. I've already requested a review through the WhatsApp application, but the block hasn't been lifted. I urgently need that WhatsApp account, as I've mentioned in the Gmail subject. Sorry for bothering you, but I need my WhatsApp account back now. Thank you.`
        };
      case "PERMASEMINGGU":
        return {
          to: 'support@support.whatsapp.com',
          subject: 'help me plss',
          body: `Hi WhatsApp Developer, I'm vixzz. My WhatsApp account (+${tampilNomor}) was blocked without reason. I always follow WhatsApp's Terms of Service, use the official app, never spam, and behave respectfully. I believe this is a system error. Please review and restore my account. Thank you for your attention and help.`
        };
      case "opsi5":
        return {
          to: 'support@support.whatsapp.com',
          subject: 'hi',
          body: `Hizmet şartlarınızı ihlal etmedim, hesabı açıklanamaz bir şekilde yasakladınız. Hesap etkinliklerimi inceledikten sonra, WhatsApp a erişebilmem için kısıtlamayı hızla kaldırırsınız. Çünkü hesabım yanlışlıkla yasaklandı 

Şartlarınızı veya politikanızı ihlal ettiğimi kabul ediyorum ve bunun için gerçekten üzgünüm lütfen bir şans verin ve yasağı hesabımdan kaldırın ${tampilNomor} isim Satya Budist gursarai

Görüşleriniz için teşekkürler
Hindistan lıyım, ülke kodum ${tampilNomor}
Yasal adım Satya Budist gursarai
Umarım bu SIM kartın yeni sahibi olduğum için WhatsApp hesap numaramdan kısıtlamalarınızı kaldırırsınız ${tampilNomor}

Ve o kaldırılmalıdır, aksi takdirde WhatsApp ın derecelendirmesini rahatsız etmeyeceksiniz Ki amaiyo chod hoga kardeş ke lado
`
        };
      default:
        return {
          to: 'support@support.whatsapp.com',
          subject: `My WhatsApp number was blocked ${tampilNomor}`,
          body: `प्रिय व्हाट्सएप सपोर्ट टीम,

मुझे आशा है कि यह संदेश आपको अच्छी तरह से मिल जाएगा ।  मैं अपने व्हाट्सएप अकाउंट पर प्रतिबंध की अपील करने के लिए लिख रहा हूं ।  मैं समझता हूं कि व्हाट्सएप की सेवा की शर्तों के उल्लंघन के कारण मेरे खाते पर प्रतिबंध लगा दिया गया था, और मैं किसी भी अनजाने कार्यों के लिए ईमानदारी से माफी मांगता हूं जिसके कारण यह हो सकता है । 

मैं व्हाट्सएप को एक आवश्यक संचार उपकरण और समुदाय के रूप में महत्व देता हूं, और मैं व्हाट्सएप की नीतियों और दिशानिर्देशों का पालन करने के लिए प्रतिबद्ध हूं ।  मैं कृपया अपने मामले की समीक्षा और अपने खाते पर प्रतिबंध हटाने का अनुरोध करता हूं ताकि मैं जिम्मेदारी से व्हाट्सएप का उपयोग करना जारी रख सकूं । 

कृपया नीचे कुछ जानकारी प्राप्त करें जो आपकी समीक्षा के लिए सहायक हो सकती हैं: - मेरा पंजीकृत फोन नंबर.`
        };
    }
  }

  function buildIntentUrl(t){return `intent://compose?to=${enc(t.to)}&subject=${enc(t.subject)}&body=${enc(t.body)}#Intent;scheme=mailto;package=com.google.android.gm;end`;}
  function buildMailtoUrl(t){return `mailto:${enc(t.to)}?subject=${enc(t.subject)}&body=${enc(t.body)}`;}
  function buildGmailWebUrl(t){return `https://mail.google.com/mail/?view=cm&fs=1&to=${enc(t.to)}&su=${enc(t.subject)}&body=${enc(t.body)}`;}

  sendBtn.addEventListener('click',()=>{
    let nomor=(nomorInput.value||'').trim();
    let alasan=(alasanSelect.value||'');

    if(!nomor || !alasan){ setStatus("Mohon isi nomor & pilih alasan."); return; }

    nomor = normalizeNumber(nomor);
    const tpl = buildTemplate(nomor, alasan);

    const intentUrl = buildIntentUrl(tpl);
    const mailtoUrl = buildMailtoUrl(tpl);
    const gmailWebUrl = buildGmailWebUrl(tpl);

    sendBtn.disabled = true;
    sendBtn.setAttribute('aria-busy','true');

    if(isAndroid()){
      setStatus("Mencoba membuka Gmail app...");
      try{ window.location.href = intentUrl; } catch(e){}

      let handled=false;
      const fallback = ()=>{
        if(handled) return;
        handled=true;
        setStatus("GAGAL...");
        try{ window.location.href = mailtoUrl; } catch(e){
          try{ window.open(gmailWebUrl,'_blank'); } catch(err){ setStatus("Gagal membuka email."); }
        }
        sendBtn.disabled=false;
        sendBtn.removeAttribute('aria-busy');
      };

      const onVisChange = ()=>{
        if(document.hidden){
          handled=true;
          setStatus("Compose terbuka.");
          sendBtn.disabled=false;
          sendBtn.removeAttribute('aria-busy');
        }
      };
      document.addEventListener('visibilitychange', onVisChange, {once:true});
      setTimeout(()=>{ if(!handled) fallback(); }, 1200);

    } else {
      setStatus("Membuka aplikasi email...");
      try{
        window.location.href = mailtoUrl;
        setTimeout(()=>{
          if(!document.hidden){
            try{ window.open(gmailWebUrl,"_blank"); } catch(e){}
          }
          sendBtn.disabled=false;
          sendBtn.removeAttribute('aria-busy');
        },900);
      }catch(err){
        try{ window.open(gmailWebUrl,"_blank"); } catch(e){}
        sendBtn.disabled=false;
        sendBtn.removeAttribute('aria-busy');
      }
    }
  });

