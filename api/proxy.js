export default async function handler(req, res) {
  const { text } = req.query;

  if (!text) {
    return res.status(400).json({ status: false, message: "Parameter text wajib diisi" });
  }

  const targetUrl = `http://api.nexadev.my.id/ai/deepsek?text=${encodeURIComponent(text)}`;

  try {
    const response = await fetch(targetUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "application/json"
      }
    });

    // Ambil teks mentahnya dulu
    const rawText = await response.text();
    let data;

    try {
      // Coba ubah teks menjadi JSON
      data = JSON.parse(rawText);
    } catch (e) {
      // Jika gagal, berarti API membalas dengan format aneh (HTML/teks biasa)
      return res.status(500).json({ 
        status: false, 
        message: "API mengembalikan format yang tidak dikenali (Bukan JSON).",
        debug: rawText.substring(0, 100) // Tampilkan 100 karakter pertama untuk cek
      });
    }

    // Pastikan hasilnya punya properti 'result'
    if (!data.result) {
       return res.status(500).json({ 
        status: false, 
        message: "Struktur JSON tidak memiliki 'result'.",
        debug: data 
      });
    }

    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ status: false, message: "Gagal terhubung ke API: " + error.message });
  }
}