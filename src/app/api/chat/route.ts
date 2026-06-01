import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';
import menuData from '@/data/menu.json';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(req: NextRequest) {
  if (!process.env.GEMINI_API_KEY) {
    return NextResponse.json(
      { error: 'Server belum mengonfigurasi GEMINI_API_KEY di file .env.local.' },
      { status: 500 }
    );
  }

  try {
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'Messages are required.' }, { status: 400 });
    }

    const latestMessageObj = messages[messages.length - 1];
    const latestMessageText = latestMessageObj.text;

    // Convert preceding messages to Gemini chat history format
    // Gemini strictly requires the first message in the history to have the role 'user'.
    // Therefore, we find the first message sent by the user, and slice from there.
    const firstUserIndex = messages.findIndex((msg: any) => msg.sender === 'user');
    
    const history = firstUserIndex !== -1
      ? messages.slice(firstUserIndex, messages.length - 1).map((msg: any) => ({
          role: msg.sender === 'user' ? 'user' : 'model',
          parts: [{ text: msg.text }],
        }))
      : [];

    const systemPrompt = `
Kamu adalah AI assistant untuk KUPITA, sebuah platform digital smart QR menu, AI assistant, dan reservasi meja untuk warkop/cafe modern di Banda Aceh (dikenal sebagai "KUPITA — Kopi Untuk Pikiran Terindah Anda").
Tugasmu adalah membantu pelanggan memilih menu yang paling cocok dengan preferensi mereka (seperti rasa manis, kekuatan kopi, asam, dll), budget mereka, atau mood saat ini.

Berikut adalah daftar MENU LENGKAP KUPITA yang TERSEDIA:
${JSON.stringify(menuData, null, 2)}

ATURAN MENJAWAB:
1. Selalu rekomendasikan 1 sampai 3 menu yang paling cocok dengan pertanyaan, preferensi, atau mood user.
2. Selalu sertakan harga dalam format rupiah standar, contoh: "Rp 25.000" atau "Rp 28.000".
3. Berikan alasan singkat kenapa menu itu cocok untuk mereka (cukup 1-2 kalimat per menu).
4. Jika user menanyakan budget tertentu (misal: "budget 25 ribu"), pastikan total rekomendasi (atau menu yang direkomendasikan) tidak melebihi budget tersebut.
5. Jika user menyebutkan dia tidak suka kopi atau tidak bisa minum kafein, JANGAN merekomendasikan menu berkategori "kopi_panas" atau "kopi_dingin". Rekomendasikan kategori "non_kopi", "snack", atau "makanan_berat".
6. Gunakan bahasa Indonesia yang santai, hangat, bersahabat, dan tidak formal (gunakan kata panggilan "gw" untuk dirimu dan "kamu" untuk user), khas tongkrongan warkop modern di Aceh.
7. Jaga agar respons tetap padat dan ringkas (maksimal 150 kata per respons).
8. Selalu akhiri dengan pertanyaan atau ajakan ramah untuk bertanya lebih lanjut.
9. Jika user memilih mood tertentu (misal: "happy", "ngantuk", "belajar", "kerja", "nongkrong"), prioritaskan menu yang memiliki mood tersebut pada field "mood_cocok" di data menu.
10. JANGAN pernah merekomendasikan menu yang tidak tersedia ("tersedia": false).
11. Jangan membahas hal-hal di luar menu, cafe, warkop, kopi, makanan, atau reservasi meja KUPITA.

FORMAT RESPONS (WAJIB DIIKUTI):
Mulai dengan 1 kalimat empati atau respon hangat ke user (misalnya: "Wah, pas banget nih..." atau "Boleh banget, gw bantu pilihin ya!").
Lalu berikan daftar rekomendasi menu dengan format terstruktur menggunakan emoji yang sesuai:
- [Emoji] **[Nama Menu]** — Rp [Harga]  
  [Alasan singkat kenapa cocok]

Tampilkan total estimasi harga jika merekomendasikan kombinasi hidangan (misal makanan + minuman):
Total estimasi: Rp [Total]

Akhiri dengan pertanyaan penutup yang bersahabat (misalnya: "Gimana, ada yang bikin kamu tertarik? 😊" atau "Mau coba rekomendasi ini, atau mau cari rasa lain?").
`;

    const modelCandidates = [
      'gemini-2.5-flash',
      'gemini-2.5-flash-lite',
      'gemini-3.5-flash',
      'gemini-flash-latest'
    ];

    let responseText = '';
    let success = false;
    let lastError: any = null;

    for (const modelName of modelCandidates) {
      try {
        console.log(`Trying Gemini model: ${modelName}...`);
        const model = genAI.getGenerativeModel({
          model: modelName,
          systemInstruction: systemPrompt,
        });

        const chat = model.startChat({
          history: history,
        });

        const result = await chat.sendMessage(latestMessageText);
        responseText = result.response.text();
        success = true;
        console.log(`Successfully got response from model: ${modelName}`);
        break;
      } catch (e: any) {
        console.warn(`Model ${modelName} failed:`, e.message || e);
        lastError = e;
      }
    }

    if (!success) {
      const errStr = lastError?.message || '';
      console.error('All Gemini model candidates failed. Last error:', lastError);
      
      // Direct diagnostic check to find which models the API key supports
      let diagnosticInfo = '';
      try {
        const diagRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`);
        const diagData = await diagRes.json();
        if (diagData.models) {
          const modelNames = diagData.models.map((m: any) => m.name.replace('models/', ''));
          diagnosticInfo = ` [Model aktif untuk key ini: ${modelNames.join(', ')}]`;
        } else if (diagData.error) {
          diagnosticInfo = ` [Detail error: ${diagData.error.message}]`;
        }
      } catch (diagErr: any) {
        diagnosticInfo = ` [Gagal diagnosis: ${diagErr.message}]`;
      }
      
      // Check if it is a quota or rate limit error
      if (errStr.includes('429') || errStr.toLowerCase().includes('quota') || errStr.toLowerCase().includes('limit')) {
        return NextResponse.json(
          { 
            error: `Waduh, limit gratisan Gemini API kamu lagi habis nih (terlalu banyak request dalam semenit).${diagnosticInfo} Coba tunggu sekitar 1 menit lagi, trus klik "Coba Lagi" ya! ☕` 
          },
          { status: 429 }
        );
      } else if (errStr.includes('503')) {
        return NextResponse.json(
          { 
            error: `Waduh, server Google Gemini lagi sibuk banget (503 Service Unavailable).${diagnosticInfo} Coba beberapa saat lagi, trus klik "Coba Lagi" ya! ☕` 
          },
          { status: 503 }
        );
      } else {
        return NextResponse.json(
          { error: `Gagal memanggil Gemini: ${errStr}.${diagnosticInfo}` },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({ text: responseText });
  } catch (error: any) {
    console.error('Error in Gemini API route:', error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
