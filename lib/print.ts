'use client';

/**
 * Mencetak elemen DOM tertentu secara terisolasi menggunakan iframe tersembunyi.
 * Pendekatan ini 100% immune terhadap:
 * 1. Offset modal / fixed backdrop / scroll position pada perangkat mobile (iOS & Android).
 * 2. Halaman kedua kosong (blank page) karena elemen layout admin yang tidak terlihat.
 * 3. Ruang putih kosong di bagian atas pada Safari iOS / iPad.
 */
export function printDocument(elementId: string, title: string = 'Margasera Official Document') {
  if (typeof window === 'undefined') return;

  const targetEl = document.getElementById(elementId);
  if (!targetEl) {
    window.print();
    return;
  }

  // Hapus iframe print lama jika ada
  const oldIframe = document.getElementById('margasera-print-frame');
  if (oldIframe) {
    oldIframe.remove();
  }

  const iframe = document.createElement('iframe');
  iframe.id = 'margasera-print-frame';
  iframe.style.position = 'fixed';
  iframe.style.top = '0';
  iframe.style.left = '0';
  iframe.style.width = '100%';
  iframe.style.height = '100%';
  iframe.style.zIndex = '-99999';
  iframe.style.opacity = '0';
  iframe.style.pointerEvents = 'none';
  iframe.style.border = 'none';
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow?.document;
  if (!doc) {
    window.print();
    return;
  }

  // Kumpulkan semua stylesheet & style tag dari halaman utama
  const styleNodes = Array.from(document.querySelectorAll('link[rel="stylesheet"], style'));
  const stylesHtml = styleNodes.map((node) => node.outerHTML).join('\n');

  // Clone konten elemen
  const clone = targetEl.cloneNode(true) as HTMLElement;
  clone.id = 'print-root';
  clone.style.overflow = 'visible';
  clone.style.height = 'auto';
  clone.style.maxHeight = 'none';

  doc.open();
  doc.write(`
    <!DOCTYPE html>
    <html lang="id">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>${title}</title>
        ${stylesHtml}
        <style>
          @page {
            size: A4 portrait;
            margin: 8mm 10mm;
          }
          *, *::before, *::after {
            box-sizing: border-box;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          html, body {
            margin: 0 !important;
            padding: 0 !important;
            background: #ffffff !important;
            color: #09090b !important;
            font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
            width: 100% !important;
            height: auto !important;
            overflow: visible !important;
          }
          #print-root {
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
            padding: 0.25rem 0.5rem !important;
            background: #ffffff !important;
            color: #09090b !important;
            gap: 1.25rem !important;
            overflow: visible !important;
            height: auto !important;
            max-height: none !important;
          }
          /* Logo kontras tajam hitam di atas kertas putih */
          img[src*="logo.png"] {
            filter: brightness(0) !important;
          }
          /* Paksa layout 2-kolom & flex horizontal khas A4 */
          .print-flex-row {
            display: flex !important;
            flex-direction: row !important;
            justify-content: space-between !important;
            align-items: flex-start !important;
          }
          .print-grid-2 {
            display: grid !important;
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
            gap: 1.25rem !important;
          }
          .print-grid-4 {
            display: grid !important;
            grid-template-columns: repeat(4, minmax(0, 1fr)) !important;
            gap: 0.75rem !important;
          }
          .print-text-right {
            text-align: right !important;
          }
          .print-items-end {
            align-items: flex-end !important;
          }
          /* Hindari page break di tengah baris tabel atau kartu */
          table, tr, td, th, .print-grid-2, .print-grid-4 {
            break-inside: avoid !important;
            page-break-inside: avoid !important;
          }
        </style>
      </head>
      <body>
        <div id="print-wrapper">
          ${clone.outerHTML}
        </div>
      </body>
    </html>
  `);
  doc.close();

  // Beri jeda sejenak agar browser merender font & gambar sebelum print
  setTimeout(() => {
    try {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
    } catch {
      window.print();
    }
  }, 350);
}
