'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { FolderPlus, Sparkles, MapPin, Trash2, Images, X } from 'lucide-react';
import {
  getGalleryProjects,
  createGalleryProject,
  deleteGalleryProject,
  toggleProjectFeatured,
  getProjectImages,
  addGalleryImage,
  deleteGalleryImage,
} from '@/lib/actions/gallery';
import { getServices } from '@/lib/actions/services';
import type { GalleryProject, GalleryImage, Service, ServiceCategory } from '@/lib/types';

export default function PortfolioPage() {
  const [projects, setProjects] = useState<GalleryProject[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [portfolioCategoryFilter, setPortfolioCategoryFilter] = useState<string>('all');

  // Modal states
  const [showAddProjectModal, setShowAddProjectModal] = useState(false);
  const [selectedProjectForImages, setSelectedProjectForImages] = useState<GalleryProject | null>(null);
  const [projectImages, setProjectImages] = useState<GalleryImage[]>([]);
  const [isLoadingProjectImages, setIsLoadingProjectImages] = useState(false);

  // Forms
  const [newProjectForm, setNewProjectForm] = useState({
    title: '',
    category: 'wedding' as string,
    categoryLabel: 'Wedding',
    location: '',
    eventDate: '',
    coverImage: 'https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=1600&auto=format&fit=crop',
    description: '',
    isFeatured: true,
  });

  const [newImageForm, setNewImageForm] = useState({
    imageUrl: '',
    altText: '',
    aspectRatio: 'landscape' as 'landscape' | 'portrait' | 'square',
  });

  const refreshData = useCallback(async () => {
    setLoadingData(true);
    try {
      const [pList, sList] = await Promise.all([getGalleryProjects(), getServices()]);
      setProjects(pList);
      setServices(sList);
    } catch (err) {
      console.error('Failed to load portfolio data', err);
    } finally {
      setLoadingData(false);
    }
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const handleOpenManageImages = async (proj: GalleryProject) => {
    setSelectedProjectForImages(proj);
    setIsLoadingProjectImages(true);
    const imgs = await getProjectImages(proj.id);
    setProjectImages(imgs);
    setIsLoadingProjectImages(false);
  };

  const handleAddGalleryImage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProjectForImages || !newImageForm.imageUrl) return;
    const res = await addGalleryImage(
      selectedProjectForImages.id,
      newImageForm.imageUrl,
      newImageForm.altText || selectedProjectForImages.title,
      newImageForm.aspectRatio
    );
    if (res.success) {
      const updatedImgs = await getProjectImages(selectedProjectForImages.id);
      setProjectImages(updatedImgs);
      setNewImageForm({ imageUrl: '', altText: '', aspectRatio: 'landscape' });
    } else {
      alert(`Gagal menambah foto: ${res.error}`);
    }
  };

  const handleDeleteGalleryImage = async (imageId: string) => {
    if (!selectedProjectForImages) return;
    const res = await deleteGalleryImage(imageId);
    if (res.success) {
      const updatedImgs = await getProjectImages(selectedProjectForImages.id);
      setProjectImages(updatedImgs);
    } else {
      alert(`Gagal menghapus foto: ${res.error}`);
    }
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    const title = newProjectForm.title || 'Project Portofolio Baru';
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now();
    const res = await createGalleryProject({
      title,
      slug,
      category: newProjectForm.category as ServiceCategory,
      categoryLabel: newProjectForm.categoryLabel || newProjectForm.category,
      description: newProjectForm.description || 'Dokumentasi sinematik foto pilihan Margasera.',
      location: newProjectForm.location || 'Madura, Jawa Timur',
      eventDate: newProjectForm.eventDate || 'Agustus 2026',
      coverImage: newProjectForm.coverImage,
      isFeatured: newProjectForm.isFeatured,
    });
    if (res.success) {
      await refreshData();
      setShowAddProjectModal(false);
      setNewProjectForm({
        title: '',
        category: services[0]?.slug || 'wedding',
        categoryLabel: services[0]?.name || 'Wedding',
        description: '',
        location: '',
        eventDate: '',
        coverImage: 'https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=1600&auto=format&fit=crop',
        isFeatured: false,
      });
    } else {
      alert(`Gagal menyimpan project: ${res.error}`);
    }
  };

  const handleDeleteProject = async (id: string, title?: string) => {
    if (window.confirm(`Apakah Anda yakin ingin menghapus project "${title || 'ini'}"?`)) {
      const res = await deleteGalleryProject(id);
      if (res.success) await refreshData();
      else alert(`Gagal menghapus project: ${res.error}`);
    }
  };

  const handleToggleProjectFeatured = async (id: string, currentFeatured: boolean) => {
    const res = await toggleProjectFeatured(id, !currentFeatured);
    if (res.success) await refreshData();
    else alert(`Gagal memperbarui status featured: ${res.error}`);
  };

  const filteredProjects = projects.filter((p) =>
    portfolioCategoryFilter === 'all' ? true : p.category === portfolioCategoryFilter
  );

  if (loadingData) {
    return (
      <div className="flex flex-col gap-6 animate-pulse">
        <div className="h-20 bg-zinc-900/60 border border-zinc-800/60 rounded-xl" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-72 bg-zinc-900/60 border border-zinc-800/60 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header Bar */}
      <div className="p-6 bg-zinc-900/60 border border-zinc-800/80 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0">
          <span className="text-xs text-zinc-400 uppercase tracking-wider whitespace-nowrap font-mono">Filter Kategori:</span>
          {[
            { id: 'all', label: 'Semua Karya' },
            ...services.map((s) => ({ id: s.slug, label: s.name })),
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setPortfolioCategoryFilter(cat.id)}
              className={`px-3 py-1.5 text-xs tracking-wider uppercase rounded-md transition-colors whitespace-nowrap font-medium ${
                portfolioCategoryFilter === cat.id
                  ? 'bg-[#0066CC] text-white font-semibold shadow-sm'
                  : 'bg-zinc-950 text-zinc-400 hover:text-white border border-zinc-800'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <button
          onClick={() => {
            if (services.length > 0) {
              setNewProjectForm((prev) => ({
                ...prev,
                category: services[0].slug,
                categoryLabel: services[0].name,
              }));
            }
            setShowAddProjectModal(true);
          }}
          className="px-4 py-2 bg-[#0066CC] hover:bg-[#0052A3] text-white text-xs font-semibold uppercase tracking-wider rounded-md transition-colors flex items-center gap-1.5 whitespace-nowrap shadow-md"
        >
          <FolderPlus className="w-4 h-4" />
          <span>Tambah Project Baru</span>
        </button>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.map((proj) => (
          <div
            key={proj.id}
            className="bg-zinc-900/60 border border-zinc-800/80 hover:border-[#0066CC]/50 transition-all rounded-xl overflow-hidden flex flex-col justify-between group shadow-xl"
          >
            <div className="relative h-56 w-full bg-zinc-950">
              <Image
                src={proj.coverImage}
                alt={proj.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500 filter brightness-95 group-hover:brightness-100"
                sizes="(max-width: 768px) 100vw, 33vw"
              />
              <div className="absolute top-3 left-3 flex items-center gap-2">
                <span className="px-2.5 py-1 bg-black/80 backdrop-blur-md text-[9px] text-[#0066CC] border border-[#0066CC]/40 font-semibold uppercase tracking-widest rounded-md">
                  {proj.categoryLabel}
                </span>
                {proj.isFeatured && (
                  <span className="px-2 py-0.5 bg-[#0066CC] text-white text-[9px] font-bold uppercase tracking-widest rounded-md flex items-center gap-1 shadow">
                    <Sparkles className="w-3 h-3" /> Featured
                  </span>
                )}
              </div>
            </div>

            <div className="p-5 flex flex-col gap-3">
              <h4 className="font-sans text-lg font-bold text-zinc-100 leading-snug">{proj.title}</h4>
              <p className="text-xs text-zinc-400 font-light line-clamp-2 leading-relaxed">{proj.description}</p>
              <div className="flex items-center justify-between text-[11px] text-zinc-400 pt-3 border-t border-zinc-800/60 font-light">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-[#0066CC]" /> {proj.location}
                </span>
                <span>{proj.eventDate}</span>
              </div>
            </div>

            <div className="p-4 bg-zinc-950/80 border-t border-zinc-800/80 flex items-center justify-between text-xs">
              <button
                onClick={() => handleToggleProjectFeatured(proj.id, proj.isFeatured)}
                className={`text-[11px] font-medium transition-colors ${
                  proj.isFeatured ? 'text-[#0066CC]' : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                {proj.isFeatured ? '★ Featured Active' : '☆ Make Featured'}
              </button>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleOpenManageImages(proj)}
                  className="px-2 py-1 bg-[#0066CC]/20 hover:bg-[#0066CC]/30 border border-[#0066CC]/40 text-[#0066CC] rounded text-[10px] font-semibold flex items-center gap-1 transition-colors"
                >
                  <Images className="w-3 h-3" />
                  <span>Foto Album</span>
                </button>
                <button
                  onClick={() => handleDeleteProject(proj.id, proj.title)}
                  className="p-1.5 text-zinc-500 hover:text-rose-400 transition-colors"
                  title="Hapus Project"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
        {filteredProjects.length === 0 && (
          <div className="col-span-full p-12 bg-zinc-900/40 border border-zinc-800/80 rounded-xl text-center text-xs text-zinc-400 font-light">
            Belum ada project portofolio.
          </div>
        )}
      </div>

      {/* ===== MODAL: ADD PROJECT ===== */}
      {showAddProjectModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl max-w-lg w-full p-6 md:p-8 flex flex-col gap-6 max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
              <h3 className="font-sans text-xl font-bold text-zinc-100">Tambah Project Portofolio Baru</h3>
              <button onClick={() => setShowAddProjectModal(false)} className="text-zinc-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateProject} className="flex flex-col gap-4 text-xs">
              <div className="flex flex-col gap-1.5">
                <label className="text-zinc-300 uppercase font-mono font-medium">Judul Karya / Couple *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: The Romance of Ilham & Fitri"
                  value={newProjectForm.title}
                  onChange={(e) => setNewProjectForm({ ...newProjectForm, title: e.target.value })}
                  className="bg-zinc-950 border border-zinc-800 focus:border-[#0066CC] p-3 rounded-lg text-zinc-100 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-zinc-300 uppercase font-mono font-medium">Kategori</label>
                  <select
                    value={newProjectForm.category}
                    onChange={(e) => {
                      const val = e.target.value;
                      const matchedSrv = services.find((s) => s.slug === val);
                      setNewProjectForm({
                        ...newProjectForm,
                        category: val,
                        categoryLabel: matchedSrv ? matchedSrv.name : val,
                      });
                    }}
                    className="bg-zinc-950 border border-zinc-800 focus:border-[#0066CC] p-3 rounded-lg text-zinc-100 focus:outline-none"
                  >
                    {services.map((srv) => (
                      <option key={srv.id} value={srv.slug}>{srv.name}</option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-zinc-300 uppercase font-mono font-medium">Lokasi Acara</label>
                  <input
                    type="text"
                    placeholder="Bangkalan, Madura"
                    value={newProjectForm.location}
                    onChange={(e) => setNewProjectForm({ ...newProjectForm, location: e.target.value })}
                    className="bg-zinc-950 border border-zinc-800 focus:border-[#0066CC] p-3 rounded-lg text-zinc-100 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-zinc-300 uppercase font-mono font-medium">URL Cover Image</label>
                <input
                  type="text"
                  required
                  value={newProjectForm.coverImage}
                  onChange={(e) => setNewProjectForm({ ...newProjectForm, coverImage: e.target.value })}
                  className="bg-zinc-950 border border-zinc-800 focus:border-[#0066CC] p-3 rounded-lg text-zinc-100 focus:outline-none font-mono text-[11px]"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-zinc-300 uppercase font-mono font-medium">Deskripsi Singkat</label>
                <textarea
                  rows={3}
                  value={newProjectForm.description}
                  onChange={(e) => setNewProjectForm({ ...newProjectForm, description: e.target.value })}
                  className="bg-zinc-950 border border-zinc-800 focus:border-[#0066CC] p-3 rounded-lg text-zinc-100 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="mt-4 py-3.5 bg-[#0066CC] hover:bg-[#0052A3] text-white font-semibold uppercase tracking-wider rounded-lg transition-colors shadow-md"
              >
                Simpan Project Portofolio
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ===== MODAL: MANAGE GALLERY IMAGES ===== */}
      {selectedProjectForImages && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl max-w-2xl w-full p-6 md:p-8 flex flex-col gap-6 max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#0066CC]">Kelola Album Foto</span>
                <h3 className="font-sans text-xl font-bold text-zinc-100 mt-0.5">{selectedProjectForImages.title}</h3>
              </div>
              <button onClick={() => setSelectedProjectForImages(null)} className="text-zinc-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddGalleryImage} className="p-4 bg-zinc-950 border border-zinc-800/80 rounded-lg flex flex-col gap-3 text-xs">
              <span className="font-semibold text-[#0066CC] uppercase font-mono text-[11px]">+ Tambah Foto Lembaran Baru ke Album Ini</span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2 flex flex-col gap-1">
                  <label className="text-[10px] text-zinc-400 uppercase font-mono">URL Foto *</label>
                  <input
                    type="url"
                    required
                    placeholder="https://images.unsplash.com/..."
                    value={newImageForm.imageUrl}
                    onChange={(e) => setNewImageForm({ ...newImageForm, imageUrl: e.target.value })}
                    className="bg-zinc-900 border border-zinc-800 focus:border-[#0066CC] p-2.5 rounded-md text-zinc-100 focus:outline-none text-xs"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-zinc-400 uppercase font-mono">Format / Orientasi</label>
                  <select
                    value={newImageForm.aspectRatio}
                    onChange={(e) => setNewImageForm({ ...newImageForm, aspectRatio: e.target.value as typeof newImageForm.aspectRatio })}
                    className="bg-zinc-900 border border-zinc-800 focus:border-[#0066CC] p-2.5 rounded-md text-zinc-100 focus:outline-none text-xs"
                  >
                    <option value="landscape">Landscape (Tidur)</option>
                    <option value="portrait">Portrait (Tegak)</option>
                    <option value="square">Square (Persegi)</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#0066CC] hover:bg-[#0052A3] text-white text-xs font-semibold uppercase tracking-wider rounded-md transition-colors"
                >
                  Upload / Tambah Foto
                </button>
              </div>
            </form>

            <div className="flex flex-col gap-3">
              <h4 className="text-xs font-mono font-semibold text-zinc-300 uppercase tracking-wider flex items-center justify-between">
                <span>Koleksi Foto Album ({projectImages.length})</span>
                {isLoadingProjectImages && <span className="text-amber-400 text-[10px]">Memuat foto...</span>}
              </h4>
              {projectImages.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 max-h-[350px] overflow-y-auto pr-1">
                  {projectImages.map((img) => (
                    <div key={img.id} className="relative group rounded-lg overflow-hidden bg-zinc-950 border border-zinc-800 h-32">
                      <Image
                        src={img.imageUrl}
                        alt={img.altText || 'Foto Album'}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 50vw, 33vw"
                      />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-2">
                        <button
                          type="button"
                          onClick={() => handleDeleteGalleryImage(img.id)}
                          className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded text-[10px] font-semibold uppercase tracking-wider flex items-center gap-1 shadow"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Hapus</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 bg-zinc-950 border border-zinc-800/80 rounded-lg text-center text-xs text-zinc-400 font-light">
                  Belum ada foto. Gunakan form di atas untuk menambah foto.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
