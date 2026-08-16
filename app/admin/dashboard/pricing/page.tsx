'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { PackagePlus, Check, Trash2, Pencil, X, Loader2 } from 'lucide-react';
import { getServices, getPackages, upsertPackage, deletePackage } from '@/lib/actions/services';
import { formatCurrency } from '@/lib/utils';
import { useToast } from '@/components/ui/toast-context';
import type { Service, Package } from '@/lib/types';

export default function PricingPage() {
  const { toast, confirmModal } = useToast();
  const [services, setServices] = useState<Service[]>([]);
  const [packages, setPackages] = useState<Package[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [selectedServiceId, setSelectedServiceId] = useState<string>('');

  const [showAddPackageModal, setShowAddPackageModal] = useState(false);
  const [editingPackage, setEditingPackage] = useState<Package | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [newPackageForm, setNewPackageForm] = useState({
    serviceId: '',
    name: '',
    price: 5000000,
    duration: '6 Jam',
    photographerCount: 2,
    editedPhotos: '100 Foto Edited',
    description: '',
    featuresText: '1 Main Photographer\nDokumentasi s/d 6 Jam\n80 Tone Edited High-Res Photos\nAll Raw Files Included',
    isPopular: false,
  });

  const refreshData = useCallback(async () => {
    setLoadingData(true);
    try {
      const [sList, pkgList] = await Promise.all([getServices(), getPackages()]);
      setServices(sList);
      setPackages(pkgList);
      if (sList.length > 0 && !selectedServiceId) {
        setSelectedServiceId(sList[0].id);
      }
    } catch (err) {
      console.error('Failed to load pricing data', err);
    } finally {
      setLoadingData(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const handleOpenAddModal = () => {
    setEditingPackage(null);
    setNewPackageForm({
      serviceId: selectedServiceId || (services[0]?.id ?? ''),
      name: '',
      price: 5000000,
      duration: '6 Jam',
      photographerCount: 2,
      editedPhotos: '100 Foto Edited',
      description: '',
      featuresText: '1 Main Photographer\nDokumentasi s/d 6 Jam\n80 Tone Edited High-Res Photos\nAll Raw Files Included',
      isPopular: false,
    });
    setShowAddPackageModal(true);
  };

  const handleOpenEditModal = (pkg: Package) => {
    setEditingPackage(pkg);
    setNewPackageForm({
      serviceId: pkg.serviceId,
      name: pkg.name,
      price: pkg.price,
      duration: pkg.duration || '6 Jam',
      photographerCount: pkg.photographerCount || 1,
      editedPhotos: pkg.editedPhotos || '',
      description: pkg.description || '',
      featuresText: pkg.features && pkg.features.length > 0 ? pkg.features.join('\n') : '',
      isPopular: pkg.isPopular || false,
    });
    setShowAddPackageModal(true);
  };

  const handleSavePackage = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const serviceIdToUse = newPackageForm.serviceId || selectedServiceId || (services[0]?.id ?? '');
      const selectedSrv = services.find((s) => s.id === serviceIdToUse);
      const cleanPkgName = newPackageForm.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const slug = editingPackage?.slug || (selectedSrv?.slug ? `${selectedSrv.slug}-${cleanPkgName}` : cleanPkgName);
      const res = await upsertPackage({
        ...(editingPackage?.id ? { id: editingPackage.id } : {}),
        serviceId: serviceIdToUse,
        name: newPackageForm.name,
        slug,
        description: newPackageForm.description,
        price: Number(newPackageForm.price) || 0,
        duration: newPackageForm.duration,
        photographerCount: Number(newPackageForm.photographerCount) || 1,
        editedPhotos: newPackageForm.editedPhotos,
        features: newPackageForm.featuresText.split('\n').filter((f) => f.trim().length > 0),
        isPopular: newPackageForm.isPopular,
        isActive: true,
      });

      if (res.success) {
        await refreshData();
        setShowAddPackageModal(false);
        setEditingPackage(null);
        toast.success(editingPackage ? 'Paket berhasil diperbarui.' : 'Paket baru berhasil ditambahkan.');
        setNewPackageForm({
          serviceId: selectedServiceId || (services[0]?.id ?? ''),
          name: '',
          price: 5000000,
          duration: '6 Jam',
          photographerCount: 2,
          editedPhotos: '100 Foto Edited',
          description: '',
          featuresText: '1 Main Photographer\nDokumentasi s/d 6 Jam\n80 Tone Edited High-Res Photos\nAll Raw Files Included',
          isPopular: false,
        });
      } else {
        toast.error(`Gagal menyimpan paket: ${res.error}`);
      }
    } catch (err) {
      console.error('Error saving package:', err);
      toast.error('Terjadi kesalahan saat menyimpan paket.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeletePackage = (id: string) => {
    confirmModal({
      title: 'Hapus Paket Dokumentasi?',
      message: 'Apakah Anda yakin ingin menghapus paket ini? Data paket akan dihapus secara permanen.',
      confirmText: 'Ya, Hapus Paket',
      variant: 'danger',
      onConfirm: async () => {
        const res = await deletePackage(id);
        if (res.success) {
          await refreshData();
          toast.success('Paket berhasil dihapus.');
        } else {
          toast.error(`Gagal menghapus paket: ${res.error}`);
        }
      },
    });
  };

  const handleTogglePackagePopular = async (pkg: Package) => {
    const res = await upsertPackage({
      id: pkg.id,
      serviceId: pkg.serviceId,
      name: pkg.name,
      slug: pkg.slug,
      description: pkg.description,
      price: pkg.price,
      duration: pkg.duration,
      photographerCount: pkg.photographerCount,
      editedPhotos: pkg.editedPhotos,
      features: pkg.features,
      isPopular: !pkg.isPopular,
      isActive: pkg.isActive,
    });
    if (res.success) {
      await refreshData();
      toast.success(pkg.isPopular ? 'Status popular dilepas.' : 'Paket diset sebagai Popular!');
    }
  };

  const packagesForSelected = packages.filter((pkg) => pkg.serviceId === selectedServiceId);

  if (loadingData) {
    return (
      <div className="flex flex-col gap-6 animate-pulse">
        <div className="h-32 bg-zinc-900/60 border border-zinc-800/60 rounded-xl" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-80 bg-zinc-900/60 border border-zinc-800/60 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Category Selector Header */}
      <div className="p-6 bg-zinc-900/60 border border-zinc-800/80 rounded-xl flex flex-col gap-4 shadow-xl">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <span className="text-[10px] font-mono text-[#0066CC] uppercase tracking-widest font-semibold">
              Package Pricing Management
            </span>
            <h3 className="font-sans text-xl sm:text-2xl font-bold text-zinc-100 uppercase tracking-tight">
              Tarif & Harga Paket Foto
            </h3>
          </div>
          <button
            onClick={handleOpenAddModal}
            className="px-4 py-2 bg-[#0066CC] hover:bg-[#0052A3] text-white text-xs font-semibold uppercase tracking-wider rounded-md transition-colors flex items-center gap-1.5 shadow-md cursor-pointer"
          >
            <PackagePlus className="w-4 h-4" />
            <span>Tambah Paket Baru</span>
          </button>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pt-2 border-t border-zinc-800/80">
          <span className="text-xs text-zinc-400 uppercase tracking-wider font-mono mr-2">Pilih Layanan:</span>
          {services.map((srv) => (
            <button
              key={srv.id}
              onClick={() => setSelectedServiceId(srv.id)}
              className={`px-4 py-2 text-xs tracking-wider uppercase rounded-md transition-all whitespace-nowrap font-medium cursor-pointer ${
                selectedServiceId === srv.id
                  ? 'bg-[#0066CC] text-white font-semibold shadow-md'
                  : 'bg-zinc-950 border border-zinc-800 text-zinc-400 hover:text-white'
              }`}
            >
              {srv.name}
            </button>
          ))}
        </div>
      </div>

      {/* Package Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {packagesForSelected.map((pkg) => (
          <div
            key={pkg.id}
            className={`bg-zinc-900/60 border rounded-xl p-6 flex flex-col justify-between relative transition-all shadow-xl ${
              pkg.isPopular
                ? 'border-[#0066CC] bg-gradient-to-b from-[#0066CC]/15 via-zinc-900/80 to-zinc-900/60 shadow-[0_0_25px_rgba(0,102,204,0.2)]'
                : 'border-zinc-800/80'
            }`}
          >
            {pkg.isPopular && (
              <span className="absolute -top-3 left-6 px-3 py-0.5 bg-[#0066CC] text-white text-[9px] font-bold uppercase tracking-widest rounded-full shadow-md">
                Paling Direkomendasikan
              </span>
            )}

            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h4 className="font-sans text-xl font-bold text-zinc-100">{pkg.name}</h4>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEditModal(pkg)}
                    className="text-zinc-400 hover:text-[#0066CC] p-1.5 transition-colors rounded hover:bg-zinc-800"
                    title="Edit Paket"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeletePackage(pkg.id)}
                    className="text-zinc-500 hover:text-rose-400 p-1.5 transition-colors rounded hover:bg-zinc-800"
                    title="Hapus Paket"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <p className="text-xs text-zinc-400 font-light leading-relaxed">{pkg.description}</p>

              <div className="font-sans text-3xl font-extrabold tracking-tight text-[#0066CC]">
                {formatCurrency(pkg.price)}
              </div>

              <div className="py-3 border-y border-zinc-800/80 flex flex-col gap-2 text-xs text-zinc-300 font-light">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-500">Durasi Sesi:</span>
                  <strong>{pkg.duration}</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-500">Jumlah Tim:</span>
                  <strong>{pkg.photographerCount} Orang Tim</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-500">Output Foto:</span>
                  <strong>{pkg.editedPhotos}</strong>
                </div>
              </div>

              <div className="flex flex-col gap-2 pt-2">
                <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest font-semibold">Fasilitas Termasuk:</span>
                <ul className="flex flex-col gap-2 text-xs text-zinc-300 font-light">
                  {pkg.features.map((ft, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-[#0066CC] shrink-0" />
                      <span>{ft}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="pt-6 mt-6 border-t border-zinc-800/80 flex items-center justify-between">
              <button
                onClick={() => handleTogglePackagePopular(pkg)}
                className={`text-xs font-medium cursor-pointer ${pkg.isPopular ? 'text-[#0066CC]' : 'text-zinc-500 hover:text-zinc-300'}`}
              >
                {pkg.isPopular ? '★ Tag Popular Active' : '☆ Set As Popular'}
              </button>

              <button
                onClick={() => handleOpenEditModal(pkg)}
                className="px-3 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white rounded text-[11px] font-medium transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Pencil className="w-3 h-3 text-[#0066CC]" />
                <span>Edit Paket</span>
              </button>
            </div>
          </div>
        ))}
        {packagesForSelected.length === 0 && (
          <div className="col-span-full p-12 bg-zinc-900/40 border border-zinc-800/80 rounded-xl text-center text-xs text-zinc-400 font-light">
            Belum ada paket untuk layanan ini. Klik &quot;Tambah Paket Baru&quot; untuk menambahkan.
          </div>
        )}
      </div>

      {/* ===== MODAL: ADD / EDIT PACKAGE ===== */}
      {showAddPackageModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl max-w-lg w-full p-6 md:p-8 flex flex-col gap-6 max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
              <h3 className="font-sans text-xl font-bold text-zinc-100">
                {editingPackage ? 'Edit Paket Layanan' : 'Tambah Paket Layanan Baru'}
              </h3>
              <button
                onClick={() => { setShowAddPackageModal(false); setEditingPackage(null); }}
                className="text-zinc-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePackage} className="flex flex-col gap-4 text-xs">
              <div className="flex flex-col gap-1.5">
                <label className="text-zinc-300 uppercase font-mono font-medium">Kategori Layanan</label>
                <select
                  value={newPackageForm.serviceId}
                  onChange={(e) => setNewPackageForm({ ...newPackageForm, serviceId: e.target.value })}
                  className="bg-zinc-950 border border-zinc-800 focus:border-[#0066CC] p-3 rounded-lg text-zinc-100 focus:outline-none"
                >
                  {services.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-zinc-300 uppercase font-mono font-medium">Nama Paket *</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Premium Heritage"
                    value={newPackageForm.name}
                    onChange={(e) => setNewPackageForm({ ...newPackageForm, name: e.target.value })}
                    className="bg-zinc-950 border border-zinc-800 focus:border-[#0066CC] p-3 rounded-lg text-zinc-100 focus:outline-none"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-zinc-300 uppercase font-mono font-medium">Harga (IDR) *</label>
                  <input
                    type="number"
                    required
                    value={newPackageForm.price}
                    onChange={(e) => setNewPackageForm({ ...newPackageForm, price: Number(e.target.value) })}
                    className="bg-zinc-950 border border-zinc-800 focus:border-[#0066CC] p-3 rounded-lg text-zinc-100 focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-zinc-300 uppercase font-mono font-medium">Durasi Sesi</label>
                  <input
                    type="text"
                    placeholder="Contoh: 6 Jam"
                    value={newPackageForm.duration}
                    onChange={(e) => setNewPackageForm({ ...newPackageForm, duration: e.target.value })}
                    className="bg-zinc-950 border border-zinc-800 focus:border-[#0066CC] p-3 rounded-lg text-zinc-100 focus:outline-none"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-zinc-300 uppercase font-mono font-medium">Jumlah Tim</label>
                  <input
                    type="number"
                    min={1}
                    placeholder="2"
                    value={newPackageForm.photographerCount}
                    onChange={(e) => setNewPackageForm({ ...newPackageForm, photographerCount: Number(e.target.value) || 1 })}
                    className="bg-zinc-950 border border-zinc-800 focus:border-[#0066CC] p-3 rounded-lg text-zinc-100 focus:outline-none font-mono"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-zinc-300 uppercase font-mono font-medium">Output Foto</label>
                  <input
                    type="text"
                    placeholder="Contoh: 100 Foto Edited"
                    value={newPackageForm.editedPhotos}
                    onChange={(e) => setNewPackageForm({ ...newPackageForm, editedPhotos: e.target.value })}
                    className="bg-zinc-950 border border-zinc-800 focus:border-[#0066CC] p-3 rounded-lg text-zinc-100 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-zinc-300 uppercase font-mono font-medium">Deskripsi Paket</label>
                <textarea
                  rows={2}
                  placeholder="Deskripsi singkat paket..."
                  value={newPackageForm.description}
                  onChange={(e) => setNewPackageForm({ ...newPackageForm, description: e.target.value })}
                  className="bg-zinc-950 border border-zinc-800 focus:border-[#0066CC] p-3 rounded-lg text-zinc-100 focus:outline-none resize-none"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-zinc-300 uppercase font-mono font-medium">Fasilitas Termasuk (1 per baris)</label>
                <textarea
                  rows={4}
                  value={newPackageForm.featuresText}
                  onChange={(e) => setNewPackageForm({ ...newPackageForm, featuresText: e.target.value })}
                  className="bg-zinc-950 border border-zinc-800 focus:border-[#0066CC] p-3 rounded-lg text-zinc-100 focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="isPopular"
                  checked={newPackageForm.isPopular}
                  onChange={(e) => setNewPackageForm({ ...newPackageForm, isPopular: e.target.checked })}
                  className="w-4 h-4 rounded border-zinc-800 bg-zinc-950 text-[#0066CC] focus:ring-[#0066CC]"
                />
                <label htmlFor="isPopular" className="text-xs text-zinc-300 cursor-pointer font-medium">
                  Tandai sebagai Paket Popular (Paling Direkomendasikan)
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => { setShowAddPackageModal(false); setEditingPackage(null); }}
                  className="px-5 py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold uppercase tracking-wider rounded-lg transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-3 bg-[#0066CC] hover:bg-[#0052A3] disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-semibold uppercase tracking-wider rounded-lg transition-colors shadow-[0_0_15px_rgba(0,102,204,0.3)] flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Menyimpan Paket...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>{editingPackage ? 'Simpan Perubahan Paket' : 'Simpan Paket Layanan'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

