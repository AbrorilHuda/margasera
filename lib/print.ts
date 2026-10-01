'use client';

/**
 * Mencetak dokumen secara universal (kompatibel penuh dengan iOS Safari, Chrome iPad/iPhone, Android, Windows & Mac).
 *
 * Menggunakan teknik Direct DOM Mount:
 * 1. Mengkloning elemen target ke mount container langsung di document.body (#margasera-print-mount).
 * 2. Mengaktifkan class `margasera-is-printing` pada <body>.
 * 3. Melalui CSS @media print, semua elemen dashboard, modal backdrop gelap, dan navbar disembunyikan.
 * 4. Memanggil window.print() langsung pada window utama (menghindari bug parent-override WebKit iOS).
 * 5. Membersihkan DOM setelah print dialog selesai (afterprint).
 */
export function printDocument(elementId: string, title: string = 'Margasera Official Document') {
  if (typeof window === 'undefined') return;

  const targetEl = document.getElementById(elementId);
  if (!targetEl) {
    window.print();
    return;
  }

  // Bersihkan mount atau class lama jika ada sesi sebelumnya yang tertinggal
  document.body.classList.remove('margasera-is-printing');
  const oldMount = document.getElementById('margasera-print-mount');
  if (oldMount) {
    oldMount.remove();
  }

  // Clone elemen yang ingin dicetak
  const clone = targetEl.cloneNode(true) as HTMLElement;
  clone.id = 'margasera-print-clone';
  clone.style.overflow = 'visible';
  clone.style.height = 'auto';
  clone.style.maxHeight = 'none';

  // Pastikan seluruh elemen child (seperti wrapper tabel .overflow-x-auto) tidak memiliki overflow
  // yang membuat browser menganggapnya 'monolithic block' dan melompatkan seluruh tabel ke halaman 2
  const scrollableElements = clone.querySelectorAll<HTMLElement>(
    '.overflow-x-auto, .overflow-y-auto, [class*="overflow-"]'
  );
  scrollableElements.forEach((el) => {
    el.style.overflow = 'visible';
    el.style.maxHeight = 'none';
    el.style.height = 'auto';
  });

  // Buat mount container langsung di bawah document.body
  const printMount = document.createElement('div');
  printMount.id = 'margasera-print-mount';
  printMount.appendChild(clone);
  document.body.appendChild(printMount);

  // Simpan judul asli dan ubah judul agar nama default file PDF sesuai
  const originalTitle = document.title;
  if (title) {
    document.title = title;
  }

  // Aktifkan mode cetak
  document.body.classList.add('margasera-is-printing');

  // Fungsi cleanup setelah print selesai / dibatalkan
  let isCleanedUp = false;
  const cleanup = () => {
    if (isCleanedUp) return;
    isCleanedUp = true;

    document.body.classList.remove('margasera-is-printing');
    if (title) {
      document.title = originalTitle;
    }
    const mountEl = document.getElementById('margasera-print-mount');
    if (mountEl) {
      mountEl.remove();
    }

    window.removeEventListener('afterprint', cleanup);
    window.removeEventListener('focus', onFocus);
  };

  const onFocus = () => {
    // Pada iOS WebKit, dialog AirPrint menutup dan mengembalikan fokus ke window
    setTimeout(cleanup, 500);
  };

  window.addEventListener('afterprint', cleanup, { once: true });
  window.addEventListener('focus', onFocus, { once: true });

  // Beri sedikit jeda agar WebKit (iOS) / Blink (Android) selesai me-render klon sebelum memunculkan print dialog
  requestAnimationFrame(() => {
    setTimeout(() => {
      try {
        window.print();
      } catch (err) {
        console.error('[Print Error]:', err);
        cleanup();
      }
    }, 150);
  });
}
