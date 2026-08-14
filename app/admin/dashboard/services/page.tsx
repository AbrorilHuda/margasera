'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Layers, Pencil, Trash2, X } from 'lucide-react';
import { getServices, upsertService, deleteService, getPackages } from '@/lib/actions/services';
import type { Service, Package } from '@/lib/types';

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [packages, setPackages] = useState<Package[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  const [showAddServiceModal, setShowAddServiceModal] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [newServiceForm, setNewServiceForm] = useState({ name: '', slug: '', description: '' });

  const refreshData = useCallback(async () => {
    setLoadingData(true);
    try {
      const [sList, pkgList] = await Promise.all([getServices(), getPackages()]);
      setServices(sList);
      setPackages(pkgList);
    } catch (err) {
      console.error('Failed to load services data', err);
    } finally {
      setLoadingData(false);
    }
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const handleCreateService = async (e: React.FormEvent) => {
    e.preventDefault();
    const slug = newServiceForm.slug || newServiceForm.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const res = await upsertService({
      ...(editingService?.id ? { id: editingService.id } : {}),
      name: newServiceForm.name,
      slug,
      description: newServiceForm.description,
      isActive: true,
    });
    if (res.success) {
      await refreshData();
      setShowAddServiceModal(false);
      setEditingService(null);
      setNewServiceForm({ name: '', slug: '', description: '' });
    }
  };

  const handleDeleteService = async (id: string, name: string) => {
    if (window.confirm(`Apakah Anda yakin ingin menghapus layanan "${name}"? Semua paket dalam layanan ini juga akan terhapus.`)) {
      const res = await deleteService(id);
      if (res.success) await refreshData();
      else alert(`Gagal menghapus layanan: ${res.error}`);
    }
  };

  if (loadingData) {
    return (
      <div className="flex flex-col gap-6 animate-pulse">
        <div className="h-20 bg-zinc-900/60 border border-zinc-800/60 rounded-xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-48 bg-zinc-900/60 border border-zinc-800/60 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header Bar */}
      <div className="p-6 bg-zinc-900/60 border border-zinc-800/80 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
        <div>
          <span className="text-[10px] font-mono text-[#0066CC] uppercase tracking-widest font-semibold">
            Service Category Management
          </span>
          <h3 className="font-sans text-xl sm:text-2xl font-bold text-zinc-100 uppercase tracking-tight">
            Kelola Kategori Layanan Studio
          </h3>
        </div>

        <button
          onClick={() => {
            setEditingService(null);
            setNewServiceForm({ name: '', slug: '', description: '' });
            setShowAddServiceModal(true);
          }}
          className="px-4 py-2 bg-[#0066CC] hover:bg-[#0052A3] text-white text-xs font-semibold uppercase tracking-wider rounded-md transition-colors flex items-center gap-1.5 shadow-md"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Kategori Layanan Baru</span>
        </button>
      </div>

      {/* Service Cards Grid */}
      {services.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((srv) => {
            const pkgCount = packages.filter((p) => p.serviceId === srv.id || p.serviceName === srv.name).length;
            return (
              <div
                key={srv.id}
                className="bg-zinc-900/60 border border-zinc-800/80 hover:border-[#0066CC]/50 rounded-xl p-6 flex flex-col justify-between transition-all shadow-xl gap-4"
              >
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-[#0066CC]/15 border border-[#0066CC]/30 flex items-center justify-center text-[#0066CC]">
                        <Layers className="w-4 h-4" />
                      </div>
                      <h4 className="font-sans text-xl font-bold text-zinc-100">{srv.name}</h4>
                    </div>
                    <span className="px-2.5 py-1 bg-zinc-950 border border-zinc-800 text-zinc-400 font-mono text-[10px] uppercase rounded">
                      slug: {srv.slug}
                    </span>
                  </div>

                  <p className="text-xs text-zinc-400 font-light leading-relaxed">
                    {srv.description || 'Tidak ada deskripsi layanan.'}
                  </p>

                  <div className="py-2.5 px-3 bg-zinc-950 border border-zinc-800/60 rounded-lg flex items-center justify-between text-xs text-zinc-400 font-mono">
                    <span>Jumlah Paket Terdaftar:</span>
                    <strong className="text-[#0066CC]">{pkgCount} Paket</strong>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-800/80">
                  <button
                    onClick={() => {
                      setEditingService(srv);
                      setNewServiceForm({
                        name: srv.name,
                        slug: srv.slug,
                        description: srv.description || '',
                      });
                      setShowAddServiceModal(true);
                    }}
                    className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-200 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5"
                  >
                    <Pencil className="w-3.5 h-3.5 text-[#0066CC]" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => handleDeleteService(srv.id, srv.name)}
                    className="px-3 py-1.5 bg-rose-950/30 hover:bg-rose-900/40 border border-rose-900/50 text-rose-400 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Hapus</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-12 bg-zinc-900/40 border border-zinc-800/80 rounded-xl text-center text-xs text-zinc-400 font-light">
          Belum ada kategori layanan terdaftar di database.
        </div>
      )}

      {/* ===== MODAL: ADD / EDIT SERVICE ===== */}
      {showAddServiceModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-lg p-6 sm:p-8 flex flex-col gap-6 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
              <h3 className="font-sans text-xl font-bold text-zinc-100">
                {editingService ? 'Edit Kategori Layanan' : 'Tambah Kategori Layanan Baru'}
              </h3>
              <button
                onClick={() => { setShowAddServiceModal(false); setEditingService(null); }}
                className="text-zinc-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateService} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-zinc-400 font-mono uppercase">Nama Kategori Layanan:</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Pre-Wedding Story"
                  value={newServiceForm.name}
                  onChange={(e) => setNewServiceForm({ ...newServiceForm, name: e.target.value })}
                  className="bg-zinc-950 border border-zinc-800 focus:border-[#0066CC] text-zinc-100 p-3 rounded-lg text-xs focus:outline-none"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-zinc-400 font-mono uppercase">URL Slug (Opsional):</label>
                <input
                  type="text"
                  placeholder="pre-wedding (auto-generate dari nama)"
                  value={newServiceForm.slug}
                  onChange={(e) => setNewServiceForm({ ...newServiceForm, slug: e.target.value })}
                  className="bg-zinc-950 border border-zinc-800 focus:border-[#0066CC] text-zinc-100 p-3 rounded-lg text-xs focus:outline-none"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-zinc-400 font-mono uppercase">Deskripsi Singkat:</label>
                <textarea
                  rows={3}
                  placeholder="Deskripsi singkat mengenai kategori layanan ini..."
                  value={newServiceForm.description}
                  onChange={(e) => setNewServiceForm({ ...newServiceForm, description: e.target.value })}
                  className="bg-zinc-950 border border-zinc-800 focus:border-[#0066CC] text-zinc-100 p-3 rounded-lg text-xs focus:outline-none resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => { setShowAddServiceModal(false); setEditingService(null); }}
                  className="px-5 py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold uppercase tracking-wider rounded-lg transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-[#0066CC] hover:bg-[#0052A3] text-white text-xs font-semibold uppercase tracking-wider rounded-lg transition-colors shadow-[0_0_15px_rgba(0,102,204,0.3)]"
                >
                  {editingService ? 'Simpan Perubahan' : 'Simpan Kategori Layanan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
