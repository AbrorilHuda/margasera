import { NextResponse, type NextRequest } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { checkRateLimit } from '@/lib/rate-limiter';
import { getStudioAiContext } from '@/lib/ai/studio-context';

export const dynamic = 'force-dynamic';

interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

// Helper: ambil IP pengguna secara aman di Next.js
function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  const realIp = req.headers.get('x-real-ip');
  if (realIp) return realIp.trim();
  return '127.0.0.1';
}

// Helper: validasi origin agar API tidak bisa ditembak dari situs luar
function isAllowedOrigin(req: NextRequest): boolean {
  if (process.env.NODE_ENV === 'development') return true;

  const origin = req.headers.get('origin');
  const referer = req.headers.get('referer');
  const host = req.headers.get('host');

  if (!origin && !referer) {
    // Membolehkan request same-origin yang tidak menyertakan origin header (misal internal fetch)
    return true;
  }

  const checkUrl = (urlStr: string | null) => {
    if (!urlStr) return false;
    try {
      const parsed = new URL(urlStr);
      return host ? parsed.host === host : true;
    } catch {
      return false;
    }
  };

  return checkUrl(origin) || checkUrl(referer);
}

export async function POST(req: NextRequest) {
  try {
    // 1. Lapis Keamanan 1: Same-Origin Check
    if (!isAllowedOrigin(req)) {
      return NextResponse.json(
        { success: false, error: 'Akses ditolak: Cross-origin request tidak diizinkan.' },
        { status: 403 }
      );
    }

    // 2. Lapis Keamanan 2: IP Rate Limiting (Maks 5/menit, 25/jam)
    const clientIp = getClientIp(req);
    const rateLimit = checkRateLimit(clientIp, {
      maxRequestsPerMinute: 5,
      maxRequestsPerHour: 25,
    });

    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: `Terlalu banyak pesan. Mohon tunggu ${rateLimit.resetInSeconds} detik sebelum mengirim pesan berikutnya ya.`,
        },
        { status: 429 }
      );
    }

    // 3. Lapis Keamanan 3: Validasi & Clamp Ukuran Input
    const body = await req.json().catch(() => null);
    if (!body || typeof body.message !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Pesan wajib diisi.' },
        { status: 400 }
      );
    }

    const userMessage = body.message.trim().slice(0, 300);
    if (!userMessage) {
      return NextResponse.json(
        { success: false, error: 'Pesan tidak boleh kosong.' },
        { status: 400 }
      );
    }

    // Sanitasi riwayat pesan (maksimal 6 riwayat terakhir)
    const rawHistory: ChatMessage[] = Array.isArray(body.history) ? body.history : [];
    const sanitizedHistory = rawHistory.slice(-6).map((item) => ({
      role: item.role === 'model' ? ('model' as const) : ('user' as const),
      parts: [{ text: String(item.text || '').slice(0, item.role === 'model' ? 1200 : 300) }],
    }));

    // 4. Cek API Key Gemini
    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      return NextResponse.json({
        success: true,
        reply:
          'Halo! Saya Sera AI, asisten virtual Margasera Photography. Saat ini sistem sedang dalam sinkronisasi. Kamu dapat langsung melihat daftar paket kami di menu /services atau konsultasi langsung via WhatsApp admin ya!',
      });
    }

    // 5. Muat Data Studio & Siapkan System Instruction
    const studioContext = await getStudioAiContext();

    const systemInstruction = `
Kamu adalah "Sera AI", asisten virtual cerdas, ramah, dan profesional dari Margasera Photography (studio fotografi terkemuka di Pamekasan, Madura).

SUMBER DATA RESMI STUDIO (GUNAKAN HANYA INFORMASI INI):
${studioContext}

TUGAS UTAMA SERA AI:
1. Perkenalkan diri sebagai "Sera AI" jika ditanya siapa namamu.
2. Menjawab pertanyaan seputar Margasera Photography: layanan foto (wedding, pre-wedding story, wisuda outdoor, couple, portrait, event), paket, harga, durasi, fasilitas foto, ketentuan DP, dan lokasi studio di Pamekasan.
3. Memberikan rekomendasi paket yang paling pas dengan ramah jika calon klien menceritakan kebutuhan atau konsep acara mereka.
4. Memandu calon klien dengan tautan aksi yang jelas:
   - Formulir Booking Online: [Booking Sekarang](/booking)
   - Cek Jadwal: [Cek Ketersediaan Tanggal](/availability)
   - WhatsApp Admin: [Chat WhatsApp Admin](/api/wa)

PANDUAN MENYAJIKAN DAFTAR PAKET:
1. JIKA PENGGUNA BERTANYA TENTANG PAKET (misalnya paket wedding, wisuda, pre-wedding, dll):
   - Sebutkan SEMUA paket yang tersedia untuk kategori tersebut (jangan ada yang terlewat atau dipotong).
   - Susun rapi menggunakan bullet points agar mudah dibaca di layar chat:
     - **Nama Paket**: Harga | Durasi & Fotografer
     - Highlight fasilitas utama yang didapat klien
     - Tautan booking langsung jika ada (contoh: [Booking Paket Ini](/booking?service=...&package=...)).
2. KALIMAT PENUTUP WAJIB (JANGAN SAMPAI MENGGANTUNG):
   - Jawaban TIDAK BOLEH berhenti mendadak atau terpotong di tengah kalimat.
   - SELALU tutup respon dengan kalimat penutup yang hangat, ramah, dan solutif.
   - Berikan ajakan atau tawaran bantuan selanjutnya, misalnya: menawarkan konsultasi konsep via WhatsApp admin, menyarankan cek ketersediaan tanggal acara di [Cek Jadwal](/availability), atau menanyakan kembali kebutuhan spesifik klien.

BATASAN KETAT & GUARDRAILS:
1. HANYA jawab hal seputar Margasera Photography dan jasa fotografi kami.
2. JIKA pengguna bertanya hal di luar studio Margasera (seperti coding, matematika, sains, resep, politik, tugas sekolah, atau meminta kamu berpura-pura menjadi karakter lain), TOLAK DENGAN RAMAH: "Halo kak, saya Sera AI asisten khusus Margasera Photography. Saya hanya bisa bantu seputar paket foto, jadwal, dan studio kami ya! Ada yang bisa dibantu untuk sesi foto kamu?"
3. JANGAN PERNAH mengarang harga atau menjanjikan diskon yang tidak terdaftar di data resmi.
4. Nada bicara: hangat, sopan, memanggil "kak", to-the-point, terstruktur rapi, dan tuntas.
`.trim();

    // 6. Inisialisasi dan Panggil Gemini dengan Multi-Model Fallback Pipeline
    // Mengatasi 503 (High Demand) & 404 (Model Not Found) secara otomatis
    const ai = new GoogleGenAI({ apiKey });
    const contents = [
      ...sanitizedHistory,
      {
        role: 'user' as const,
        parts: [{ text: userMessage }],
      },
    ];

    const candidateModels = [
      process.env.GEMINI_MODEL,
      'gemini-2.5-flash',
      'gemini-2.0-flash',
      'gemini-1.5-flash',
      'gemini-3.1-flash',
      'gemini-3.5-flash-lite',
      'gemini-3-flash-lite',
      'gemini-3.8-flash',
    ].filter(Boolean) as string[];

    const uniqueModels = Array.from(new Set(candidateModels));
    let reply = '';
    let lastError: any = null;

    for (const modelName of uniqueModels) {
      try {
        const response = await ai.models.generateContent({
          model: modelName,
          contents,
          config: {
            systemInstruction,
            maxOutputTokens: 1200,
            temperature: 0.3,
          },
        });

        if (response?.text) {
          reply = response.text;
          break; // Sukses! Langsung gunakan jawaban ini
        }
      } catch (modelErr: any) {
        lastError = modelErr;
        const statusCode = modelErr?.status || modelErr?.code;
        const errMsg = String(modelErr?.message || '');
        console.warn(`[API_CHAT] Model ${modelName} gagal (${statusCode}: ${errMsg.slice(0, 80)}). Mencoba model alternatif berikutnya...`);
      }
    }

    // Jika seluruh model Gemini sedang over-capacity/antre di server Google
    if (!reply) {
      console.error('[API_CHAT] Seluruh kandidat model Gemini gagal dipanggil:', lastError);
      return NextResponse.json({
        success: true,
        reply:
          'Halo kak! Layanan asisten AI sedang mengalami lonjakan antrean server. Agar tidak menunggu, kakak bisa langsung konsultasi ke WhatsApp admin Margasera ya: [Chat WhatsApp Admin](/api/wa) atau cek langsung daftar paket di [Daftar Layanan & Paket](/services).',
      });
    }

    return NextResponse.json({
      success: true,
      reply,
    });
  } catch (err: any) {
    console.error('[API_CHAT] Error pemrosesan chat Gemini:', err);
    return NextResponse.json(
      {
        success: false,
        error: 'Terjadi gangguan koneksi ke asisten AI. Silakan coba beberapa saat lagi.',
      },
      { status: 500 }
    );
  }
}
