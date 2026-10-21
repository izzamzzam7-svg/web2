TANZZURA / XGOOD — paket web siap dipasang

ISI:
- index.html
- assets/welcome.png (gambar welcome yang kamu kirim)
- assets/background.png (background ungu yang kamu kirim)
- assets/xgood-header.png (gambar header XGOOD yang kamu kirim)

CARA PAKAI:
1. Ekstrak ZIP.
2. Buka index.html di browser untuk melihat panel.
3. Untuk hosting, unggah index.html dan folder assets bersama-sama ke root hosting.
4. Untuk membuat APK, gunakan pembungkus WebView yang memuat index.html lokal, atau gunakan pembuat APK berbasis web yang menerima ZIP/HTML.

FITUR YANG BENAR-BENAR DIIMPLEMENTASIKAN:
- Gerbang key lokal TANZZURA-PERMANEN-22 dan alur welcome.
- Menu 6 kartu dengan drag-and-drop pada browser yang mendukungnya.
- Jam realtime; indikator baterai hanya jika browser/perangkat menyediakan Battery API.
- Validasi dasar format nomor.
- Tautan bantuan WhatsApp resmi.
- Animasi proses pada persiapan formulir.

BATASAN PENTING:
- Gerbang key ini hanya pemeriksaan lokal di HTML, bukan lisensi aman di server; siapa pun yang memeriksa source dapat melihat key.
- Tidak ada pengiriman spam report massal, tidak ada pembukaan blokir otomatis, dan tidak ada akses ke status akun WhatsApp dari nomor saja. UI menyatakan status sebenarnya agar tidak memberi hasil palsu.
- Proses waktu hanya animasi persiapan lokal; pengajuan baru terjadi jika pengguna melanjutkan ke situs resmi.
- Baterai live mungkin tidak tersedia di beberapa browser, terutama browser Android modern.

Tidak membutuhkan library eksternal atau koneksi CDN.
