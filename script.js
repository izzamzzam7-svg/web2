(() => {
  "use strict";
  const $ = (s, r = document) => r.querySelector(s);
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- helper: bikin elemen aman (tanpa innerHTML dari data) ---------- */
  const el = (tag, cls, text) => {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  };
  const icon = (cls) => { const i = el("i", cls); i.setAttribute("aria-hidden", "true"); return i; };
  const safeUrl = (u) => (/^https?:\/\//i.test(u) ? u : "#");

  const buildLink = (c) => {
    const v = String(c.value || "").trim().replace(/^@/, "");
    switch (c.type) {
      case "whatsapp":  return "https://wa.me/" + v.replace(/\D/g, "");
      case "telegram":  return "https://t.me/" + encodeURIComponent(v);
      case "tiktok":    return "https://www.tiktok.com/@" + encodeURIComponent(v);
      case "instagram": return "https://www.instagram.com/" + encodeURIComponent(v);
      case "github":    return "https://github.com/" + encodeURIComponent(v);
      default:          return safeUrl(c.value);
    }
  };

  /* ---------- LOADER ---------- */
  const loader = $("#loader"), bar = $("#loaderBar"), pct = $("#loaderPct");
  let progress = 0, dataReady = false, pageReady = document.readyState === "complete", done = false;
  const nameBox = $("#loaderName");
  [..."Loading"].forEach((ch, i) => {
    const s = el("span", "", ch); s.style.animationDelay = i * 0.1 + "s"; nameBox.appendChild(s);
  });
  nameBox.firstChild && nameBox.removeChild(nameBox.firstChild); // hapus teks awal "Loading" (text node)
  addEventListener("load", () => { pageReady = true; });

  const tick = setInterval(() => {
    const target = dataReady && pageReady ? 100 : 88;
    progress = Math.min(target, progress + Math.max(1, (target - progress) * 0.08));
    bar.style.width = progress + "%";
    pct.textContent = Math.round(progress) + "%";
    if (progress >= 99.5 && !done) finish();
  }, 40);
  // pengaman: loader tidak akan nyangkut lebih dari 8 detik
  setTimeout(() => { if (!done) finish(); }, 8000);

  function finish() {
    done = true; clearInterval(tick);
    bar.style.width = "100%"; pct.textContent = "100%";
    setTimeout(() => {
      loader.classList.add("hide");
      document.body.classList.remove("is-loading");
      startReveal();
      startTyping();
      setTimeout(() => loader.remove(), 900);
    }, 350);
  }

  /* ---------- LOAD DATA ---------- */
  let aboutText = "";
  fetch("data.json", { cache: "no-cache" })
    .then((r) => { if (!r.ok) throw new Error("HTTP " + r.status); return r.json(); })
    .then((d) => { render(d); dataReady = true; })
    .catch((err) => {
      console.error("Gagal load data.json:", err);
      dataReady = true;
      document.body.insertAdjacentElement("afterbegin",
        Object.assign(el("p", "", "Gagal memuat data.json. Jalankan lewat Live Server / hosting (Vercel), jangan buka file langsung."),
        { style: "position:relative;z-index:5;padding:90px 20px 0;text-align:center;color:#f472b6" }));
    });

  function render(d) {
    const { site = {}, profile = {}, about = [], skills = [], partners = [], contacts = [], map = {} } = d;

    document.title = site.title || profile.name || "Portfolio";
    $("#brand").textContent = site.brand || profile.name || "";
    $("#brandSub").textContent = site.brandSub || "PORTFOLIO";
    $("#loaderLetter").textContent = (site.brand || profile.name || "Y").charAt(0).toUpperCase();

    // profile
    $("#name").textContent = profile.name || "";
    $("#username").textContent = profile.username ? "@" + profile.username.replace(/^@/, "") : "";
    $("#role").textContent = profile.role || "";
    $("#status").textContent = profile.status || "";
    $("#location").textContent = profile.location || "";
    const img = $("#avatar"), fb = $("#avatarFallback");
    fb.textContent = (profile.name || "?").charAt(0).toUpperCase();
    img.onerror = () => { img.hidden = true; fb.hidden = false; };
    img.src = profile.avatar || "";
    if (!profile.avatar) img.onerror();

    aboutText = about.join("\n\n");

    // skills
    const sl = $("#skillList");
    skills.forEach((s, i) => {
      const row = el("div", "item skill reveal");
      row.style.setProperty("--d", i * 0.07 + "s");
      const ic = icon("ic " + (s.icon || "fa-solid fa-code")); ic.style.color = s.color || "#f472b6";
      const bw = el("div", "bar"); const fill = el("i");
      fill.style.background = `linear-gradient(90deg,${s.from || "#a855f7"},${s.to || "#ec4899"})`;
      fill.dataset.w = Math.max(0, Math.min(100, Number(s.level) || 0));
      bw.appendChild(fill);
      row.append(ic, el("span", "nm", s.name), bw, el("span", "pct", (Number(s.level) || 0) + "%"));
      sl.appendChild(row);
    });

    // partners
    const pl = $("#partnerList");
    partners.forEach((p, i) => {
      const a = el("a", "item partner reveal"); a.href = safeUrl(p.url); a.target = "_blank"; a.rel = "noopener noreferrer";
      a.style.setProperty("--d", i * 0.08 + "s");
      const logo = el("div", "logo"); logo.style.setProperty("--c", p.color || "#a855f7");
      const fallback = () => { logo.textContent = ""; logo.appendChild(icon(p.icon || "fa-solid fa-robot")); };
      if (p.logo) {
        const im = el("img"); im.alt = p.name || ""; im.loading = "lazy"; im.onerror = fallback; im.src = p.logo; logo.appendChild(im);
      } else fallback();
      const info = el("div", "pinfo");
      info.append(el("small", "", p.company), el("h3", "", p.name), el("p", "", p.desc));
      a.append(logo, info, icon("fa-solid fa-arrow-up-right-from-square ext"));
      pl.appendChild(a);
    });

    // contacts
    const cl = $("#contactList");
    contacts.forEach((c, i) => {
      const a = el("a", "item contact reveal"); a.href = buildLink(c); a.target = "_blank"; a.rel = "noopener noreferrer";
      a.style.setProperty("--d", i * 0.07 + "s");
      const ci = el("div", "cic"); ci.style.background = c.bg || "#333"; ci.appendChild(icon(c.icon || "fa-solid fa-link"));
      a.append(ci, el("span", "t", c.name), icon("fa-solid fa-arrow-up-right-from-square ext"));
      cl.appendChild(a);
    });

    $("#mapLabel").textContent = map.label || "";
    $("#footerText").textContent = d.footer || "";
    initMap(map);
    initNav();
    // elemen yang dibuat setelah load awal ikut di-observe
    if (revealReady) observeAll();
  }

  /* ---------- MAP ---------- */
  function initMap(m) {
    const box = $("#map");
    if (typeof L === "undefined" || m.lat == null || m.lng == null) { box.style.display = "none"; return; }
    const map = L.map(box, { scrollWheelZoom: false, tap: false }).setView([m.lat, m.lng], m.zoom || 9);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 18, attribution: "© OpenStreetMap contributors"
    }).addTo(map);
    L.marker([m.lat, m.lng]).addTo(map);
    setTimeout(() => map.invalidateSize(), 400);
    addEventListener("resize", () => map.invalidateSize());
  }

  /* ---------- NAV / DRAWER ---------- */
  function initNav() {
    const burger = $("#burger"), drawer = $("#drawer"), overlay = $("#overlay");
    const toggle = (open) => {
      burger.setAttribute("aria-expanded", String(open));
      drawer.setAttribute("aria-hidden", String(!open));
      drawer.classList.toggle("open", open);
      overlay.classList.toggle("show", open);
      document.body.classList.toggle("menu-open", open);
      (open ? $("#drawerClose") : burger).focus({ preventScroll: true });
    };
    burger.onclick = () => toggle(!drawer.classList.contains("open"));
    $("#drawerClose").onclick = () => toggle(false);
    overlay.onclick = () => toggle(false);
    addEventListener("keydown", (e) => { if (e.key === "Escape" && drawer.classList.contains("open")) toggle(false); });
    $("#drawerLinks").addEventListener("click", (e) => { if (e.target.closest("a")) toggle(false); });

    // scroll spy
    const links = [...document.querySelectorAll("#drawerLinks a")];
    const secs = links.map((a) => $(a.getAttribute("href"))).filter(Boolean);
    const spy = new IntersectionObserver((es) => {
      es.forEach((en) => {
        if (en.isIntersecting) links.forEach((a) => a.classList.toggle("active", a.getAttribute("href") === "#" + en.target.id));
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    secs.forEach((s) => spy.observe(s));
  }

  /* ---------- REVEAL ---------- */
  let revealReady = false, io;
  function startReveal() {
    revealReady = true;
    io = new IntersectionObserver((es) => {
      es.forEach((en) => {
        if (!en.isIntersecting) return;
        const t = en.target; t.classList.add("in");
        t.querySelectorAll(".bar i").forEach((f) => (f.style.width = f.dataset.w + "%"));
        if (t.classList.contains("skill")) { const f = $(".bar i", t); if (f) f.style.width = f.dataset.w + "%"; }
        io.unobserve(t);
      });
    }, { threshold: 0.15 });
    observeAll();
  }
  function observeAll() {
    document.querySelectorAll(".reveal:not(.in), .title:not(.in)").forEach((n) => io.observe(n));
  }

  /* ---------- TYPING (About) ---------- */
  function startTyping() {
    const out = $("#aboutText"), card = $(".about-card");
    if (!aboutText) return;
    if (reduce) { out.textContent = aboutText; return; }
    let started = false;
    const go = () => {
      if (started) return; started = true;
      let i = 0;
      const step = () => {
        i += 2; out.textContent = aboutText.slice(0, i);
        if (i < aboutText.length) setTimeout(step, 22); else out.textContent = aboutText;
      };
      step();
    };
    const o = new IntersectionObserver((es) => { if (es[0].isIntersecting) { go(); o.disconnect(); } }, { threshold: 0.2 });
    o.observe(card);
  }

  /* ---------- SPARKLES (partikel kecil) ---------- */
  (function sparks() {
    const cv = $("#sparks"); if (!cv || reduce) return;
    const ctx = cv.getContext("2d"); let w, h, dots = [];
    const colors = ["#facc15", "#38bdf8", "#f472b6", "#a78bfa"];
    const size = () => {
      const r = devicePixelRatio || 1; w = innerWidth; h = innerHeight;
      cv.width = w * r; cv.height = h * r; ctx.setTransform(r, 0, 0, r, 0, 0);
    };
    size(); addEventListener("resize", size);
    const n = innerWidth < 600 ? 28 : 50;
    for (let i = 0; i < n; i++) dots.push({
      x: Math.random() * w, y: Math.random() * h, r: Math.random() * 1.8 + .6,
      vy: -(Math.random() * .25 + .08), vx: (Math.random() - .5) * .15,
      c: colors[(Math.random() * colors.length) | 0], p: Math.random() * 6.28
    });
    (function loop(t) {
      if (!document.hidden) {
        ctx.clearRect(0, 0, w, h);
        dots.forEach((d) => {
          d.x += d.vx; d.y += d.vy;
          if (d.y < -5) { d.y = h + 5; d.x = Math.random() * w; }
          ctx.globalAlpha = .35 + .35 * Math.sin(t / 700 + d.p);
          ctx.fillStyle = d.c; ctx.shadowColor = d.c; ctx.shadowBlur = 8;
          ctx.beginPath(); ctx.arc(d.x, d.y, d.r, 0, 6.28); ctx.fill();
        });
      }
      requestAnimationFrame(loop);
    })(0);
  })();
})();
