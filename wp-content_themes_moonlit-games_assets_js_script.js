/* ============================================================
   Moonlit Games — vanilla JS (WordPress build)
   ============================================================ */

// Image base for this WordPress theme (assets/img/). Set by chrome.js from the
// localized MLG object; falls back to the original relative folder if missing.
// Defined first so the demo data arrays below can reference it.
const IMG = (typeof window !== 'undefined' && window.__MLG_IMG__) ? window.__MLG_IMG__ : 'images/';

const ICONS = {
  clock: '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
  moon: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>',
  sun: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>',
};

const trendingHeadlines = [
  'Elden Ring: Shadow of the Erdtree breaks DLC sales records worldwide',
  'GTA 6 release date reportedly set for Fall 2025 according to insider sources',
  'Steam Summer Sale 2026: Best deals under $10 you cannot miss',
  'Cyberpunk 2077 sequel officially confirmed by CD Projekt Red',
  'PlayStation 6 prototype specs leak online ahead of schedule',
  'Nintendo Switch 2 pre-orders sell out in under 10 minutes',
];

const stories = [
  { number: '01', category: 'NEWS',    categoryColor: 'var(--accent-secondary)', headline: 'GTA 6 Trailer Breaks All-Time Viewership Records Within 24 Hours', timestamp: '3 hours ago',  image: IMG + 'card-gta6.jpg' },
  { number: '02', category: 'REVIEW',  categoryColor: 'var(--accent-primary)',   headline: 'Elden Ring: Shadow of the Erdtree — A Masterpiece Expansion',        timestamp: '5 hours ago',  image: IMG + 'card-elden-ring.jpg' },
  { number: '03', category: 'GUIDE',   categoryColor: '#f59e0b',                 headline: 'Helldivers 2: The Ultimate Loadout Guide for 2026',                  timestamp: '8 hours ago',  image: IMG + 'card-helldivers.jpg' },
  { number: '04', category: 'FEATURE', categoryColor: '#a78bfa',                 headline: 'How AI Is Revolutionizing Game Development in 2026',                 timestamp: '12 hours ago', image: IMG + 'card-ai-gaming.jpg' },
  { number: '05', category: 'NEWS',    categoryColor: 'var(--accent-secondary)', headline: 'Steam Deck 2: Everything We Know About the Next-Gen Handheld',       timestamp: '1 day ago',    image: IMG + 'card-steam-deck.jpg' },
  { number: '06', category: 'REVIEW',  categoryColor: 'var(--accent-primary)',   headline: 'Hades II Early Access — Supergiant Strikes Gold Again',             timestamp: '1 day ago',    image: IMG + 'card-hades2.jpg' },
  { number: '07', category: 'NEWS',    categoryColor: 'var(--accent-secondary)', headline: 'Nintendo Switch 2 Pre-Orders Sell Out in Under 10 Minutes',         timestamp: '1 day ago',    image: IMG + 'thumb-news-4.jpg' },
  { number: '08', category: 'ESPORTS', categoryColor: '#f59e0b',                 headline: 'The International 2026 Prize Pool Smashes the $50M Barrier',         timestamp: '2 days ago',   image: IMG + 'thumb-news-2.jpg' },
  { number: '09', category: 'HARDWARE',categoryColor: '#a78bfa',                 headline: 'AMD Radeon RX 8900 XT Benchmarks Leak: An RTX 5090 Killer?',        timestamp: '2 days ago',   image: IMG + 'thumb-news-3.jpg' },
  { number: '10', category: 'FEATURE', categoryColor: '#a78bfa',                 headline: 'The Evolution of Soulslike Games From Demon\'s Souls to Today',      timestamp: '3 days ago',   image: IMG + 'thumb-news-1.jpg' },
];

const featuredCards = [
  { id: 1, title: 'Elden Ring: Shadow of the Erdtree', excerpt: 'FromSoftware delivers yet another masterpiece expansion that pushes the boundaries of what DLC can achieve. The Shadow Realm is hauntingly beautiful, and every corner rewards the curious explorer.', image: IMG + 'card-elden-ring.jpg', category: 'REVIEW', categoryColor: 'var(--accent-primary)', score: '9.5', author: 'Alex Chen', authorAvatar: IMG + 'avatar-alex.jpg', timestamp: '5 hours ago', span: 'hero' },
  { id: 2, title: 'GTA 6 Trailer Breaks Records', excerpt: 'The first official trailer for Grand Theft Auto VI has shattered viewership records across all platforms.', image: IMG + 'card-gta6.jpg', category: 'NEWS', categoryColor: 'var(--accent-secondary)', author: 'Sarah Kim', authorAvatar: IMG + 'avatar-sarah.jpg', timestamp: '3 hours ago', span: 'single' },
  { id: 3, title: 'The Rise of AI in Game Development', excerpt: 'From procedural generation to AI-powered NPCs, artificial intelligence is transforming how games are made and played.', image: IMG + 'card-ai-gaming.jpg', category: 'FEATURE', categoryColor: '#a78bfa', author: 'Sarah Kim', authorAvatar: IMG + 'avatar-sarah.jpg', timestamp: '1 day ago', span: 'single' },
  { id: 4, title: 'Helldivers 2: Best Loadouts for 2026', excerpt: 'Our comprehensive guide to the most effective weapon combinations for every mission type.', image: IMG + 'card-helldivers.jpg', category: 'GUIDE', categoryColor: '#f59e0b', author: 'Alex Chen', authorAvatar: IMG + 'avatar-alex.jpg', timestamp: '2 days ago', span: 'single' },
  { id: 5, title: 'Hades II Early Access Review', excerpt: 'Supergiant Games returns to the underworld with a spellbinding sequel that expands on everything fans loved.', image: IMG + 'card-hades2.jpg', category: 'REVIEW', categoryColor: 'var(--accent-primary)', score: '8.0', author: 'Sarah Kim', authorAvatar: IMG + 'avatar-sarah.jpg', timestamp: '1 day ago', span: 'single' },
  { id: 6, title: 'Steam Deck 2 Rumors and Leaks', excerpt: "Everything we know about Valve's next-generation handheld console, from OLED displays to improved battery life.", image: IMG + 'card-steam-deck.jpg', category: 'NEWS', categoryColor: 'var(--accent-secondary)', author: 'Alex Chen', authorAvatar: IMG + 'avatar-alex.jpg', timestamp: '4 hours ago', span: 'single' },
];

const allNewsItems = [
  { id: 1,  category: 'NEWS',     categoryColor: 'var(--accent-secondary)', headline: 'Final Fantasy VII Rebirth Set to Redefine the Remake Trilogy', excerpt: 'Square Enix promises the biggest open-world experience in the series yet.', thumbnail: IMG + 'thumb-news-1.jpg', timestamp: '1 hour ago' },
  { id: 2,  category: 'ESPORTS',  categoryColor: '#f59e0b',                 headline: 'The International 2026 Prize Pool Reaches $50 Million Milestone', excerpt: "Dota 2's premier tournament continues to break crowdfunding records.", thumbnail: IMG + 'thumb-news-2.jpg', timestamp: '2 hours ago' },
  { id: 3,  category: 'HARDWARE', categoryColor: '#a78bfa',                 headline: 'Razer Unveils Ultra-Low Latency Wireless Keyboard for Competitive Gaming', excerpt: 'The new Huntsman V3 Pro features optical switches with 0.1ms response time.', thumbnail: IMG + 'thumb-news-3.jpg', timestamp: '3 hours ago' },
  { id: 4,  category: 'NEWS',     categoryColor: 'var(--accent-secondary)', headline: 'New Open-World RPG from Former Witcher Developers Announced', excerpt: 'Rebel Wolves studio reveals their debut title with stunning concept art.', thumbnail: IMG + 'thumb-news-4.jpg', timestamp: '4 hours ago' },
  { id: 5,  category: 'REVIEW',   categoryColor: 'var(--accent-primary)',   headline: 'Hades II Early Access: Worth Playing Now or Waiting?', excerpt: "We dive deep into Supergiant's latest to help you decide.", thumbnail: IMG + 'card-hades2.jpg', timestamp: '5 hours ago' },
  { id: 6,  category: 'NEWS',     categoryColor: 'var(--accent-secondary)', headline: 'Microsoft Announces Game Pass Price Changes for 2026', excerpt: 'The subscription service sees its first price increase in three years.', thumbnail: IMG + 'card-steam-deck.jpg', timestamp: '6 hours ago' },
  { id: 7,  category: 'GUIDE',    categoryColor: '#f59e0b',                 headline: 'Palworld: How to Build the Ultimate Base in the 1.0 Update', excerpt: 'Everything you need to know about the new base-building mechanics.', thumbnail: IMG + 'card-helldivers.jpg', timestamp: '8 hours ago' },
  { id: 8,  category: 'FEATURE',  categoryColor: '#a78bfa',                 headline: "The Evolution of Soulslike Games: From Demon's Souls to 2026", excerpt: 'Tracing the genre that spawned a thousand imitators and a few masterpieces.', thumbnail: IMG + 'card-elden-ring.jpg', timestamp: '10 hours ago' },
  { id: 9,  category: 'NEWS',     categoryColor: 'var(--accent-secondary)', headline: 'Marvel Rivals Season 2 Adds Four New Heroes to the Roster', excerpt: 'The hero shooter continues to expand with fan-favorite characters.', thumbnail: IMG + 'card-gta6.jpg', timestamp: '12 hours ago' },
  { id: 10, category: 'REVIEW',   categoryColor: 'var(--accent-primary)',   headline: 'Black Myth: Wukong — A Visual Spectacle with Some Rough Edges', excerpt: "Game Science's ambitious action RPG is stunning but not without flaws.", thumbnail: IMG + 'thumb-news-1.jpg', timestamp: '1 day ago' },
  { id: 11, category: 'NEWS',     categoryColor: 'var(--accent-secondary)', headline: 'Epic Games Store Free Games for July 2026 Revealed', excerpt: "This month's lineup includes three AAA titles and two indie gems.", thumbnail: IMG + 'thumb-news-3.jpg', timestamp: '1 day ago' },
  { id: 12, category: 'ESPORTS',  categoryColor: '#f59e0b',                 headline: 'League of Legends Worlds 2026 Location Confirmed: Seoul', excerpt: 'South Korea will host the biggest esports event of the year.', thumbnail: IMG + 'thumb-news-2.jpg', timestamp: '1 day ago' },
  { id: 13, category: 'NEWS',     categoryColor: 'var(--accent-secondary)', headline: 'Nintendo Direct: Zelda Wind Waker HD Coming to Switch 2', excerpt: 'The classic GameCube adventure gets a stunning remaster for the new console.', thumbnail: IMG + 'thumb-news-4.jpg', timestamp: '2 days ago' },
  { id: 14, category: 'HARDWARE', categoryColor: '#a78bfa',                 headline: 'AMD Radeon RX 8900 XT Benchmarks Leak: RTX 5090 Killer?', excerpt: 'Early benchmarks suggest AMD might finally take the performance crown.', thumbnail: IMG + 'card-steam-deck.jpg', timestamp: '2 days ago' },
  { id: 15, category: 'GUIDE',    categoryColor: '#f59e0b',                 headline: 'Elden Ring: How to Find All 12 New Bosses in Shadow of the Erdtree', excerpt: 'A complete walkthrough of every new boss location in the expansion.', thumbnail: IMG + 'card-elden-ring.jpg', timestamp: '2 days ago' },
  { id: 16, category: 'NEWS',     categoryColor: 'var(--accent-secondary)', headline: 'Star Wars Jedi: Survivor Sequel Teased by Respawn', excerpt: "Cal Kestis' journey may continue in a third installment.", thumbnail: IMG + 'card-hades2.jpg', timestamp: '3 days ago' },
];

const ITEMS_PER_PAGE = 8;
// Card/tile links. In WordPress there is no single fixed review.html; individual
// posts have their own permalinks. Default to home so demo tiles stay clickable.
const REVIEW_URL = (window.MLG && window.MLG.home) ? window.MLG.home : (window.__MLG_BASE__ || '');

/* ---------- NEW SECTION DATA ---------- */
const latestGames = [
  { title: 'Eldrim: Ascension', genre: 'Action RPG', platforms: ['PC', 'PS5', 'XBOX'], score: '9.2', image: IMG + 'card-elden-ring.jpg', date: '12 July 2026' },
  { title: 'Neon Drift 2077', genre: 'Racing', platforms: ['PC', 'PS5'], score: '8.6', image: IMG + 'card-gta6.jpg', date: '11 July 2026' },
  { title: 'Helldivers: Vanguard', genre: 'Shooter', platforms: ['PC', 'PS5'], score: '9.0', image: IMG + 'card-helldivers.jpg', date: '10 July 2026' },
  { title: 'Underworld Odyssey', genre: 'Roguelike', platforms: ['PC', 'SWITCH'], score: '8.9', image: IMG + 'card-hades2.jpg', date: '09 July 2026' },
  { title: 'Silicon Minds', genre: 'Strategy', platforms: ['PC'], score: '8.3', image: IMG + 'card-ai-gaming.jpg', date: '08 July 2026' },
  { title: 'Deck Runner X', genre: 'Handheld', platforms: ['PC', 'SWITCH'], score: '8.1', image: IMG + 'card-steam-deck.jpg', date: '07 July 2026' },
];

const slotReviews = [
  { title: 'Gates of Olympus', provider: 'Pragmatic Play', rtp: '96.5%', volatility: 'High', score: 9.1, image: IMG + 'card-elden-ring.jpg', tag: 'HOT' },
  { title: 'Sweet Bonanza', provider: 'Pragmatic Play', rtp: '96.4%', volatility: 'Medium', score: 8.7, image: IMG + 'card-gta6.jpg', tag: 'NEW' },
  { title: 'Book of Dead', provider: "Play'n GO", rtp: '94.2%', volatility: 'High', score: 8.4, image: IMG + 'card-hades2.jpg', tag: '' },
  { title: 'Starburst XXXtreme', provider: 'NetEnt', rtp: '96.3%', volatility: 'High', score: 8.9, image: IMG + 'card-ai-gaming.jpg', tag: 'TOP' },
];

const gameReviews = [
  { title: 'Elden Ring: Shadow of the Erdtree', category: 'RPG', excerpt: 'A masterclass in world design that rewards every hour you sink into it.', score: '9.5', image: IMG + 'card-elden-ring.jpg', author: 'Alex Chen', date: '5 hours ago' },
  { title: 'Helldivers 2: Galactic War', category: 'Action', excerpt: 'Chaotic co-op that turns every mission into an unforgettable story.', score: '9.0', image: IMG + 'card-helldivers.jpg', author: 'Sarah Kim', date: '1 day ago' },
  { title: 'Hades II Early Access', category: 'Indie', excerpt: 'Supergiant refines its formula into something even more addictive.', score: '8.8', image: IMG + 'card-hades2.jpg', author: 'Sarah Kim', date: '1 day ago' },
  { title: 'Silicon Minds', category: 'Strategy', excerpt: 'A deep, cerebral 4X that respects your time and your intellect.', score: '8.3', image: IMG + 'card-ai-gaming.jpg', author: 'Alex Chen', date: '2 days ago' },
  { title: 'GTA VI: First Impressions', category: 'Action', excerpt: 'The most ambitious open world Rockstar has ever attempted.', score: '9.3', image: IMG + 'card-gta6.jpg', author: 'Alex Chen', date: '3 hours ago' },
  { title: 'Underworld Odyssey', category: 'Indie', excerpt: 'A roguelike that wears its inspirations proudly while carving its own path.', score: '8.6', image: IMG + 'card-steam-deck.jpg', author: 'Sarah Kim', date: '4 days ago' },
  { title: 'Baldur\'s Successor', category: 'RPG', excerpt: 'Reactive storytelling that makes every decision feel genuinely weighty.', score: '9.1', image: IMG + 'card-elden-ring.jpg', author: 'Alex Chen', date: '5 days ago' },
  { title: 'Frontline Tactics', category: 'Strategy', excerpt: 'Turn-based combat honed to a razor edge, if a little unforgiving.', score: '8.0', image: IMG + 'card-helldivers.jpg', author: 'Sarah Kim', date: '6 days ago' },
];

const newsReviews = [
  { title: 'GTA 6 Trailer Breaks All-Time Viewership Records', category: 'Industry', excerpt: 'Rockstar\'s reveal shattered records within 24 hours of going live.', image: IMG + 'card-gta6.jpg', date: '3 hours ago', read: '4 min' },
  { title: 'The International 2026 Prize Pool Hits $50M', category: 'Esports', excerpt: 'Dota 2\'s flagship event once again rewrites the crowdfunding record books.', image: IMG + 'thumb-news-2.jpg', date: '5 hours ago', read: '3 min' },
  { title: 'Razer Unveils Ultra-Low Latency Wireless Keyboard', category: 'Hardware', excerpt: 'The Huntsman V3 Pro promises a blazing 0.1ms response time for pros.', image: IMG + 'thumb-news-3.jpg', date: '8 hours ago', read: '5 min' },
  { title: 'Nintendo Switch 2 Pre-Orders Sell Out in Minutes', category: 'Releases', excerpt: 'Demand for the new console far outstripped launch-day supply worldwide.', image: IMG + 'card-steam-deck.jpg', date: '10 hours ago', read: '2 min' },
  { title: 'League of Legends Worlds 2026 Heads to Seoul', category: 'Esports', excerpt: 'South Korea will host the biggest esports spectacle of the year.', image: IMG + 'thumb-news-4.jpg', date: '1 day ago', read: '3 min' },
  { title: 'AMD Radeon RX 8900 XT Benchmarks Leak Online', category: 'Hardware', excerpt: 'Early numbers hint AMD may finally challenge for the performance crown.', image: IMG + 'card-ai-gaming.jpg', date: '1 day ago', read: '6 min' },
  { title: 'Cyberpunk 2077 Sequel Officially Confirmed', category: 'Industry', excerpt: 'CD Projekt Red greenlights the next chapter in the Night City saga.', image: IMG + 'card-elden-ring.jpg', date: '2 days ago', read: '4 min' },
  { title: 'Marvel Rivals Season 2 Release Date Announced', category: 'Releases', excerpt: 'Four new heroes and a fresh map arrive in the next major update.', image: IMG + 'card-gta6.jpg', date: '2 days ago', read: '3 min' },
];

const indieGames = [
  { title: 'Hollow Depths', studio: 'Lumen Forge', excerpt: 'A hand-drawn metroidvania about descending into a bioluminescent abyss, where every shadow hides a secret and every save point feels earned.', genre: 'Metroidvania', score: '9.4', image: IMG + 'card-hades2.jpg', featured: true },
  { title: 'Paper Kingdoms', studio: 'Tiny Anvil', excerpt: 'A cozy papercraft strategy game with surprising depth.', genre: 'Strategy', score: '8.8', image: IMG + 'card-ai-gaming.jpg' },
  { title: 'Neon Alleys', studio: 'Sootstorm', excerpt: 'A synthwave roguelike that turns every run into a music video.', genre: 'Roguelike', score: '8.6', image: IMG + 'card-steam-deck.jpg' },
  { title: 'Grove Keeper', studio: 'Fernlight', excerpt: 'A meditative farming sim about restoring an enchanted forest.', genre: 'Simulation', score: '9.0', image: IMG + 'card-helldivers.jpg' },
];

const el = (tag, cls) => { const n = document.createElement(tag); if (cls) n.className = cls; return n; };

/* Standardized category badge classes (task 4).
   Every category maps to one fixed, theme-aware colour scheme via CSS. */
const catClass = (category) => 'cat-' + String(category || '').toLowerCase().replace(/[^a-z0-9]/g, '');
const badge = (category) => `<span class="category-badge ${catClass(category)}">${category}</span>`;

/* ---------- THEME (task 12) ---------- */
function initTheme() {
  const toggle = document.getElementById('theme-toggle');
  const iconEl = document.getElementById('theme-icon');
  const labelEl = document.getElementById('theme-label');

  const getStored = () => { try { return localStorage.getItem('mlg-theme'); } catch(e) { return null; } };
  const setStored = (v) => { try { localStorage.setItem('mlg-theme', v); } catch(e) {} };

  const apply = (theme) => {
    document.documentElement.setAttribute('data-theme', theme);
    // Button shows the action (what you'll switch TO)
    if (iconEl) iconEl.innerHTML = theme === 'dark' ? ICONS.sun : ICONS.moon;
    if (labelEl) labelEl.textContent = theme === 'dark' ? 'Light Mode' : 'Dark Mode';
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', theme === 'dark' ? '#10151f' : '#f4f6fb');
  };

  let current = getStored() || 'dark';
  apply(current);

  if (toggle) {
    toggle.addEventListener('click', () => {
      current = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      apply(current);
      setStored(current);
    });
  }
}

/* ---------- FOOTER YEAR (task 10) ---------- */
function initFooterYear() {
  const y = document.getElementById('footer-year');
  if (y) y.textContent = new Date().getFullYear();
}

/* ---------- LANGUAGE SWITCHER (Polylang) ----------
   Toggles the flag dropdown above the theme toggle. Renders only when the
   switcher markup exists (Polylang active with 2+ languages). */
function initLangSwitcher() {
  const wrap = document.getElementById('lang-switcher');
  const btn = document.getElementById('lang-switcher-toggle');
  if (!wrap || !btn) return;

  const closeMenu = () => {
    wrap.classList.remove('open');
    btn.setAttribute('aria-expanded', 'false');
  };
  const openMenu = () => {
    wrap.classList.add('open');
    btn.setAttribute('aria-expanded', 'true');
  };

  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (wrap.classList.contains('open')) { closeMenu(); } else { openMenu(); }
  });

  // Click anywhere outside closes it.
  document.addEventListener('click', (e) => {
    if (wrap.classList.contains('open') && !wrap.contains(e.target)) { closeMenu(); }
  });

  // Escape closes it.
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { closeMenu(); }
  });
}

/* ---------- SCANLINE OVERLAY ---------- */
function initScanlineOverlay() {
  const canvas = document.getElementById('scanline-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  let glitchLineY = 0;
  const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
  resize();
  window.addEventListener('resize', resize);
  const draw = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.03)';
    for (let y = 0; y < canvas.height; y += 4) ctx.fillRect(0, y, canvas.width, 1);
    glitchLineY += 0.5;
    if (glitchLineY > canvas.height) glitchLineY = 0;
    const g = ctx.createLinearGradient(0, glitchLineY - 10, 0, glitchLineY + 10);
    g.addColorStop(0, 'rgba(141, 255, 31, 0)');
    g.addColorStop(0.5, 'rgba(141, 255, 31, 0.04)');
    g.addColorStop(1, 'rgba(141, 255, 31, 0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, glitchLineY - 10, canvas.width, 20);
    const vg = ctx.createRadialGradient(canvas.width/2, canvas.height/2, canvas.width*0.3, canvas.width/2, canvas.height/2, canvas.width*0.7);
    vg.addColorStop(0, 'rgba(0, 0, 0, 0)');
    vg.addColorStop(1, 'rgba(16, 21, 31, 0.4)');
    ctx.fillStyle = vg;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    requestAnimationFrame(draw);
  };
  draw();
}

/* ---------- SIDEBAR ---------- */
function initSidebar() {
  const sidebar = document.getElementById('sidebar');
  const topbar = document.getElementById('topbar');
  const main = document.getElementById('main-content');
  const toggle = document.getElementById('sidebar-toggle');
  const chevron = document.getElementById('toggle-chevron');
  const tooltip = document.getElementById('sidebar-tooltip');
  const menuBtn = document.getElementById('topbar-menu-btn');
  const backdrop = document.getElementById('sidebar-backdrop');

  // Subpages (review/legal) have no sidebar — nothing to wire up.
  if (!sidebar || !topbar || !main || !toggle || !chevron) return;

  // Persist collapsed state across pages (default: open). IMPORTANT (task 9)
  const getStoredCollapsed = () => { try { return localStorage.getItem('mlg-sidebar-collapsed') === 'true'; } catch(e) { return false; } };
  const setStoredCollapsed = (v) => { try { localStorage.setItem('mlg-sidebar-collapsed', v ? 'true' : 'false'); } catch(e) {} };

  let collapsed = getStoredCollapsed();
  const chevronLeft = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>';
  const chevronRight = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>';

  const applyState = () => {
    sidebar.classList.toggle('collapsed', collapsed);
    topbar.classList.toggle('sidebar-collapsed', collapsed);
    main.classList.toggle('sidebar-collapsed', collapsed);
    chevron.innerHTML = collapsed ? chevronRight : chevronLeft;
    toggle.setAttribute('aria-label', collapsed ? 'Expand sidebar' : 'Collapse sidebar');
    // Keep the pre-paint html attribute in sync (used to avoid flash on next load)
    if (collapsed) document.documentElement.setAttribute('data-sidebar', 'collapsed');
    else document.documentElement.removeAttribute('data-sidebar');
    if (collapsed) hideTooltip();
  };
  toggle.addEventListener('click', () => { collapsed = !collapsed; setStoredCollapsed(collapsed); applyState(); });

  // Mobile drawer — toggle open/close, animate hamburger to X (task 11)
  const setMobile = (open) => {
    sidebar.classList.toggle('mobile-open', open);
    backdrop.classList.toggle('visible', open);
    if (menuBtn) {
      menuBtn.classList.toggle('is-open', open);
      menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    }
  };
  const openMobile = () => setMobile(true);
  const closeMobile = () => setMobile(false);
  if (menuBtn) menuBtn.addEventListener('click', () => setMobile(!sidebar.classList.contains('mobile-open')));
  if (backdrop) backdrop.addEventListener('click', closeMobile);

  const navItems = document.querySelectorAll('#sidebar-nav .nav-item');
  navItems.forEach((item) => {
    item.addEventListener('click', () => {
      navItems.forEach((n) => n.classList.remove('active'));
      item.classList.add('active');
      if (window.innerWidth <= 991) closeMobile();
    });
  });

  const showTooltip = (target, label) => {
    const rect = target.getBoundingClientRect();
    tooltip.textContent = label;
    tooltip.style.left = rect.right + 8 + 'px';
    tooltip.style.top = rect.top + rect.height / 2 + 'px';
    tooltip.classList.add('visible');
  };
  const hideTooltip = () => tooltip.classList.remove('visible');
  document.querySelectorAll('.sidebar .nav-item, .sidebar .theme-toggle, .sidebar .lang-switcher-toggle').forEach((item) => {
    item.addEventListener('mouseenter', () => {
      if (collapsed && window.innerWidth > 991) showTooltip(item, item.getAttribute('data-label'));
    });
    item.addEventListener('mouseleave', hideTooltip);
  });

  applyState();
}

/* ---------- CLOCK + TICKER ---------- */
function initClock() {
  const clockEl = document.getElementById('topbar-clock');
  if (!clockEl) return;
  const update = () => {
    const now = new Date();
    clockEl.textContent = now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };
  update();
  setInterval(update, 1000);
}
function initTicker() {
  const track = document.getElementById('ticker-track');
  if (!track) return;
  // Dynamic trending: interleaved latest posts (3 per type, a,b,a,b,a,b) from
  // the localized MLG.trending; fall back to the static headlines if absent.
  const trending = (window.MLG && Array.isArray(window.MLG.trending) && window.MLG.trending.length)
    ? window.MLG.trending
    : trendingHeadlines.map((h) => ({ title: h, url: REVIEW_URL }));
  const makeItem = (item) => {
    const a = el('a', 'ticker-item font-body');
    a.href = item.url || REVIEW_URL;
    a.textContent = item.title || String(item);
    const sep = el('span', 'ticker-sep');
    sep.textContent = '•';
    track.appendChild(a);
    track.appendChild(sep);
  };
  // Duplicate the list so the -50% marquee loops seamlessly
  [...trending, ...trending].forEach(makeItem);

  // Safari sometimes doesn't start a CSS animation that was applied to an empty
  // element before its content was injected (the animation only "wakes up" on a
  // repaint, e.g. when you hover). Re-apply the animation class after populating
  // the track and force a reflow so it starts immediately in all browsers.
  track.classList.remove('animate-marquee');
  // eslint-disable-next-line no-unused-expressions
  void track.offsetWidth; // force reflow
  track.classList.add('animate-marquee');
}

/* ---------- PARTNERS ---------- */
function renderPartners() {
  const partners = [
    'f4ca1c_0acb077d7f474af4b1da746f9f5a0dbf~mv2.png',
    'f4ca1c_0fff9536c43f4b329be5b8f24f6174e1~mv2.png',
    'f4ca1c_2254cef39d6b4260b36889cd473202ed~mv2.png',
    'f4ca1c_2cbd88fa685148fdb7fa57cd66b439bb~mv2.png',
    'f4ca1c_2f43753949bf4f568c9a2786b39e220a~mv2.png',
    'f4ca1c_2fa1822d62aa4b099206c4fbeae6693c~mv2.png',
    'f4ca1c_384fcb8e9f2d4781b8425377a128db0a~mv2.png',
    'f4ca1c_3c11fa9fd0ae4c15a6948199ef1ab78c~mv2.png',
    'f4ca1c_5e5b536e7798486c87c0da673769cd9f~mv2.png',
    'f4ca1c_729d4f6d89a0438f9b5f8f266295008f~mv2.png',
    'f4ca1c_77da14ea960c4e31b4fdc37f8e89a0ab~mv2.png',
    'f4ca1c_9037dfe5a3784281a7ce926a9f82bdfa~mv2.png',
    'f4ca1c_9369608dc4f84f0f994a14f560b5588a~mv2.png',
    'f4ca1c_939ca0f83581472191e8348f11c906bc~mv2.png',
    'f4ca1c_94b54e2620544a248da042208c452a4a~mv2.png',
    'aws-official.png',
    'f4ca1c_a77f664ac69544d6b428d342f8ada242~mv2.png',
    'f4ca1c_c2b47423ac8b4b30a0775e270c196770~mv2.png',
    'f4ca1c_e47fe5f925314148b714a288709b89d2~mv2.png',
    'f4ca1c_e9a61307da7a4170ad6c9577f2f5b281~mv2.png',
  ];
  const collab = [
    '3e6f84_3306eb95e99e48f3bbfacd87615ff565~mv2.png',
    '3e6f84_8e5e86ab642b4ea4b6af8fe8655c3912~mv2.png',
    '3e6f84_b99ac9174b404266ad26c3a820528838~mv2.png',
    '3e6f84_c1e59b21139b4201bf5367071e59f2d7~mv2.png',
    '3e6f84_cc7874f46f7c43b482c0fd36a3c9c38a~mv2.png',
    '3e6f84_ce6492ffbcbd4ad5a65ad122c8124d65~mv2.png',
    'Dynos.png',
    'Gaspode.jpg',
    'Logo_NFT_Club.png',
    'Wolves.png',
  ];
  const grid = document.getElementById('partners-grid');
  const cGrid = document.getElementById('collab-grid');
  if (grid) grid.innerHTML = partners.map((p) => `<div class="partner-chip${p === 'aws-official.png' ? ' partner-chip-aws' : ''}"><img src="${IMG}partners/${p}" alt="Partner logo" loading="lazy" /></div>`).join('');
  if (cGrid) cGrid.innerHTML = collab.map((p) => `<div class="partner-chip partner-chip-collab"><img src="${IMG}collab/${p}" alt="Collaborator logo" loading="lazy" /></div>`).join('');
}

/* ---------- INDIE SPOTLIGHT ---------- */
function renderIndieSpotlight() {
  const grid = document.getElementById('indie-grid');
  if (!grid) return;
  const featured = indieGames.find((g) => g.featured) || indieGames[0];
  const rest = indieGames.filter((g) => g !== featured).slice(0, 3);

  // Wide cinematic hero with text overlaid on the artwork
  const heroHTML = `
    <a class="indie-hero" href="${REVIEW_URL}">
      <img class="indie-hero-img" src="${featured.image}" alt="${featured.title}" />
      <div class="indie-hero-shade"></div>
      <div class="indie-hero-content">
        <span class="indie-hero-badge">Editor's Choice</span>
        <div class="indie-hero-bottom">
          <div class="indie-hero-text">
            <span class="indie-hero-genre">${featured.genre} · ${featured.studio}</span>
            <h3 class="indie-hero-title">${featured.title}</h3>
            <p class="indie-hero-excerpt">${featured.excerpt}</p>
            <span class="indie-hero-link">Read the full review
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
            </span>
          </div>
          <div class="indie-hero-scorewrap">
            <span class="indie-hero-score font-display">${featured.score}</span>
            <span class="indie-hero-scoremax">/10</span>
          </div>
        </div>
      </div>
    </a>`;

  // Row of poster cards below the hero
  const postersHTML = rest.map((g, i) => `
    <a class="indie-poster" href="${REVIEW_URL}">
      <div class="indie-poster-media">
        <img src="${g.image}" alt="${g.title}" />
        <span class="indie-poster-num">0${i + 2}</span>
        <span class="indie-poster-score">${g.score}</span>
      </div>
      <div class="indie-poster-body">
        <span class="indie-poster-genre">${g.genre}</span>
        <h4 class="indie-poster-title">${g.title}</h4>
        <span class="indie-poster-studio">${g.studio}</span>
      </div>
    </a>`).join('');

  grid.innerHTML = heroHTML + `<div class="indie-poster-row">${postersHTML}</div>`;
  const posterRow = grid.querySelector('.indie-poster-row');
  if (posterRow && typeof enableDragScroll === 'function') enableDragScroll(posterRow);
}

/* ---------- TOP STORIES ---------- */
function renderTopStories() {
  const wrap = document.getElementById('stories-scroll');
  if (!wrap) return;
  stories.forEach((story, index) => {
    const card = el('a', 'story-card');
    card.href = REVIEW_URL;
    card.innerHTML = `
      <span class="story-number font-display">${story.number}</span>
      <div class="story-thumb"><img src="${story.image}" alt="${story.headline}" /></div>
      <div class="story-content">
        <span class="category-badge story-badge ${catClass(story.category)}">${story.category}</span>
        <h3 class="story-headline line-clamp-2">${story.headline}</h3>
        <span class="story-timestamp">${story.timestamp}</span>
      </div>`;
    wrap.appendChild(card);
  });
  initStoriesProgress(wrap);
}
function initStoriesProgress(track) {
  const bar = document.getElementById('stories-progress-bar');
  const rail = document.getElementById('stories-progress');
  if (!bar || !rail) return;
  const update = () => {
    const maxScroll = track.scrollWidth - track.clientWidth;
    // Only surface the slider when the track actually overflows and there is
    // something to scrub. When everything fits (e.g. a single story card), the
    // rail is pointless clutter, so hide it. Runs on load, scroll and resize,
    // so it re-evaluates as content or the viewport changes.
    const needsSlider = maxScroll > 1;
    // Reveal via a class so the rail is hidden by default in CSS and only shows
    // once JS confirms the track overflows. This keeps it hidden even if the
    // script is cached/late, and avoids the single-card case where the thumb
    // would otherwise fill the whole rail and read as a solid green bar.
    rail.classList.toggle('is-active', needsSlider);
    if (!needsSlider) { bar.style.transform = 'translateX(0)'; return; }
    // Thumb width proportional to how much is visible
    const visibleRatio = Math.min(1, track.clientWidth / track.scrollWidth);
    const thumbPct = Math.max(12, visibleRatio * 100); // min 12% so it stays grabbable
    bar.style.width = thumbPct + '%';
    const progress = track.scrollLeft / maxScroll; // 0..1
    const travel = rail.clientWidth * (thumbPct / 100);
    const maxTravel = rail.clientWidth - travel;
    bar.style.transform = `translateX(${progress * maxTravel}px)`;
  };
  track.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
  update();

  // Make the whole progress rail draggable/clickable to scrub the slider
  const scrubTo = (clientX) => {
    const railRect = rail.getBoundingClientRect();
    const maxScroll = track.scrollWidth - track.clientWidth;
    if (maxScroll <= 0) return;
    const thumbW = bar.getBoundingClientRect().width;
    // Position so the cursor sits at the centre of the thumb
    let x = clientX - railRect.left - thumbW / 2;
    const maxTravel = railRect.width - thumbW;
    x = Math.max(0, Math.min(maxTravel, x));
    track.scrollLeft = (x / maxTravel) * maxScroll;
  };
  let scrubbing = false;
  rail.style.cursor = 'pointer';
  rail.addEventListener('pointerdown', (e) => { scrubbing = true; rail.setPointerCapture(e.pointerId); scrubTo(e.clientX); });
  rail.addEventListener('pointermove', (e) => { if (scrubbing) scrubTo(e.clientX); });
  rail.addEventListener('pointerup', (e) => { scrubbing = false; try { rail.releasePointerCapture(e.pointerId); } catch(_){} });
  rail.addEventListener('pointercancel', () => { scrubbing = false; });

  // Also allow dragging the cards themselves (click-and-drag to scroll)
  enableDragScroll(track);

  // Auto-advance: gently scroll to the next card on a timer so the slider moves
  // on its own. Pauses while the user hovers, touches, or drags, and resumes a
  // few seconds after they stop. Loops back to the start once it reaches the end.
  const AUTO_MS = 3500;
  let autoTimer = null;
  let paused = false;

  const advance = () => {
    if (paused) return;
    const maxScroll = track.scrollWidth - track.clientWidth;
    if (maxScroll <= 2) return; // nothing to scroll
    const cards = track.querySelectorAll('.story-card');
    if (!cards.length) return;
    if (track.scrollLeft >= maxScroll - 4) {
      // Loop back to the first card.
      track.scrollTo({ left: 0, behavior: 'smooth' });
      return;
    }
    // Find the next card whose start is meaningfully to the right of the current
    // scroll position and snap exactly to it. Using an exact card offset (rather
    // than a relative scrollBy) keeps scroll-snap happy in Safari, which can
    // otherwise leave a card mid-snap and look broken.
    const base = track.getBoundingClientRect().left;
    let target = null;
    for (let i = 0; i < cards.length; i++) {
      const left = cards[i].getBoundingClientRect().left - base + track.scrollLeft;
      if (left > track.scrollLeft + 4) { target = left; break; }
    }
    if (target === null) { track.scrollTo({ left: 0, behavior: 'smooth' }); return; }
    track.scrollTo({ left: Math.min(target, maxScroll), behavior: 'smooth' });
  };

  const startAuto = () => {
    if (autoTimer) return;
    autoTimer = window.setInterval(advance, AUTO_MS);
  };
  const stopAuto = () => {
    if (autoTimer) { window.clearInterval(autoTimer); autoTimer = null; }
  };

  // Pause on hover / touch / drag; resume shortly after interaction ends.
  let resumeTimer = null;
  const pause = () => {
    paused = true;
    if (resumeTimer) { window.clearTimeout(resumeTimer); resumeTimer = null; }
  };
  const resumeSoon = () => {
    if (resumeTimer) window.clearTimeout(resumeTimer);
    resumeTimer = window.setTimeout(() => { paused = false; }, 2500);
  };
  track.addEventListener('mouseenter', pause);
  track.addEventListener('mouseleave', resumeSoon);
  track.addEventListener('pointerdown', pause);
  track.addEventListener('pointerup', resumeSoon);
  track.addEventListener('touchstart', pause, { passive: true });
  track.addEventListener('touchend', resumeSoon, { passive: true });
  rail.addEventListener('pointerdown', pause);
  rail.addEventListener('pointerup', resumeSoon);

  // Pause when the tab is hidden so it doesn't jump many cards at once on return.
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { stopAuto(); } else { startAuto(); }
  });

  startAuto();
}

// Reusable click-and-drag horizontal scrolling for any overflow-x container.
// Genuine clicks (little/no movement) fall through so card links still open;
// only a real drag (movement past the threshold) scrolls and suppresses the
// click that would otherwise follow.
// Click-and-drag horizontal scrolling for MOUSE/PEN only. On touch devices the
// browser's own inertial scrolling is far smoother than anything JS can do, so
// we leave touch entirely to native scroll (see touch-action: pan-x in CSS) and
// only enhance mouse dragging here — with velocity-based momentum so releasing a
// drag glides to a stop and then snaps to the nearest card, instead of halting
// abruptly. Genuine clicks (little/no movement) fall through so card links open.
function enableDragScroll(track) {
  if (!track || track._dragScrollBound) return;
  track._dragScrollBound = true;
  const THRESHOLD = 6;
  let isDown = false, startX = 0, startScroll = 0, moved = 0, dragging = false;
  let lastX = 0, lastT = 0, velocity = 0, momentumId = null;

  const snapNearest = (smooth) => {
    const items = track.children;
    if (!items.length) return;
    const rectLeft = track.getBoundingClientRect().left;
    const sl = track.scrollLeft;
    let best = 0, bestDist = Infinity;
    for (let i = 0; i < items.length; i++) {
      const left = items[i].getBoundingClientRect().left - rectLeft + sl;
      const dist = Math.abs(left - sl);
      if (dist < bestDist) { bestDist = dist; best = i; }
    }
    const maxScroll = track.scrollWidth - track.clientWidth;
    const target = Math.max(0, Math.min(items[best].getBoundingClientRect().left - rectLeft + sl, maxScroll));
    track.scrollTo({ left: target, behavior: smooth ? 'smooth' : 'auto' });
  };

  const cancelMomentum = () => { if (momentumId) { cancelAnimationFrame(momentumId); momentumId = null; } };

  const runMomentum = () => {
    // Exponential decay of the release velocity; snap once it's slow enough.
    const step = () => {
      velocity *= 0.94;
      track.scrollLeft -= velocity;
      const maxScroll = track.scrollWidth - track.clientWidth;
      if (track.scrollLeft <= 0 || track.scrollLeft >= maxScroll || Math.abs(velocity) < 0.6) {
        momentumId = null;
        snapNearest(true);
        return;
      }
      momentumId = requestAnimationFrame(step);
    };
    momentumId = requestAnimationFrame(step);
  };

  track.addEventListener('pointerdown', (e) => {
    if (e.pointerType === 'touch') return;      // touch → native momentum scroll
    if (e.button && e.button !== 0) return;      // left button only
    cancelMomentum();
    isDown = true; moved = 0; dragging = false;
    startX = e.clientX; startScroll = track.scrollLeft;
    lastX = e.clientX; lastT = performance.now(); velocity = 0;
  });
  track.addEventListener('pointermove', (e) => {
    if (!isDown || e.pointerType === 'touch') return;
    const dx = e.clientX - startX;
    moved = Math.abs(dx);
    if (!dragging && moved > THRESHOLD) {
      dragging = true;
      track.classList.add('dragging');
      try { track.setPointerCapture(e.pointerId); } catch (_) {}
    }
    if (dragging) {
      e.preventDefault();
      track.scrollLeft = startScroll - dx;
      // Track instantaneous velocity (px/frame) for the release momentum.
      const now = performance.now();
      const dt = now - lastT;
      if (dt > 0) velocity = ((e.clientX - lastX) / dt) * 16; // normalise to ~60fps
      lastX = e.clientX; lastT = now;
    }
  });
  const end = (e) => {
    if (e && e.pointerType === 'touch') return;
    const wasDragging = dragging;
    isDown = false;
    track.classList.remove('dragging');
    if (e && e.pointerId != null) { try { track.releasePointerCapture(e.pointerId); } catch (_) {} }
    if (wasDragging) {
      if (Math.abs(velocity) > 1.5) runMomentum(); // flick → glide, then snap
      else snapNearest(true);                       // gentle release → just snap
    }
  };
  track.addEventListener('pointerup', end);
  track.addEventListener('pointercancel', end);
  track.addEventListener('click', (e) => {
    if (dragging || moved > THRESHOLD) { e.preventDefault(); e.stopPropagation(); }
  }, true);
}


/* ---------- FEATURED ---------- */
function spanClass(span) {
  if (span === 'hero') return 'span-hero';
  return 'span-single';
}
function scoreMarkup(score) {
  if (!score) return '';
  return `<div class="score-badge animate-score-pulse"><span class="score-num font-display">${score}</span><span class="score-max font-display">/10</span></div>`;
}
function renderFeaturedCards() {
  const grid = document.getElementById('featured-grid');
  if (!grid) return;
  // Slider row wraps the non-hero cards (used as a slider on mobile, contents on desktop)
  const sliderRow = el('div', 'featured-slider-row');
  featuredCards.forEach((card) => {
    const wrapper = el('a', `featured-card card-hover ${spanClass(card.span)}`);
    wrapper.href = REVIEW_URL;
    wrapper.style.display = 'block';
    if (card.span === 'hero') {
      // Large hero feature card — spans 2 cols x 2 rows
      wrapper.innerHTML = `
        <div class="hero-card-media">
          <img src="${card.image}" alt="${card.title}" />
          ${scoreMarkup(card.score)}
          <span class="featured-ribbon">★ Featured</span>
        </div>
        <div class="hero-card-body">
          <span class="category-badge card-badge-wrap ${catClass(card.category)}">${card.category}</span>
          <h3 class="card-title hero-title">${card.title}</h3>
          <p class="card-excerpt line-clamp-3">${card.excerpt}</p>
          <div class="card-footer">
            <div class="footer-author"><img src="${card.authorAvatar}" alt="${card.author}" /><span>${card.author}</span></div>
            <span class="footer-meta">${ICONS.clock}${card.timestamp}</span>
          </div>
        </div>`;
      grid.appendChild(wrapper);
    } else {
      wrapper.innerHTML = `
        <div class="card-media ratio-16-9">
          <img src="${card.image}" alt="${card.title}" />
          ${scoreMarkup(card.score)}
        </div>
        <div class="card-body">
          <span class="category-badge card-badge-wrap ${catClass(card.category)}">${card.category}</span>
          <h3 class="card-title lg">${card.title}</h3>
          <p class="card-excerpt line-clamp-2">${card.excerpt}</p>
          <div class="card-footer">
            <div class="footer-author"><img src="${card.authorAvatar}" alt="${card.author}" /><span>${card.author}</span></div>
            <span class="footer-meta">${ICONS.clock}${card.timestamp}</span>
          </div>
        </div>`;
      sliderRow.appendChild(wrapper);
    }
  });
  grid.appendChild(sliderRow);
}

/* ---------- LATEST NEWS (no share/comments — task 16) ---------- */
let visibleCount = ITEMS_PER_PAGE;
function newsItemMarkup(item) {
  return `
    <div class="news-thumb"><img src="${item.thumbnail}" alt="${item.headline}" /></div>
    <div class="news-body">
      <span class="category-badge news-badge ${catClass(item.category)}">${item.category}</span>
      <h3 class="news-headline">${item.headline}</h3>
      <p class="news-excerpt line-clamp-1">${item.excerpt}</p>
    </div>
    <div class="news-meta">
      <span class="news-time">${ICONS.clock}${item.timestamp}</span>
    </div>`;
}
function renderNews(revealNewOnly) {
  const list = document.getElementById('news-list');
  if (!list) return;
  const items = allNewsItems.slice(0, visibleCount);

  if (!revealNewOnly) list.innerHTML = '';

  // First item stays static; the rest go into a horizontal slider row (mobile).
  let sliderRow = list.querySelector('.news-slider-row');
  const newlyAdded = [];
  const startIndex = revealNewOnly ? (list.dataset.rendered ? parseInt(list.dataset.rendered, 10) : 0) : 0;

  for (let i = startIndex; i < items.length; i++) {
    const node = el('a', 'news-item');
    node.href = REVIEW_URL;
    node.innerHTML = newsItemMarkup(items[i]);
    if (i === 0) {
      list.appendChild(node); // first item static
    } else {
      if (!sliderRow) { sliderRow = el('div', 'news-slider-row'); list.appendChild(sliderRow); }
      sliderRow.appendChild(node);
    }
    newlyAdded.push(node);
  }
  list.dataset.rendered = items.length;

  const wrap = document.getElementById('load-more-wrap');
  if (wrap) wrap.style.display = visibleCount < allNewsItems.length ? 'flex' : 'none';
  revealNewsItems(newlyAdded);
}
function initLoadMore() {
  const btn = document.getElementById('load-more-btn');
  if (!btn) return;
  btn.addEventListener('click', (e) => {
    e.preventDefault();
    visibleCount = Math.min(visibleCount + ITEMS_PER_PAGE, allNewsItems.length);
    renderNews(true);
    const track = document.querySelector('.news-slider-row');
    if (track && track._refreshSliderNav) track._refreshSliderNav();
  });
}

/* ---------- LATEST GAMES ---------- */
const platformIcon = {
  'PC': '<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="14" x="2" y="3" rx="2"/><line x1="8" x2="16" y1="21" y2="21"/><line x1="12" x2="12" y1="17" y2="21"/></svg>',
  'PS5': '<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 12h4m-2-2v4"/><path d="M15 13h.01M18 11h.01"/><rect width="20" height="12" x="2" y="6" rx="6"/></svg>',
  'XBOX': '<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M6.5 6.5c3 1 5.5 4 5.5 4s2.5-3 5.5-4"/><path d="M6.5 17.5c1.5-4 5.5-7 5.5-7s4 3 5.5 7"/></svg>',
  'SWITCH': '<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="8" height="20" x="2" y="2" rx="2"/><rect width="8" height="20" x="14" y="2" rx="2"/><circle cx="6" cy="7" r="1"/><circle cx="18" cy="17" r="1"/></svg>',
};
function renderLatestGames() {
  const grid = document.getElementById('games-grid');
  if (!grid) return;
  const sliderRow = el('div', 'games-slider-row');
  latestGames.forEach((g) => {
    const card = el('a', 'game-card');
    card.href = REVIEW_URL;
    const platforms = g.platforms.map((pf) => `<span class="game-platform" title="${pf}">${platformIcon[pf] || pf}</span>`).join('');
    card.innerHTML = `
      <div class="game-card-media">
        <img src="${g.image}" alt="${g.title}" />
        <span class="game-score-chip">${g.score}</span>
      </div>
      <div class="game-card-body">
        <span class="game-genre">${g.genre}</span>
        <h3 class="game-card-title">${g.title}</h3>
        <div class="game-card-foot">
          <div class="game-platforms">${platforms}</div>
          <span class="game-date">${g.date}</span>
        </div>
      </div>`;
    sliderRow.appendChild(card);
  });
  grid.appendChild(sliderRow);
}

/* ---------- SLOT GAME REVIEWS ---------- */
function scoreRing(score) {
  const pct = Math.round((score / 10) * 100);
  return `<div class="slot-ring" style="--pct:${pct}"><span class="slot-ring-num">${score.toFixed(1)}</span></div>`;
}
function renderSlotReviews() {
  const grid = document.getElementById('slots-grid');
  if (!grid) return;
  const sliderRow = el('div', 'slots-slider-row');
  slotReviews.forEach((s) => {
    const card = el('a', 'slot-card');
    card.href = REVIEW_URL;
    const tag = s.tag ? `<span class="slot-tag slot-tag-${s.tag.toLowerCase()}">${s.tag}</span>` : '';
    card.innerHTML = `
      <div class="slot-card-media">
        <img src="${s.image}" alt="${s.title}" />
        ${tag}
        <div class="slot-media-overlay"></div>
        ${scoreRing(s.score)}
      </div>
      <div class="slot-card-body">
        <h3 class="slot-card-title">${s.title}</h3>
        <p class="slot-provider">${s.provider}</p>
        <div class="slot-specs">
          <div class="slot-spec"><span class="slot-spec-label">RTP</span><span class="slot-spec-val">${s.rtp}</span></div>
          <div class="slot-spec"><span class="slot-spec-label">Volatility</span><span class="slot-spec-val">${s.volatility}</span></div>
        </div>
      </div>`;
    sliderRow.appendChild(card);
  });
  grid.appendChild(sliderRow);
}

/* ---------- TABBED SECTIONS (generic) ---------- */
function initTabs(tabBarId, categories, onSelect) {
  const bar = document.getElementById(tabBarId);
  if (!bar) return;
  categories.forEach((cat, i) => {
    const btn = el('button', 'tab-btn' + (i === 0 ? ' active' : ''));
    btn.textContent = cat;
    btn.setAttribute('role', 'tab');
    btn.addEventListener('click', () => {
      bar.querySelectorAll('.tab-btn').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      onSelect(cat);
    });
    bar.appendChild(btn);
  });
  onSelect(categories[0]);
}

/* ---------- GAME REVIEWS (tabbed cards) ---------- */
function renderGameReviews(category) {
  const grid = document.getElementById('game-reviews-grid');
  if (!grid) return;
  const source = category === 'All' ? gameReviews : gameReviews.filter((r) => r.category === category);
  const items = source.slice(0, 8); // cap at 8 (task 7)
  const cards = items.map((r) => `
    <a class="gr-card" href="${REVIEW_URL}">
      <div class="gr-card-media">
        <img src="${r.image}" alt="${r.title}" />
        <span class="gr-score">${r.score}<span class="gr-score-max">/10</span></span>
      </div>
      <div class="gr-card-body">
        <span class="category-badge ${catClass(r.category)}">${r.category}</span>
        <h3 class="gr-card-title">${r.title}</h3>
        <p class="gr-card-excerpt">${r.excerpt}</p>
        <div class="gr-card-foot">
          <span class="gr-author">${r.author}</span>
          <span class="gr-date">${ICONS.clock}${r.date}</span>
        </div>
      </div>
    </a>`).join('');
  // Wrap in a slider row (contents on desktop, horizontal slider on mobile)
  grid.innerHTML = `<div class="gr-slider-row">${cards}</div>`;
  if (typeof gsapRevealGrid === 'function') gsapRevealGrid(grid, '.gr-card');
  if (typeof initSliders === 'function') initSliders();
}
function initGameReviews() {
  initTabs('game-reviews-tabs', ['All', 'Action', 'RPG', 'Strategy', 'Indie'], renderGameReviews);
}

/* ---------- NEWS REVIEWS (tabbed list, different design) ---------- */
function renderNewsReviews(category) {
  const list = document.getElementById('news-reviews-list');
  if (!list) return;
  const source = category === 'All' ? newsReviews : newsReviews.filter((r) => r.category === category);
  const items = source.slice(0, 8); // cap at 8 (task 7)
  const rows = items.map((r, i) => `
    <a class="nr-row" href="${REVIEW_URL}">
      <span class="nr-index">${String(i + 1).padStart(2, '0')}</span>
      <div class="nr-thumb"><img src="${r.image}" alt="${r.title}" /></div>
      <div class="nr-body">
        <div class="nr-meta-top">
          <span class="category-badge ${catClass(r.category)}">${r.category}</span>
          <span class="nr-read">${r.read} read</span>
        </div>
        <h3 class="nr-title">${r.title}</h3>
        <p class="nr-excerpt">${r.excerpt}</p>
      </div>
      <span class="nr-date">${r.date}</span>
      <span class="nr-arrow"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg></span>
    </a>`).join('');
  list.innerHTML = `<div class="nr-slider-row">${rows}</div>`;
  if (typeof gsapRevealGrid === 'function') gsapRevealGrid(list, '.nr-row');
  if (typeof initSliders === 'function') initSliders();
}
function initNewsReviews() {
  initTabs('news-reviews-tabs', ['All', 'Industry', 'Esports', 'Hardware', 'Releases'], renderNewsReviews);
}


/* ---------- GSAP REVEALS ---------- */
const hasGSAP = () => !!(window.gsap && window.ScrollTrigger);
function revealStories() {
  if (!hasGSAP()) return;
  const cards = document.querySelectorAll('#stories-scroll .story-card');
  const section = document.getElementById('top-stories');
  cards.forEach((card, i) => {
    gsap.fromTo(card, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.6, delay: i * 0.1, ease: 'power3.out',
      scrollTrigger: { trigger: section, start: 'top 80%', toggleActions: 'play none none none' } });
  });
}
function revealFeatured() {
  if (!hasGSAP()) return;
  document.querySelectorAll('#featured-grid .featured-card').forEach((card, i) => {
    gsap.fromTo(card, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.6, delay: i * 0.1, ease: 'power3.out',
      scrollTrigger: { trigger: card, start: 'top 85%', toggleActions: 'play none none none' } });
  });
}
function revealTrust() {
  if (!hasGSAP()) return;
  const panel = document.querySelector('.trust-panel');
  if (!panel) return;
  gsap.fromTo(panel, { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out',
    scrollTrigger: { trigger: panel, start: 'top 85%', toggleActions: 'play none none none' } });
}
function revealCards(sectionId, selector) {
  if (!hasGSAP()) return;
  const section = document.getElementById(sectionId);
  if (!section) return;
  section.querySelectorAll(selector).forEach((card, i) => {
    gsap.fromTo(card, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.55, delay: (i % 4) * 0.08, ease: 'power3.out',
      scrollTrigger: { trigger: card, start: 'top 90%', toggleActions: 'play none none none' } });
  });
}
// Re-usable reveal for tab content that re-renders on tab switch
function gsapRevealGrid(container, selector) {
  if (!hasGSAP() || !container) return;
  container.querySelectorAll(selector).forEach((card, i) => {
    gsap.fromTo(card, { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.4, delay: (i % 6) * 0.05, ease: 'power2.out' });
  });
}

/* ---------- STAT COUNTERS (task 5) ---------- */
function initCounters() {
  const nums = document.querySelectorAll('.trust-stat-num[data-count]');
  if (!nums.length) return;
  const animate = (elm) => {
    const target = parseFloat(elm.getAttribute('data-count'));
    const suffix = elm.getAttribute('data-suffix') || '';
    const decimals = parseInt(elm.getAttribute('data-decimals') || '0', 10);
    const duration = 1400;
    const start = performance.now();
    const step = (now) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3); // easeOutCubic
      const val = target * eased;
      elm.textContent = val.toFixed(decimals) + suffix;
      if (t < 1) requestAnimationFrame(step);
      else elm.textContent = target.toFixed(decimals) + suffix;
    };
    requestAnimationFrame(step);
  };
  const obs = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) { animate(entry.target); obs.unobserve(entry.target); }
    });
  }, { threshold: 0.5 });
  nums.forEach((n) => obs.observe(n));
}
function revealNewsItems(nodes) {
  if (!hasGSAP()) return;
  nodes.forEach((item, i) => {
    gsap.fromTo(item, { opacity: 0, x: -20 }, { opacity: 1, x: 0, duration: 0.5, delay: i * 0.05, ease: 'power3.out',
      scrollTrigger: { trigger: item, start: 'top 90%', toggleActions: 'play none none none' } });
  });
}

/* ---------- HERO VIDEO ---------- */
function initHeroVideo() {
  const video = document.getElementById('hero-video');
  const section = document.getElementById('home');
  if (!video || !section) return;
  const observer = new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting) video.play().catch(() => {}); else video.pause();
  }, { threshold: 0.1 });
  observer.observe(section);
}

/* ---------- NEWSLETTER ---------- */
function initNewsletter() {
  const form = document.getElementById('newsletter-form');
  const input = document.getElementById('newsletter-input');
  if (!form) return;
  form.addEventListener('submit', (e) => { e.preventDefault(); input.value = ''; });
}

/* ---------- SEARCH MODAL (task 13) ---------- */
function buildSearchIndex() {
  const idx = [];
  featuredCards.forEach((c) => idx.push({ title: c.title, category: c.category, excerpt: c.excerpt, image: c.image, time: c.timestamp }));
  stories.forEach((s) => idx.push({ title: s.headline, category: s.category, excerpt: '', image: s.image, time: s.timestamp }));
  allNewsItems.forEach((n) => idx.push({ title: n.headline, category: n.category, excerpt: n.excerpt, image: n.thumbnail, time: n.timestamp }));
  // de-dupe by title
  const seen = new Set();
  return idx.filter((i) => { if (seen.has(i.title)) return false; seen.add(i.title); return true; });
}
function initSearch() {
  const overlay = document.getElementById('search-overlay');
  const openBtn = document.getElementById('open-search');
  const input = document.getElementById('search-modal-input');
  const results = document.getElementById('search-results');
  if (!overlay || !openBtn || !input || !results) return;

  // Suggested list = the same interleaved latest posts as trending (3 per type,
  // a,b,a,b,a,b). Total count = real published total across both post types.
  const suggested = (window.MLG && Array.isArray(window.MLG.trending) && window.MLG.trending.length)
    ? window.MLG.trending.map((t) => ({ title: t.title, category: t.category, excerpt: t.excerpt || '', image: t.image, time: t.time, url: t.url }))
    : buildSearchIndex();
  const totalCount = (window.MLG && window.MLG.total != null && !isNaN(parseInt(window.MLG.total, 10)))
    ? parseInt(window.MLG.total, 10)
    : suggested.length;

  // The searchable index: prefer the localized full index if present, else fall
  // back to the suggested items (keeps type-ahead working out of the box).
  const index = (window.MLG && Array.isArray(window.MLG.searchIndex) && window.MLG.searchIndex.length)
    ? window.MLG.searchIndex
    : suggested;
  let activeIdx = -1;
  let currentList = [];

  const open = () => { overlay.classList.add('visible'); input.value = ''; render(''); setTimeout(() => input.focus(), 50); };
  const close = () => { overlay.classList.remove('visible'); activeIdx = -1; };

  const render = (q) => {
    const query = q.trim().toLowerCase();
    if (!query) {
      currentList = suggested.slice(0, 6);
      results.innerHTML = `<div class="search-hint">Start typing to search across ${totalCount} articles, reviews & guides…</div>` +
        currentList.map((r, i) => resultRow(r, i)).join('');
      activeIdx = -1;
      bindRows();
      return;
    }
    currentList = index.filter((r) =>
      r.title.toLowerCase().includes(query) ||
      (r.category && r.category.toLowerCase().includes(query)) ||
      (r.excerpt && r.excerpt.toLowerCase().includes(query))
    );
    if (!currentList.length) {
      results.innerHTML = `<div class="search-hint">No results for “${q}”. Try another keyword.</div>`;
      return;
    }
    results.innerHTML = currentList.map((r, i) => resultRow(r, i)).join('');
    activeIdx = -1;
    bindRows();
  };

  const MLG_BASE = '';
  const resultRow = (r, i) => `
    <a class="search-result" data-i="${i}" href="${r.url || REVIEW_URL}">
      <div class="search-result-thumb"><img src="${MLG_BASE}${r.image}" alt="" /></div>
      <div class="search-result-body">
        <div class="search-result-cat cat-text ${catClass(r.category)}">${r.category}</div>
        <div class="search-result-title">${r.title}</div>
        <div class="search-result-meta">${r.time}</div>
      </div>
    </a>`;

  const bindRows = () => {
    results.querySelectorAll('.search-result').forEach((row) => {
      row.addEventListener('mouseenter', () => {
        results.querySelectorAll('.search-result').forEach((x) => x.classList.remove('active'));
        activeIdx = parseInt(row.getAttribute('data-i'), 10);
        row.classList.add('active');
      });
    });
  };

  const move = (dir) => {
    const rows = results.querySelectorAll('.search-result');
    if (!rows.length) return;
    activeIdx = (activeIdx + dir + rows.length) % rows.length;
    rows.forEach((x) => x.classList.remove('active'));
    const active = rows[activeIdx];
    active.classList.add('active');
    active.scrollIntoView({ block: 'nearest' });
  };

  openBtn.addEventListener('click', open);
  overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });
  input.addEventListener('input', (e) => render(e.target.value));
  input.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); move(1); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); move(-1); }
    else if (e.key === 'Enter') {
      const rows = results.querySelectorAll('.search-result');
      const q = input.value.trim();
      // If the user has explicitly highlighted a result with the arrow keys,
      // open it. Otherwise, Enter runs a full search: go to the search page.
      if (activeIdx >= 0 && rows[activeIdx]) {
        window.location.href = rows[activeIdx].getAttribute('href');
      } else if (q) {
        const base = (window.MLG && window.MLG.home) ? window.MLG.home : '/';
        window.location.href = base + '?s=' + encodeURIComponent(q);
      }
    }
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') close();
    if ((e.key === 'k' || e.key === 'K') && (e.metaKey || e.ctrlKey)) { e.preventDefault(); open(); }
    if (e.key === '/' && !overlay.classList.contains('visible') &&
        document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
      e.preventDefault(); open();
    }
  });
}

/* ---------- MOBILE SLIDER NAVIGATION ---------- */
function initSliders() {
  const sliders = [
    { row: '.featured-slider-row', selector: '.featured-card' },
    { row: '.news-slider-row', selector: '.news-item' },
    { row: '.latest-text-grid', selector: '.latest-card' },
    { row: '.games-slider-row', selector: '.game-card' },
    { row: '.slots-slider-row', selector: '.slot-card' },
    { row: '.gr-slider-row', selector: '.gr-card' },
    { row: '.nr-slider-row', selector: '.nr-row' },
    { row: '.casino-slider-row', selector: '.casino-card' },
    { row: '.indie-poster-row', selector: '.indie-poster' },
  ];
  const arrow = (dir) => dir === 'prev'
    ? '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>'
    : '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>';

  sliders.forEach(({ row, selector }) => {
    const track = document.querySelector(row);
    if (!track) return;
    const slides = track.querySelectorAll(selector);
    if (slides.length < 2) return;

    // Avoid duplicate nav if re-initialized
    let nav = track.parentElement.querySelector('.slider-nav[data-for="' + row.replace(/\W/g, '') + '"]');
    if (nav) nav.remove();

    nav = el('div', 'slider-nav');
    nav.setAttribute('data-for', row.replace(/\W/g, ''));
    const prevBtn = el('button', 'slider-nav-btn slider-prev');
    prevBtn.setAttribute('aria-label', 'Previous');
    prevBtn.innerHTML = arrow('prev');
    const nextBtn = el('button', 'slider-nav-btn slider-next');
    nextBtn.setAttribute('aria-label', 'Next');
    nextBtn.innerHTML = arrow('next');
    const dots = el('div', 'slider-dots');

    // Cache the slide list once (refreshed via _refreshSliderNav on load-more).
    // Re-querying on every scroll tick is a big source of Safari scroll jank.
    let cachedItems = track.querySelectorAll(selector);
    let lastActive = -1;
    let rafPending = false;

    const rebuildDots = () => {
      dots.innerHTML = '';
      track.querySelectorAll(selector).forEach((_, i) => {
        const dot = el('button', 'slider-dot');
        dot.setAttribute('aria-label', 'Go to slide ' + (i + 1));
        dot.addEventListener('click', () => {
          const items = track.querySelectorAll(selector);
          if (items[i]) track.scrollTo({ left: items[i].offsetLeft - track.offsetLeft, behavior: 'smooth' });
        });
        dots.appendChild(dot);
      });
    };
    rebuildDots();

    // Index of the card currently nearest the left edge of the viewport.
    // Uses live rects (robust against offsetParent/transform quirks).
    const cardLeftInScroll = (card) => {
      // Position of the card's left edge in the track's scroll coordinate space.
      return card.getBoundingClientRect().left - track.getBoundingClientRect().left + track.scrollLeft;
    };
    const nearestIndex = () => {
      const items = cachedItems.length ? cachedItems : track.querySelectorAll(selector);
      if (!items.length) return 0;
      const sl = track.scrollLeft;
      let best = 0, bestDist = Infinity;
      for (let i = 0; i < items.length; i++) {
        const dist = Math.abs(cardLeftInScroll(items[i]) - sl);
        if (dist < bestDist) { bestDist = dist; best = i; }
      }
      return best;
    };

    const scrollToIndex = (i, smooth) => {
      const items = cachedItems.length ? cachedItems : track.querySelectorAll(selector);
      if (!items.length) return;
      const clamped = Math.max(0, Math.min(i, items.length - 1));
      const maxScroll = track.scrollWidth - track.clientWidth;
      const left = Math.max(0, Math.min(cardLeftInScroll(items[clamped]), maxScroll));
      track.scrollTo({ left, behavior: smooth ? 'smooth' : 'auto' });
    };

    // Arrows move exactly one card from whatever card is currently nearest, so
    // they work reliably even right after a free-hand drag left the strip
    // resting between cards.
    const stepScroll = (dir) => {
      const items = cachedItems.length ? cachedItems : track.querySelectorAll(selector);
      if (!items.length) return;
      const maxScroll = track.scrollWidth - track.clientWidth;
      // If we're already essentially at the end and going forward, stay put.
      if (dir > 0 && track.scrollLeft >= maxScroll - 4) return;
      if (dir < 0 && track.scrollLeft <= 4) return;
      scrollToIndex(nearestIndex() + dir, true);
    };
    prevBtn.addEventListener('click', () => stepScroll(-1));
    nextBtn.addEventListener('click', () => stepScroll(1));

    // updateActive can fire on every scroll tick. On Safari, momentum scrolling
    // emits scroll events very frequently, so we (a) throttle the real work to
    // once per animation frame, (b) cache the slide list, and (c) never trigger
    // a *smooth* dots-scroll mid-gesture (that fights momentum and feels laggy) —
    // the active dot is repositioned instantly, and only when it actually moves.
    const computeActive = () => {
      rafPending = false;
      const items = cachedItems;
      const dotEls = dots.querySelectorAll('.slider-dot');
      if (!items.length) return;
      const maxScroll = track.scrollWidth - track.clientWidth;
      const sl = track.scrollLeft;
      const atStart = sl <= 2;
      const atEnd = sl >= maxScroll - 2;
      let active = 0;
      if (atEnd) {
        active = items.length - 1;
      } else if (atStart) {
        active = 0;
      } else {
        const center = sl + track.clientWidth / 2;
        const trackLeft = track.offsetLeft;
        let best = Infinity;
        for (let i = 0; i < items.length; i++) {
          const it = items[i];
          const mid = it.offsetLeft - trackLeft + it.offsetWidth / 2;
          const dist = Math.abs(mid - center);
          if (dist < best) { best = dist; active = i; }
        }
      }
      prevBtn.disabled = atStart;
      nextBtn.disabled = atEnd;

      if (active === lastActive) return; // nothing changed → skip DOM writes
      lastActive = active;

      for (let i = 0; i < dotEls.length; i++) {
        dotEls[i].classList.toggle('active', i === active);
      }
    };

    const updateActive = () => {
      if (rafPending) return;
      rafPending = true;
      requestAnimationFrame(computeActive);
    };

    // Snapping is handled natively by CSS `scroll-snap-type: x mandatory` on the
    // track — that rides the browser's own momentum scrolling and is far smoother
    // than any JS-driven snap, which tended to "grab" the scroll away from the
    // user. The arrows below still move exactly one card via scrollToIndex.
    track.addEventListener('scroll', updateActive, { passive: true });

    const navRow = el('div', 'slider-nav-row');
    navRow.appendChild(prevBtn);
    navRow.appendChild(dots);
    navRow.appendChild(nextBtn);
    nav.appendChild(navRow);
    track.insertAdjacentElement('afterend', nav);

    // expose a refresh hook for load-more
    track._refreshSliderNav = () => {
      cachedItems = track.querySelectorAll(selector);
      lastActive = -1;
      rebuildDots();
      updateActive();
    };
    updateActive();
  });
}

/* ---------- SERVER-RENDERED SECTION INTERACTIVITY ---------- */

// Top Stories: attach the existing progress-bar + drag behaviour to the
// server-rendered #stories-scroll track.
function initServerStories() {
  const track = document.getElementById('stories-scroll');
  if (track && track.querySelector('.story-card')) initStoriesProgress(track);
}

// Indie poster row: enable click-and-drag horizontal scrolling.
function initServerIndieDrag() {
  const row = document.querySelector('#indie-grid .indie-poster-row');
  if (row && typeof enableDragScroll === 'function') enableDragScroll(row);
}

// Game/News review tabs: filter via AJAX, swapping the grid/list markup.
function initReviewTabs() {
  const ajax = (window.MLG && window.MLG.ajax) ? window.MLG.ajax : '/wp-admin/admin-ajax.php';

  function wire(tabsId, targetId, type) {
    const bar = document.getElementById(tabsId);
    const target = document.getElementById(targetId);
    if (!bar || !target) return;
    bar.addEventListener('click', (e) => {
      const btn = e.target.closest('.tab-btn');
      if (!btn) return;
      bar.querySelectorAll('.tab-btn').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      const cat = btn.getAttribute('data-cat') || '';
      target.style.opacity = '0.4';
      const lang = (window.MLG && window.MLG.lang) ? window.MLG.lang : '';
      let url = `${ajax}?action=mlg_reviews&type=${encodeURIComponent(type)}&cat=${encodeURIComponent(cat)}`;
      if (lang) { url += `&lang=${encodeURIComponent(lang)}`; }
      fetch(url, { credentials: 'same-origin' })
        .then((r) => r.json())
        .then((res) => {
          if (res && res.success && res.data && typeof res.data.html === 'string') {
            target.innerHTML = res.data.html;
            target.style.opacity = '1';
            if (hasGSAP()) {
              const sel = type === 'game' ? '.gr-card' : '.nr-row';
              gsapRevealGrid(target, sel);
            }
            if (typeof initSliders === 'function') initSliders();
          } else {
            target.style.opacity = '1';
          }
        })
        .catch(() => { target.style.opacity = '1'; });
    });
  }

  wire('game-reviews-tabs', 'game-reviews-grid', 'game');
  wire('news-reviews-tabs', 'news-reviews-list', 'news');
}

// Game/News CPT archive filter: server-rendered tabs that filter the grid via
// AJAX (parity with the demo Archive template, but driven by real posts).
function initArchiveFilter() {
  // The Game/News archive category tabs are now real links to the term archives
  // (and the post-type archive for "All"), so every filtered view is a real
  // paginated page. No client-side interception needed — navigation handles it.
}

// Related articles: the server renders a stable, date-ordered POOL (up to 20).
// Here we shuffle that pool client-side and reveal a random N (default 5), so
// the list differs on every visit even when the page HTML is cached, with no
// network request and no post-load flash (CSS keeps only 5 visible throughout).
function initRelatedShuffle() {
  const box = document.getElementById('related-articles');
  if (!box || !box.hasAttribute('data-related-shuffle')) return;
  const show = parseInt(box.getAttribute('data-show'), 10) || 5;
  const items = Array.from(box.querySelectorAll('.related-item'));
  if (items.length <= show) return; // nothing to shuffle

  // Fisher–Yates shuffle of the indices.
  const idx = items.map((_, i) => i);
  for (let i = idx.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [idx[i], idx[j]] = [idx[j], idx[i]];
  }
  const chosen = new Set(idx.slice(0, show));

  // Reorder the chosen items to the top and mark visibility. Reordering keeps
  // the revealed set looking intentional rather than gapped.
  const frag = document.createDocumentFragment();
  idx.forEach((i) => {
    const el = items[i];
    if (chosen.has(i)) {
      el.classList.add('related-show');
      el.classList.remove('related-hide');
      frag.appendChild(el);
    }
  });
  items.forEach((el) => {
    if (!el.classList.contains('related-show')) {
      el.classList.add('related-hide');
    }
  });
  // Prepend the chosen (now in shuffled order) ahead of the hidden ones.
  box.insertBefore(frag, box.firstChild);
}

/* ---------- INIT ---------- */
// Related-articles shuffle runs in its OWN listener so it always executes even
// if something earlier in the main init chain throws on a given template (e.g.
// a minimal review page that lacks the homepage widgets). This mirrors how the
// shuffle behaves on single-game / single-news pages.
document.addEventListener('DOMContentLoaded', () => {
  try { initRelatedShuffle(); } catch (e) { /* no-op */ }
});

document.addEventListener('DOMContentLoaded', () => {
  if (hasGSAP()) gsap.registerPlugin(ScrollTrigger);
  initTheme();
  initFooterYear();
  initScanlineOverlay();
  initSidebar();
  initLangSwitcher();        // Polylang language dropdown (if present)
  initClock();
  initTicker();
  renderPartners();          // partners/collab are static branding data (JS)
  // Indie Spotlight, Top Stories, Featured, Latest Games, Slot Reviews, Latest
  // News, Game Reviews and News Reviews are now SERVER-RENDERED (see
  // inc/parts/home-sections.php). We only wire up interactivity for them here.
  initServerStories();       // progress bar + drag scroll for #stories-scroll
  initServerIndieDrag();     // drag scroll for the indie poster row
  initReviewTabs();          // AJAX-filtered Game/News review tabs
  initArchiveFilter();       // AJAX-filtered Game/News archive category tabs
  // initRelatedShuffle() runs in its own earlier listener (above) so it is not
  // blocked by any failure in this chain.
  initHeroVideo();
  initNewsletter();
  initSearch();
  initCounters();
  initSliders();
  if (hasGSAP()) {
    revealStories();
    revealFeatured();
    revealTrust();
    revealCards('indie-spotlight', '.indie-hero, .indie-poster');
    revealCards('latest-games', '.game-card');
    revealCards('slot-reviews', '.slot-card');
    ScrollTrigger.refresh();
  }
});
