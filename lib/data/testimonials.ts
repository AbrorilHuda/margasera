export interface Testimonial {
  id: string;
  bookingCode?: string | null;
  name: string;
  eventType: string;
  location: string;
  message: string;
  rating: number;
  date: string;
  source: 'Google Review' | 'Client Review';
}

export const CLIENT_TESTIMONIALS: Testimonial[] = [
  {
    id: 'testi-1',
    bookingCode: 'MS-260110-001',
    name: 'Aulia & Fajar',
    eventType: 'Wedding',
    location: 'Pamekasan',
    message: 'Hasil fotonya benar-benar sesuai slogan Margasera, "Moment Satu Hari Untuk Selamanya". Tone warnanya timeless dan cinematic. Tim fotografer sangat humble, tepat waktu, dan membuat kami merasa tenang sepanjang hari pernikahan.',
    rating: 5,
    date: 'Januari 2026',
    source: 'Google Review',
  },
  {
    id: 'testi-2',
    name: 'Kevin & Clara',
    eventType: 'Pre-Wedding',
    location: 'Madura',
    message: 'Konsep editorial pre-weddingnya keren banget! Kami yang awalnya kaku di depan kamera diarahkan dengan sangat nyaman. Pengambilan sudut pencahayaannya magis, hasilnya seperti di majalah fesyen.',
    rating: 5,
    date: 'Februari 2026',
    source: 'Client Review',
  },
  {
    id: 'testi-3',
    name: 'Rizky & Nabila',
    eventType: 'Engagement',
    location: 'Pamekasan, Madura',
    message: 'Dokumentasi acara pertunangan dan lamaran kami tertata dengan sangat rapi dan estetik. Respon admin cepat, penyerahan preview dan album cetaknya mewah sekali. Terima kasih Margasera!',
    rating: 5,
    date: 'Maret 2026',
    source: 'Client Review',
  },
  {
    id: 'testi-4',
    name: 'Dewi & Hendra',
    eventType: 'Siraman',
    location: 'Pamekasan',
    message: 'Dokumentasi prosesi siraman adat Jawa-Madura diabadikan dengan penuh rasa khidmat dan haru. Momen sungkeman orang tua tertangkap begitu mendalam dan jujur.',
    rating: 5,
    date: 'Desember 2025',
    source: 'Google Review',
  },
  {
    id: 'testi-5',
    name: 'Dinda Lestari, S.Farm',
    eventType: 'Wisuda Outdoor',
    location: 'Pamekasan',
    message: 'Foto wisuda outdoor bersama keluarga jadi kenangan yang sangat berharga. Arahan pose sangat natural dan pengerjaan tone editnya super cepat. Sangat recommended untuk wisudawan di Madura!',
    rating: 5,
    date: 'November 2025',
    source: 'Google Review',
  },
  {
    id: 'testi-6',
    name: 'Bagus Prakoso, S.T',
    eventType: 'Sidang Skripsi',
    location: 'Pamekasan',
    message: 'Dokumentasi momen kelulusan sidang skripsi langsung diabadikan dengan tone yang gagah dan memorable. Terima kasih Margasera sudah mengabadikan milestone penting hidup saya.',
    rating: 5,
    date: 'Januari 2026',
    source: 'Client Review',
  },
  {
    id: 'testi-7',
    name: 'Ibu Ratna & Bayi Arka',
    eventType: 'Tasyakuran 40 Hari Bayi',
    location: 'Madura',
    message: 'Mulai dari sesi foto hingga tasyakuran 40 hari kelahiran anak pertama kami, hasilnya sangat lembut dan penuh kehangatan keluarga. Benar-benar fotografer terpercaya di Madura.',
    rating: 5,
    date: 'Februari 2026',
    source: 'Google Review',
  },
];
