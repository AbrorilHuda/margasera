import ExcelJS from 'exceljs';
import { formatCurrency, formatDate, getBookingPaidAmount } from '@/lib/utils';
import type { Booking, Service, Package } from '@/lib/types';

export interface ExportAnalyticsOptions {
  selectedYear: number | 'all';
  bookings: Booking[];
  services: Service[];
  packages: Package[];
  studioName?: string;
}

/**
 * Menghasilkan gambar grafik resolusi tinggi (Canvas) untuk disematkan ke dalam sheet Excel
 */
function generateChartSnapshot(
  servicesData: Array<{ name: string; count: number; percentage: number; isZero: boolean }>,
  packagesData: Array<{ name: string; count: number; percentage: number; color: string; isBestSeller: boolean }>,
  yearLabel: string,
  totalBookings: number,
  totalRevenue: number,
  topServiceName: string,
  zeroOrderCount: number
): string {
  // Hanya berjalan di browser
  if (typeof document === 'undefined') return '';

  const width = 1100;
  const height = 480;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  // Background Putih Bersih
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, width, height);

  // Border & Header Panel
  ctx.fillStyle = '#F8FAFC';
  ctx.fillRect(16, 16, width - 32, 70);
  ctx.strokeStyle = '#E2E8F0';
  ctx.lineWidth = 1;
  ctx.strokeRect(16, 16, width - 32, 70);

  // Garis Aksen Biru di atas
  ctx.fillStyle = '#0066CC';
  ctx.fillRect(16, 16, width - 32, 4);

  // Header Title
  ctx.fillStyle = '#0F172A';
  ctx.font = 'bold 20px sans-serif';
  ctx.fillText('MARGASERA PHOTOGRAPHY — ANALISIS LAYANAN & PAKET', 34, 46);

  ctx.fillStyle = '#64748B';
  ctx.font = '12px sans-serif';
  ctx.fillText(`Periode Analisis: ${yearLabel}   •   Dicetak Pada: ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}`, 34, 68);

  // Badge Status Kinerja di Kanan Header
  ctx.fillStyle = '#0066CC';
  ctx.font = 'bold 12px sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText(`Total: ${totalBookings} Booking  |  ${formatCurrency(totalRevenue)}`, width - 34, 46);

  ctx.fillStyle = zeroOrderCount > 0 ? '#D97706' : '#16A34A';
  ctx.font = '11px sans-serif';
  ctx.fillText(
    zeroOrderCount > 0 ? `💡 Info: ${zeroOrderCount} Katalog Belum Ada Pesanan (Peluang Promosi)` : '✅ Seluruh Layanan Memiliki Pesanan Aktif',
    width - 34,
    68
  );
  ctx.textAlign = 'left';

  // =========================================================================
  // PANEL KIRI: GRAFIK BATANG HORIZONTAL LAYANAN (X = 30, Y = 105, W = 500)
  // =========================================================================
  ctx.fillStyle = '#0F172A';
  ctx.font = 'bold 14px sans-serif';
  ctx.fillText('📊 GRAFIK VOLUME ORDER LAYANAN', 34, 125);

  const leftX = 34;
  const leftY = 140;
  const barWidthMax = 320;
  const maxCount = Math.max(...servicesData.map((s) => s.count), 1);

  const topServicesToDraw = servicesData.slice(0, 7); // Tampilkan hingga 7 teratas di grafik
  topServicesToDraw.forEach((srv, idx) => {
    const curY = leftY + idx * 42;

    // Nama Layanan
    ctx.fillStyle = srv.isZero ? '#94A3B8' : '#1E293B';
    ctx.font = '12px sans-serif';
    const label = `${idx + 1}. ${srv.name.length > 20 ? srv.name.substring(0, 18) + '...' : srv.name}`;
    ctx.fillText(label, leftX, curY + 14);

    // Background Bar
    const barStartX = leftX + 160;
    ctx.fillStyle = '#F1F5F9';
    ctx.beginPath();
    ctx.roundRect(barStartX, curY, barWidthMax, 18, 9);
    ctx.fill();

    // Isi Bar
    const curWidth = srv.count > 0 ? Math.max((srv.count / maxCount) * barWidthMax, 16) : 0;
    if (curWidth > 0) {
      ctx.fillStyle = idx === 0 ? '#0066CC' : idx === 1 ? '#0284C7' : '#38BDF8';
      ctx.beginPath();
      ctx.roundRect(barStartX, curY, curWidth, 18, 9);
      ctx.fill();

      // Angka di dalam/ujung bar
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 10px sans-serif';
      ctx.fillText(`${srv.count}`, barStartX + 8, curY + 13);
    }

    // Angka Order di Kanan Bar
    ctx.fillStyle = srv.isZero ? '#D97706' : '#0F172A';
    ctx.font = 'bold 11px sans-serif';
    ctx.fillText(srv.isZero ? '0 Order (Belum Ada Pesanan)' : `${srv.count} Order (${srv.percentage}%)`, barStartX + barWidthMax + 12, curY + 14);
  });

  // Garis Pembatas Vertikal di Tengah
  ctx.strokeStyle = '#E2E8F0';
  ctx.beginPath();
  ctx.moveTo(610, 105);
  ctx.lineTo(610, height - 20);
  ctx.stroke();

  // =========================================================================
  // PANEL KANAN: DONUT CHART KOMPOSISI PAKET TERLARIS (X = 640 s/d 1060)
  // =========================================================================
  ctx.fillStyle = '#0F172A';
  ctx.font = 'bold 14px sans-serif';
  ctx.fillText('🍩 KOMPOSISI PAKET (DONUT CHART)', 640, 125);

  const centerX = 750;
  const centerY = 270;
  const outerRadius = 85;
  const innerRadius = 50;

  // Total order paket untuk kalkulasi sudut
  const totalPkgOrders = packagesData.reduce((acc, p) => acc + p.count, 0);

  if (totalPkgOrders === 0) {
    // Lingkaran abu-abu kosong jika belum ada data
    ctx.strokeStyle = '#CBD5E1';
    ctx.lineWidth = 30;
    ctx.beginPath();
    ctx.arc(centerX, centerY, 68, 0, 2 * Math.PI);
    ctx.stroke();

    ctx.fillStyle = '#64748B';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Belum ada', centerX, centerY - 6);
    ctx.fillText('pesanan paket', centerX, centerY + 12);
    ctx.textAlign = 'left';
  } else {
    // Gambar Slices Donut Chart
    let startAngle = -0.5 * Math.PI;

    packagesData.slice(0, 6).forEach((pkg) => {
      const sliceAngle = (pkg.count / totalPkgOrders) * (2 * Math.PI);
      const endAngle = startAngle + sliceAngle;

      ctx.beginPath();
      ctx.arc(centerX, centerY, outerRadius, startAngle, endAngle);
      ctx.arc(centerX, centerY, innerRadius, endAngle, startAngle, true);
      ctx.closePath();
      ctx.fillStyle = pkg.color;
      ctx.fill();

      startAngle = endAngle;
    });

    // Label di tengah Donut
    ctx.fillStyle = '#0F172A';
    ctx.font = 'bold 22px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`${totalPkgOrders}`, centerX, centerY + 2);

    ctx.fillStyle = '#64748B';
    ctx.font = '10px sans-serif';
    ctx.fillText('Total Paket', centerX, centerY + 18);
    ctx.textAlign = 'left';
  }

  // Legenda Paket di Sebelah Kanan Donut
  const legendX = 870;
  const legendY = 170;

  packagesData.slice(0, 6).forEach((pkg, idx) => {
    const curY = legendY + idx * 38;

    // Dot Warna
    ctx.fillStyle = pkg.color;
    ctx.beginPath();
    ctx.arc(legendX, curY + 6, 6, 0, 2 * Math.PI);
    ctx.fill();

    // Nama Paket
    ctx.fillStyle = '#1E293B';
    ctx.font = 'bold 11px sans-serif';
    const pkgLabel = pkg.name.length > 18 ? pkg.name.substring(0, 16) + '...' : pkg.name;
    ctx.fillText(pkgLabel, legendX + 16, curY + 6);

    if (pkg.isBestSeller) {
      ctx.fillStyle = '#DC2626';
      ctx.font = 'bold 9px sans-serif';
      ctx.fillText('🔥 BEST SELLER', legendX + 16, curY + 18);
    } else {
      ctx.fillStyle = '#64748B';
      ctx.font = '10px sans-serif';
      ctx.fillText(`${pkg.count} order (${pkg.percentage}%)`, legendX + 16, curY + 18);
    }
  });

  return canvas.toDataURL('image/png');
}

/**
 * Fungsi Utama: Menghasilkan File Excel (.xlsx) dengan Grafik Snapshot,
 * Analisis Layanan Terlaris s/d 0 Order, Analisis Paket, dan Lembar Evaluasi Bisnis.
 */
export async function exportAnalyticsToExcel({
  selectedYear,
  bookings,
  services,
  packages,
  studioName = 'Studio Margasera',
}: ExportAnalyticsOptions): Promise<void> {
  // 1. Filter bookings sesuai tahun terpilih (abaikan cancelled)
  const validBookings = bookings.filter((b) => {
    if (b.status === 'cancelled') return false;
    if (selectedYear === 'all') return true;
    const dateStr = b.bookingDate || b.createdAt;
    if (!dateStr) return false;
    return parseInt(dateStr.substring(0, 4), 10) === selectedYear;
  });

  const totalBookings = validBookings.length;
  let totalRevenue = 0;

  // 2. Agregasi Data per Layanan (Sertakan SEMUA layanan dari master data agar yang 0 order tetap masuk)
  const serviceStatsMap = new Map<
    string,
    {
      serviceId: string;
      serviceName: string;
      description: string;
      count: number;
      revenue: number;
      packageCounts: Map<string, { packageName: string; count: number; revenue: number; price: number }>;
    }
  >();

  // Inisialisasi seluruh master service agar yang 0 order tidak terlewat
  services.forEach((s) => {
    serviceStatsMap.set(s.id, {
      serviceId: s.id,
      serviceName: s.name,
      description: s.description || '-',
      count: 0,
      revenue: 0,
      packageCounts: new Map(),
    });
  });

  // Masukkan data transaksi
  validBookings.forEach((b) => {
    const paid = getBookingPaidAmount(b) || b.totalPrice || 0;
    totalRevenue += paid;

    let sId = b.serviceId;
    // Jika serviceId tidak ketemu di master, cocokkan dengan slug atau nama
    if (!sId || !serviceStatsMap.has(sId)) {
      const match = services.find((s) => s.id === b.serviceId || s.slug === b.serviceId || s.name === b.serviceName);
      sId = match ? match.id : b.serviceId || 'unknown_service';
    }

    if (!serviceStatsMap.has(sId)) {
      serviceStatsMap.set(sId, {
        serviceId: sId,
        serviceName: b.serviceName || 'Layanan Lainnya',
        description: '-',
        count: 0,
        revenue: 0,
        packageCounts: new Map(),
      });
    }

    const sEntry = serviceStatsMap.get(sId)!;
    sEntry.count += 1;
    sEntry.revenue += paid;

    const pId = b.packageId || 'unknown_pkg';
    const matchedPkg = packages.find((p) => p.id === b.packageId || p.slug === b.packageId);
    const pName = b.packageName || matchedPkg?.name || 'Paket Umum';
    const pPrice = matchedPkg?.price || 0;

    if (!sEntry.packageCounts.has(pId)) {
      sEntry.packageCounts.set(pId, {
        packageName: pName,
        count: 0,
        revenue: 0,
        price: pPrice,
      });
    }

    const pEntry = sEntry.packageCounts.get(pId)!;
    pEntry.count += 1;
    pEntry.revenue += paid;
  });

  // Konversi layanan ke array terurut (Dari paling laris ke 0 order)
  const sortedServices = Array.from(serviceStatsMap.values()).sort(
    (a, b) => b.count - a.count || b.revenue - a.revenue
  );

  // 3. Agregasi Data per Paket (Sertakan SEMUA paket dari master data agar paket 0 order terdeteksi)
  const packageStatsList: Array<{
    packageId: string;
    packageName: string;
    serviceName: string;
    price: number;
    count: number;
    revenue: number;
    percentageOfService: number;
    isBestSeller: boolean;
    statusLabel: string;
    actionNote: string;
  }> = [];

  packages.forEach((pkg) => {
    // Cari layanan induk
    const parentService = services.find((s) => s.id === pkg.serviceId);
    const sName = parentService ? parentService.name : 'Umum';

    // Cari berapa kali dipesan
    const bookingsForPkg = validBookings.filter(
      (b) => b.packageId === pkg.id || b.packageId === pkg.slug
    );
    const count = bookingsForPkg.length;
    const rev = bookingsForPkg.reduce(
      (sum, b) => sum + (getBookingPaidAmount(b) || b.totalPrice || 0),
      0
    );

    const parentTotal = parentService ? serviceStatsMap.get(parentService.id)?.count || 0 : 0;
    const percentage = parentTotal > 0 ? Math.round((count / parentTotal) * 100) : 0;

    let statusLabel = '🟢 Normal';
    let actionNote = 'Performa stabil.';

    if (count === 0) {
      statusLabel = '💡 Belum Ada Pesanan (0 Order)';
      actionNote = 'Peluang promo: optimalkan penawaran, tinjau harga, atau buat paket bundling baru.';
    } else if (count >= 10 || percentage >= 40) {
      statusLabel = '🔥 BEST SELLER';
      actionNote = 'Pertahankan kualitas & jadikan referensi utama portofolio.';
    } else if (count <= 2) {
      statusLabel = '⚠️ Peminat Rendah';
      actionNote = 'Tawarkan diskon bundling atau buat video reels contoh hasil fotonya.';
    }

    packageStatsList.push({
      packageId: pkg.id,
      packageName: pkg.name,
      serviceName: sName,
      price: pkg.price,
      count,
      revenue: rev,
      percentageOfService: percentage,
      isBestSeller: false,
      statusLabel,
      actionNote,
    });
  });

  // Urutkan paket: Laris -> Kurang Laris -> 0 Order
  packageStatsList.sort((a, b) => b.count - a.count || b.revenue - a.revenue);

  // Tandai Best Seller di setiap service
  const bestSellerPerService = new Set<string>();
  packageStatsList.forEach((p) => {
    if (p.count > 0 && !bestSellerPerService.has(p.serviceName)) {
      bestSellerPerService.add(p.serviceName);
      p.isBestSeller = true;
      p.statusLabel = '🔥 BEST SELLER';
    }
  });

  // Siapkan ringkasan 0 order untuk indikator
  const zeroServices = sortedServices.filter((s) => s.count === 0);
  const zeroPackages = packageStatsList.filter((p) => p.count === 0);
  const totalZeroUnderperformers = zeroServices.length + zeroPackages.length;

  const yearLabel = selectedYear === 'all' ? 'Semua Periode (All Time)' : `Tahun ${selectedYear}`;
  const topServiceName = sortedServices[0] ? sortedServices[0].serviceName : '-';

  // Siapkan data warna untuk donat
  const PKG_COLORS = ['#0066CC', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#06B6D4', '#64748B'];
  const packagesForChart = packageStatsList.slice(0, 6).map((p, idx) => ({
    name: p.packageName,
    count: p.count,
    percentage: totalBookings > 0 ? Math.round((p.count / totalBookings) * 100) : 0,
    color: PKG_COLORS[idx % PKG_COLORS.length],
    isBestSeller: p.isBestSeller,
  }));

  const servicesForChart = sortedServices.map((s) => ({
    name: s.serviceName,
    count: s.count,
    percentage: totalBookings > 0 ? Math.round((s.count / totalBookings) * 100) : 0,
    isZero: s.count === 0,
  }));

  // Buat Gambar Snapshot Grafik
  const chartImageBase64 = generateChartSnapshot(
    servicesForChart,
    packagesForChart,
    yearLabel,
    totalBookings,
    totalRevenue,
    topServiceName,
    totalZeroUnderperformers
  );

  // Inisialisasi Workbook ExcelJS
  const workbook = new ExcelJS.Workbook();
  workbook.creator = studioName;
  workbook.lastModifiedBy = 'Admin Margasera';
  workbook.created = new Date();
  workbook.modified = new Date();

  // =========================================================================
  // TAB 1: RINGKASAN & KINERJA LAYANAN (DENGAN GAMBAR GRAFIK)
  // =========================================================================
  const sheet1 = workbook.addWorksheet('Kinerja Layanan & Grafik', {
    views: [{ showGridLines: true }],
  });

  // Atur lebar kolom
  sheet1.columns = [
    { key: 'colA', width: 4 },
    { key: 'rank', width: 8 },
    { key: 'name', width: 34 },
    { key: 'status', width: 26 },
    { key: 'count', width: 16 },
    { key: 'percent', width: 18 },
    { key: 'revenue', width: 24 },
    { key: 'dominantPkg', width: 28 },
    { key: 'action', width: 42 },
  ];

  // Sisipkan Gambar Grafik Snapshot di atas sheet jika tersedia
  if (chartImageBase64) {
    const imageId = workbook.addImage({
      base64: chartImageBase64,
      extension: 'png',
    });

    sheet1.addImage(imageId, {
      tl: { col: 1, row: 1 }, // Mulai dari Cell B2
      ext: { width: 880, height: 384 },
    });
  }

  // Mulai tabel data setelah gambar grafik (baris ke-22)
  const startRowTable1 = 22;

  // Header Judul Tabel
  const titleRow1 = sheet1.getRow(startRowTable1);
  titleRow1.getCell(2).value = 'TABEL ANALISIS KINERJA SELURUH LAYANAN (TERLARIS S/D 0 ORDER)';
  titleRow1.getCell(2).font = { bold: true, size: 14, color: { argb: 'FF0066CC' } };
  sheet1.mergeCells(`B${startRowTable1}:I${startRowTable1}`);
  titleRow1.height = 28;

  // Header Kolom Tabel
  const headerRowIdx = startRowTable1 + 2;
  const headerRow = sheet1.getRow(headerRowIdx);
  headerRow.values = [
    '',
    'Rank',
    'Nama Layanan',
    'Status Kinerja',
    'Total Order',
    '% Pangsa Pasar',
    'Total Kas Omset',
    'Paket Paling Diminati',
    'Rekomendasi Manajemen',
  ];
  headerRow.height = 24;

  headerRow.eachCell((cell, colNumber) => {
    if (colNumber >= 2 && colNumber <= 9) {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF0066CC' },
      };
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 };
      cell.alignment = { vertical: 'middle', horizontal: colNumber === 3 ? 'left' : 'center' };
      cell.border = {
        top: { style: 'thin', color: { argb: 'FFCBD5E1' } },
        bottom: { style: 'thin', color: { argb: 'FFCBD5E1' } },
      };
    }
  });

  // Isi Data Layanan
  let currentRowIdx = headerRowIdx + 1;
  sortedServices.forEach((srv, index) => {
    const isZero = srv.count === 0;
    const isTop1 = index === 0 && srv.count > 0;
    const pct = totalBookings > 0 ? Math.round((srv.count / totalBookings) * 100) : 0;

    let statusText = '🟢 Normal';
    let actionText = 'Pertahankan konsistensi penawaran.';

    if (isZero) {
      statusText = '💡 Belum Ada Pesanan (0 Order)';
      actionText = 'Peluang baru: Perlu dibuatkan paket promo/diskon atau video showcase baru.';
    } else if (isTop1) {
      statusText = '🔥 TERLARIS (#1 Top)';
      actionText = 'Pilar omset utama studio. Pertahankan kepuasan klien dan kualitas tim.';
    } else if (srv.count >= 5) {
      statusText = '🟢 Sangat Populer';
      actionText = 'Peminat tinggi. Bisa dioptimalkan dengan promo add-on tambahan.';
    } else {
      statusText = '🟡 Kurang Populer (< 5 Order)';
      actionText = 'Promosikan lebih aktif di media sosial dan tawarkan saat konsultasi klien.';
    }

    // Cari paket dominan
    const dominantPkgEntry = Array.from(srv.packageCounts.values()).sort((a, b) => b.count - a.count)[0];
    const dominantPkgName = dominantPkgEntry ? dominantPkgEntry.packageName : '-';

    const row = sheet1.getRow(currentRowIdx);
    row.values = [
      '',
      isZero ? '-' : `#${index + 1}`,
      srv.serviceName,
      statusText,
      srv.count,
      `${pct}%`,
      formatCurrency(srv.revenue),
      dominantPkgName,
      actionText,
    ];

    // Styling baris
    row.eachCell((cell, colNumber) => {
      if (colNumber >= 2 && colNumber <= 9) {
        cell.alignment = {
          vertical: 'middle',
          horizontal: colNumber === 3 || colNumber === 8 || colNumber === 9 ? 'left' : 'center',
        };
        cell.border = {
          bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        };

        // Highlight merah muda jika 0 order / tidak laris
        if (isZero) {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFFEE2E2' }, // Light red
          };
          if (colNumber === 4) {
            cell.font = { bold: true, color: { argb: 'FFDC2626' } };
          }
        } else if (isTop1) {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFFEF3C7' }, // Light gold
          };
        }
      }
    });

    row.height = 22;
    currentRowIdx++;
  });

  // Baris Total / Summary
  const summaryRow = sheet1.getRow(currentRowIdx);
  summaryRow.values = [
    '',
    'TOTAL',
    `${sortedServices.length} Layanan Terdaftar`,
    `${sortedServices.filter((s) => s.count > 0).length} Aktif, ${zeroServices.length} Nol Order`,
    totalBookings,
    '100%',
    formatCurrency(totalRevenue),
    '-',
    '-',
  ];
  summaryRow.height = 24;
  summaryRow.eachCell((cell, colNumber) => {
    if (colNumber >= 2 && colNumber <= 9) {
      cell.font = { bold: true, size: 11 };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFF1F5F9' },
      };
      cell.alignment = {
        vertical: 'middle',
        horizontal: colNumber === 3 ? 'left' : 'center',
      };
      cell.border = {
        top: { style: 'double', color: { argb: 'FF0F172A' } },
        bottom: { style: 'double', color: { argb: 'FF0F172A' } },
      };
    }
  });

  // =========================================================================
  // TAB 2: RINCIAN KINERJA SELURUH PAKET (BEST SELLER S/D 0 ORDER)
  // =========================================================================
  const sheet2 = workbook.addWorksheet('Kinerja Paket & Best Seller', {
    views: [{ showGridLines: true }],
  });

  sheet2.columns = [
    { key: 'colA', width: 4 },
    { key: 'no', width: 6 },
    { key: 'srv', width: 28 },
    { key: 'pkg', width: 30 },
    { key: 'price', width: 18 },
    { key: 'status', width: 26 },
    { key: 'count', width: 16 },
    { key: 'rev', width: 22 },
    { key: 'pct', width: 20 },
    { key: 'note', width: 44 },
  ];

  // Header Title Sheet 2
  const titleRow2 = sheet2.getRow(2);
  titleRow2.getCell(2).value = `RINCIAN KINERJA SELURUH PAKET — ${yearLabel.toUpperCase()}`;
  titleRow2.getCell(2).font = { bold: true, size: 14, color: { argb: 'FF0066CC' } };
  sheet2.mergeCells('B2:J2');
  titleRow2.height = 26;

  // Header Table Sheet 2
  const header2 = sheet2.getRow(4);
  header2.values = [
    '',
    'No',
    'Layanan Induk',
    'Nama Paket',
    'Harga Katalog',
    'Status Penjualan',
    'Total Order',
    'Total Omset',
    '% Kontribusi Layanan',
    'Evaluasi & Tindakan Bisnis',
  ];
  header2.height = 24;
  header2.eachCell((cell, colNumber) => {
    if (colNumber >= 2 && colNumber <= 10) {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF047857' }, // Emerald dark
      };
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 };
      cell.alignment = { vertical: 'middle', horizontal: colNumber === 3 || colNumber === 4 ? 'left' : 'center' };
    }
  });

  let rowIdx2 = 5;
  packageStatsList.forEach((pkg, idx) => {
    const isZero = pkg.count === 0;
    const r = sheet2.getRow(rowIdx2);

    r.values = [
      '',
      idx + 1,
      pkg.serviceName,
      pkg.packageName,
      formatCurrency(pkg.price),
      pkg.statusLabel,
      pkg.count,
      formatCurrency(pkg.revenue),
      `${pkg.percentageOfService}%`,
      pkg.actionNote,
    ];

    r.eachCell((cell, colNumber) => {
      if (colNumber >= 2 && colNumber <= 10) {
        cell.alignment = {
          vertical: 'middle',
          horizontal: colNumber === 3 || colNumber === 4 || colNumber === 10 ? 'left' : 'center',
        };
        cell.border = { bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } } };

        if (isZero) {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFFEE2E2' }, // Light red
          };
          if (colNumber === 6) {
            cell.font = { bold: true, color: { argb: 'FFDC2626' } };
          }
        } else if (pkg.isBestSeller) {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFECFDF5' }, // Light emerald
          };
          if (colNumber === 6) {
            cell.font = { bold: true, color: { argb: 'FF059669' } };
          }
        }
      }
    });

    r.height = 22;
    rowIdx2++;
  });

  // =========================================================================
  // TAB 3: KHUSUS LAYANAN & PAKET PERLU OPTIMASI (BELUM ADA PESANAN)
  // =========================================================================
  const sheet3 = workbook.addWorksheet('Peluang & Evaluasi Promo', {
    views: [{ showGridLines: true }],
  });

  sheet3.columns = [
    { key: 'colA', width: 4 },
    { key: 'no', width: 6 },
    { key: 'category', width: 16 },
    { key: 'name', width: 34 },
    { key: 'parent', width: 28 },
    { key: 'order', width: 14 },
    { key: 'priority', width: 20 },
    { key: 'recommendation', width: 50 },
  ];

  const titleRow3 = sheet3.getRow(2);
  titleRow3.getCell(2).value = '💡 DAFTAR LAYANAN & PAKET PERLU OPTIMASI (BELUM ADA PESANAN)';
  titleRow3.getCell(2).font = { bold: true, size: 14, color: { argb: 'FFD97706' } };
  sheet3.mergeCells('B2:H2');
  titleRow3.height = 26;

  const descRow3 = sheet3.getRow(3);
  descRow3.getCell(2).value = `Lembar ini merangkum seluruh katalog yang belum memiliki pesanan pada ${yearLabel}. Gunakan data ini sebagai peluang untuk merancang strategi promosi, penyesuaian harga, atau paket bundling baru.`;
  descRow3.getCell(2).font = { italic: true, size: 10, color: { argb: 'FF64748B' } };
  sheet3.mergeCells('B3:H3');

  const header3 = sheet3.getRow(5);
  header3.values = [
    '',
    'No',
    'Kategori',
    'Nama Katalog',
    'Layanan Induk',
    'Total Order',
    'Prioritas Aksi',
    'Rekomendasi Tindakan Strategis',
  ];
  header3.height = 24;
  header3.eachCell((cell, colNumber) => {
    if (colNumber >= 2 && colNumber <= 8) {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFDC2626' }, // Merah Tegas
      };
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 };
      cell.alignment = { vertical: 'middle', horizontal: colNumber === 4 ? 'left' : 'center' };
    }
  });

  let rowIdx3 = 6;
  let counterZero = 1;

  // Masukkan Layanan yang 0 Order
  zeroServices.forEach((zs) => {
    const r = sheet3.getRow(rowIdx3);
    r.values = [
      '',
      counterZero++,
      'LAYANAN',
      zs.serviceName,
      '-',
      '0 Order',
      '🔴 TINGGI',
      'Tinjau apakah layanan ini masih diminati pasar. Buat materi iklan media sosial dan paket pengenalan (introductory price).',
    ];

    r.eachCell((cell, colNumber) => {
      if (colNumber >= 2 && colNumber <= 8) {
        cell.alignment = {
          vertical: 'middle',
          horizontal: colNumber === 4 || colNumber === 8 ? 'left' : 'center',
        };
        cell.border = { bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } } };
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFFEE2E2' },
        };
      }
    });

    r.height = 22;
    rowIdx3++;
  });

  // Masukkan Paket yang 0 Order
  zeroPackages.forEach((zp) => {
    const r = sheet3.getRow(rowIdx3);
    r.values = [
      '',
      counterZero++,
      'PAKET',
      zp.packageName,
      zp.serviceName,
      '0 Order',
      '🟡 SEDANG',
      `Harga saat ini (${formatCurrency(zp.price)}). Cek apakah selisih harga dengan paket lain terlalu jauh atau deskripsinya kurang jelas bagi klien.`,
    ];

    r.eachCell((cell, colNumber) => {
      if (colNumber >= 2 && colNumber <= 8) {
        cell.alignment = {
          vertical: 'middle',
          horizontal: colNumber === 4 || colNumber === 8 ? 'left' : 'center',
        };
        cell.border = { bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } } };
      }
    });

    r.height = 22;
    rowIdx3++;
  });

  if (counterZero === 1) {
    const r = sheet3.getRow(rowIdx3);
    r.getCell(2).value = 'Luar biasa! Tidak ada layanan atau paket yang 0 order pada periode ini.';
    r.getCell(2).font = { bold: true, color: { argb: 'FF16A34A' } };
    sheet3.mergeCells(`B${rowIdx3}:H${rowIdx3}`);
  }

  // =========================================================================
  // DOWNLOAD WORKBOOK KE BROWSER
  // =========================================================================
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });

  const url = window.URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  const safeYearName = selectedYear === 'all' ? 'Semua_Tahun' : `Tahun_${selectedYear}`;
  const dateStamp = new Date().toISOString().slice(0, 10);
  anchor.download = `Laporan_Analisis_Layanan_Paket_${safeYearName}_${dateStamp}.xlsx`;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  window.URL.revokeObjectURL(url);
}
