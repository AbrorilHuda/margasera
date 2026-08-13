'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  MOCK_BOOKINGS,
  MOCK_PROJECTS,
  MOCK_SERVICES,
  MOCK_PACKAGES,
  MOCK_AVAILABILITY
} from '@/lib/mock-data';
import {
  Booking,
  GalleryProject,
  Package,
  Service,
  BookingStatus
} from '@/lib/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import {
  LayoutDashboard,
  Calendar,
  Camera,
  Tag,
  CheckCircle2,
  Clock,
  Filter,
  LogOut,
  Plus,
  Search,
  ShieldCheck,
  Trash2,
  Sparkles,
  ExternalLink,
  Menu,
  X,
  MapPin,
  DollarSign,
  Layers,
  FolderPlus,
  PackagePlus,
  Settings,
  Check,
  Eye,
  MessageCircle,
  Phone,
  Globe,
  TrendingUp,
  Activity,
  ArrowUpRight
} from 'lucide-react';
import { InstagramIcon } from '@/components/ui/icons';

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'bookings' | 'portfolio' | 'pricing' | 'calendar' | 'settings'>('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Dynamic States for Interactive Demo
  const [bookings, setBookings] = useState<Booking[]>(MOCK_BOOKINGS);
  const [projects, setProjects] = useState<GalleryProject[]>(MOCK_PROJECTS);
  const [services, setServices] = useState<Service[]>(MOCK_SERVICES);
  const [packages, setPackages] = useState<Package[]>(MOCK_PACKAGES);
  const [availability, setAvailability] = useState(MOCK_AVAILABILITY);

  // Filter States
  const [bookingStatusFilter, setBookingStatusFilter] = useState<string>('all');
  const [bookingSearch, setBookingSearch] = useState<string>('');
  const [portfolioCategoryFilter, setPortfolioCategoryFilter] = useState<string>('all');
  const [selectedServiceIdForPricing, setSelectedServiceIdForPricing] = useState<string>('s-wedding');

  // Studio Settings State
  const [studioSettings, setStudioSettings] = useState({
    name: 'Margasera Photography',
    owner: 'Abroril Huda',
    whatsapp: '0819-3110-7481',
    tiktok: 'https://www.tiktok.com/@margasera',
    instagram: 'https://instagram.com/margasera.id',
    location: 'Madura, Jawa Timur & Destination Worldwide',
    savedNotice: false,
  });

  // Modal States
  const [showAddBookingModal, setShowAddBookingModal] = useState(false);
  const [showAddProjectModal, setShowAddProjectModal] = useState(false);
  const [showAddPackageModal, setShowAddPackageModal] = useState(false);
  const [selectedBookingForDetail, setSelectedBookingForDetail] = useState<Booking | null>(null);

  // Form States for Modal
  const [newBookingForm, setNewBookingForm] = useState({
    customerName: '',
    whatsapp: '',
    email: '',
    instagram: '',
    serviceId: 's-wedding',
    packageId: 'pkg-w-signature',
    bookingDate: new Date().toISOString().split('T')[0],
    location: '',
    totalPrice: 14500000,
    notes: '',
  });

  const [newProjectForm, setNewProjectForm] = useState({
    title: '',
    category: 'wedding' as any,
    categoryLabel: 'Wedding',
    location: '',
    eventDate: '',
    coverImage: 'https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=1600&auto=format&fit=crop',
    description: '',
    isFeatured: true,
  });

  const [newPackageForm, setNewPackageForm] = useState({
    serviceId: 's-wedding',
    name: '',
    price: 9500000,
    duration: '8 Jam',
    photographerCount: 2,
    editedPhotos: '100 Foto Edited',
    description: '',
    featuresText: '2 Photographers\n100 Color Graded Photos\nFlashdrive USB Exclusive\n1 Wooden Frame 40x60',
    isPopular: false,
  });

  // Booking Actions
  const handleUpdateBookingStatus = (id: string, newStatus: BookingStatus) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status: newStatus } : b))
    );
  };

  const handleUpdatePaymentStatus = (id: string, newPaymentStatus: 'unpaid' | 'dp_paid' | 'paid_full') => {
    setBookings((prev) =>
      prev.map((b) => (b.id === id ? { ...b, paymentStatus: newPaymentStatus } : b))
    );
  };

  const handleCreateBooking = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanDate = newBookingForm.bookingDate.replace(/-/g, '').substring(2);
    const randomNum = String(Math.floor(Math.random() * 900) + 100);
    const selectedSrv = services.find((s) => s.id === newBookingForm.serviceId);
    const selectedPkg = packages.find((p) => p.id === newBookingForm.packageId);

    const created: Booking = {
      id: `b-${Date.now()}`,
      bookingCode: `MS-${cleanDate}-${randomNum}`,
      customerName: newBookingForm.customerName || 'Pelanggan Baru',
      whatsapp: newBookingForm.whatsapp || '081931107481',
      email: newBookingForm.email || 'customer@margasera.id',
      instagram: newBookingForm.instagram,
      serviceId: newBookingForm.serviceId,
      serviceName: selectedSrv?.name || 'Wedding Photography',
      packageId: newBookingForm.packageId,
      packageName: selectedPkg?.name || 'Custom Package',
      bookingDate: newBookingForm.bookingDate,
      location: newBookingForm.location || 'Madura',
      status: 'confirmed',
      totalPrice: Number(newBookingForm.totalPrice) || 10000000,
      notes: newBookingForm.notes,
      createdAt: new Date().toISOString(),
    };

    setBookings([created, ...bookings]);
    setShowAddBookingModal(false);
  };

  // Project Actions
  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    const created: GalleryProject = {
      id: `proj-${Date.now()}`,
      title: newProjectForm.title || 'Project Portofolio Baru',
      slug: newProjectForm.title.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'project-baru',
      category: newProjectForm.category,
      categoryLabel: newProjectForm.categoryLabel,
      description: newProjectForm.description || 'Dokumentasi sinematik foto pilihan Margasera.',
      location: newProjectForm.location || 'Madura, Jawa Timur',
      eventDate: newProjectForm.eventDate || 'Agustus 2026',
      coverImage: newProjectForm.coverImage,
      isFeatured: newProjectForm.isFeatured,
      images: [
        {
          id: `img-${Date.now()}`,
          projectId: `proj-${Date.now()}`,
          imageUrl: newProjectForm.coverImage,
          altText: newProjectForm.title,
          sortOrder: 1,
          aspectRatio: 'landscape',
        },
      ],
    };

    setProjects([created, ...projects]);
    setShowAddProjectModal(false);
  };

  const handleDeleteProject = (id: string) => {
    setProjects(projects.filter((p) => p.id !== id));
  };

  const handleToggleProjectFeatured = (id: string) => {
    setProjects((prev) =>
      prev.map((p) => (p.id === id ? { ...p, isFeatured: !p.isFeatured } : p))
    );
  };

  // Package Actions
  const handleCreatePackage = (e: React.FormEvent) => {
    e.preventDefault();
    const srv = services.find((s) => s.id === newPackageForm.serviceId);
    const created: Package = {
      id: `pkg-${Date.now()}`,
      serviceId: newPackageForm.serviceId,
      serviceName: srv?.name || 'Layanan Margasera',
      name: newPackageForm.name || 'Paket Kustom Baru',
      slug: newPackageForm.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      description: newPackageForm.description || 'Paket layanan dokumentasi profesional.',
      price: Number(newPackageForm.price) || 5000000,
      duration: newPackageForm.duration || '6 Jam',
      photographerCount: Number(newPackageForm.photographerCount) || 2,
      editedPhotos: newPackageForm.editedPhotos || '80 Foto Edited',
      features: newPackageForm.featuresText.split('\n').filter((f) => f.trim().length > 0),
      isPopular: newPackageForm.isPopular,
      isActive: true,
    };

    setPackages([...packages, created]);
    setShowAddPackageModal(false);
  };

  const handleDeletePackage = (id: string) => {
    setPackages(packages.filter((pkg) => pkg.id !== id));
  };

  const handleTogglePackagePopular = (id: string) => {
    setPackages((prev) =>
      prev.map((pkg) => (pkg.id === id ? { ...pkg, isPopular: !pkg.isPopular } : pkg))
    );
  };

  // Save Settings Action
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setStudioSettings((prev) => ({ ...prev, savedNotice: true }));
    setTimeout(() => {
      setStudioSettings((prev) => ({ ...prev, savedNotice: false }));
    }, 3000);
  };

  // Computed Filters
  const filteredBookings = bookings.filter((b) => {
    const matchStatus = bookingStatusFilter === 'all' || b.status === bookingStatusFilter;
    const matchSearch =
      b.bookingCode.toLowerCase().includes(bookingSearch.toLowerCase()) ||
      b.customerName.toLowerCase().includes(bookingSearch.toLowerCase()) ||
      b.whatsapp.includes(bookingSearch);
    return matchStatus && matchSearch;
  });

  const filteredProjects = projects.filter((p) =>
    portfolioCategoryFilter === 'all' ? true : p.category === portfolioCategoryFilter
  );

  const activeServicePricing = services.find((s) => s.id === selectedServiceIdForPricing) || services[0];
  const packagesForSelectedService = packages.filter((pkg) => pkg.serviceId === selectedServiceIdForPricing);

  // Stats Calculations
  const totalRevenue = bookings.reduce((sum, b) => sum + (b.totalPrice || 0), 0);
  const confirmedCount = bookings.filter((b) => b.status === 'confirmed').length;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col md:flex-row font-sans selection:bg-[#0066CC] selection:text-white">
      {/* ================= ELEGANT LUXURY SIDEBAR ================= */}
      <aside
        className={`fixed md:sticky top-0 left-0 bottom-0 z-40 w-72 bg-zinc-950/95 backdrop-blur-xl border-r border-zinc-900 flex flex-col justify-between p-6 transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
          }`}
      >
        <div className="flex flex-col gap-8">
          {/* Logo Header */}
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3">
              <Image
                src="/logo.png"
                alt="Margasera Logo"
                width={160}
                height={48}
                className="h-10 w-auto object-contain"
                priority
              />
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="md:hidden text-zinc-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Admin Profile Card */}
          <div className="p-3.5 bg-zinc-900/60 border border-zinc-800/80 rounded-xl flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#0066CC] text-white font-serif-editorial font-bold flex items-center justify-center text-sm shadow-[0_0_15px_rgba(0,102,204,0.4)]">
              AH
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-zinc-100 tracking-wide">{studioSettings.owner}</span>
              <div className="flex items-center gap-1 text-[10px] text-[#0066CC] font-mono tracking-widest uppercase">
                <ShieldCheck className="w-3 h-3" />
                <span>Lead Admin</span>
              </div>
            </div>
          </div>

          {/* Navigation Items */}
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-[0.2em] px-3 mb-2 font-medium">
              Navigation Menu
            </span>

            {[
              { id: 'overview', label: 'Ikhtisar & Stats', icon: LayoutDashboard },
              { id: 'bookings', label: 'Pesanan & Booking', icon: Calendar, badge: bookings.length },
              { id: 'portfolio', label: 'Manajemen Portofolio', icon: Camera, badge: projects.length },
              { id: 'pricing', label: 'Layanan & Harga Paket', icon: Tag },
              { id: 'calendar', label: 'Kalender Ketersediaan', icon: Clock },
              { id: 'settings', label: 'Pengaturan Studio', icon: Settings },
            ].map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => { setActiveTab(item.id as any); setSidebarOpen(false); }}
                  className={`flex items-center justify-between px-4 py-3 rounded-lg text-xs font-medium transition-all duration-200 ${isActive
                      ? 'bg-[#0066CC] text-white font-semibold shadow-[0_0_20px_rgba(0,102,204,0.35)] border border-[#0066CC]/50'
                      : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100'
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-zinc-500'}`} />
                    <span className="tracking-wide">{item.label}</span>
                  </div>
                  {item.badge !== undefined && (
                    <span className={`px-2 py-0.5 text-[10px] rounded-full font-mono font-semibold ${isActive ? 'bg-black/30 text-white' : 'bg-zinc-900 text-zinc-400 border border-zinc-800'
                      }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Sidebar Bottom Action Buttons */}
        <div className="flex flex-col gap-2.5 pt-6 border-t border-zinc-900 text-xs font-medium">
          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-between px-4 py-2.5 bg-zinc-900/60 border border-zinc-800/80 hover:border-[#0066CC]/50 text-zinc-300 rounded-lg transition-colors group"
          >
            <div className="flex items-center gap-2">
              <Globe className="w-3.5 h-3.5 text-[#0066CC]" />
              <span className="tracking-wide">Website Live</span>
            </div>
            <ArrowUpRight className="w-3.5 h-3.5 text-zinc-500 group-hover:text-[#0066CC] transition-colors" />
          </Link>

          <Link
            href="/admin/login"
            className="flex items-center gap-2.5 px-4 py-2.5 bg-rose-950/20 border border-rose-900/30 hover:bg-rose-900/30 text-rose-400 rounded-lg transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="tracking-wide">Keluar Dashboard</span>
          </Link>
        </div>
      </aside>

      {/* Mobile Backdrop */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-30 bg-black/80 backdrop-blur-md md:hidden"
        />
      )}

      {/* ================= MAIN DASHBOARD BODY ================= */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header Bar */}
        <header className="sticky top-0 z-20 bg-zinc-950/85 backdrop-blur-xl border-b border-zinc-900 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden p-2 text-zinc-400 hover:text-white"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div>
              <span className="text-[10px] font-mono tracking-[0.25em] text-[#0066CC] uppercase font-medium">
                Margasera Control Center
              </span>
              <h1 className="font-serif-editorial text-2xl sm:text-3xl text-zinc-100 font-light tracking-wide uppercase">
                {activeTab === 'overview' && 'Ikhtisar & Ringkasan Performa'}
                {activeTab === 'bookings' && 'Manajemen Booking & Pesanan'}
                {activeTab === 'portfolio' && 'Manajemen Portofolio & Karya'}
                {activeTab === 'pricing' && 'Manajemen Layanan & Paket Harga'}
                {activeTab === 'calendar' && 'Kalender Ketersediaan Tanggal'}
                {activeTab === 'settings' && 'Pengaturan Studio & Informasi Kontak'}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowAddBookingModal(true)}
              className="px-4 py-2 bg-[#0066CC] hover:bg-[#0052A3] text-white text-xs font-semibold uppercase tracking-wider rounded-lg transition-all shadow-[0_0_15px_rgba(0,102,204,0.3)] flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Tambah Booking</span>
            </button>
          </div>
        </header>

        {/* Dynamic Content Views */}
        <main className="p-6 sm:p-8 md:p-10 flex-1 max-w-7xl w-full mx-auto">
          {/* ================= TAB 1: OVERVIEW ================= */}
          {activeTab === 'overview' && (
            <div className="flex flex-col gap-8">
              {/* Metric Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="p-6 bg-zinc-900/60 border border-zinc-800/80 hover:border-[#0066CC]/50 transition-all rounded-xl flex flex-col gap-3 relative overflow-hidden group shadow-lg">
                  <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#0066CC] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="flex items-center justify-between text-zinc-400">
                    <span className="text-[11px] font-mono tracking-widest text-zinc-400 uppercase font-medium">Est. Investasi Masuk</span>
                    <div className="w-8 h-8 rounded-lg bg-[#0066CC]/10 border border-[#0066CC]/30 flex items-center justify-center text-[#0066CC]">
                      <DollarSign className="w-4 h-4" />
                    </div>
                  </div>
                  <span className="font-serif-editorial text-3xl sm:text-4xl text-zinc-100 font-light tracking-tight mt-1">
                    {formatCurrency(totalRevenue)}
                  </span>
                  <span className="text-[11px] text-emerald-400 font-medium flex items-center gap-1">
                    <TrendingUp className="w-3.5 h-3.5" />
                    {confirmedCount} Pesanan Dikonfirmasi
                  </span>
                </div>

                <div className="p-6 bg-zinc-900/60 border border-zinc-800/80 hover:border-[#0066CC]/50 transition-all rounded-xl flex flex-col gap-3 relative overflow-hidden group shadow-lg">
                  <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#0066CC] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="flex items-center justify-between text-zinc-400">
                    <span className="text-[11px] font-mono tracking-widest text-zinc-400 uppercase font-medium">Total Booking</span>
                    <div className="w-8 h-8 rounded-lg bg-[#0066CC]/10 border border-[#0066CC]/30 flex items-center justify-center text-[#0066CC]">
                      <Calendar className="w-4 h-4" />
                    </div>
                  </div>
                  <span className="font-serif-editorial text-3xl sm:text-4xl text-zinc-100 font-light tracking-tight mt-1">
                    {bookings.length} Pesanan
                  </span>
                  <span className="text-[11px] text-zinc-400 font-light">
                    Termasuk Booking Online & Offline
                  </span>
                </div>

                <div className="p-6 bg-zinc-900/60 border border-zinc-800/80 hover:border-[#0066CC]/50 transition-all rounded-xl flex flex-col gap-3 relative overflow-hidden group shadow-lg">
                  <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#0066CC] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="flex items-center justify-between text-zinc-400">
                    <span className="text-[11px] font-mono tracking-widest text-zinc-400 uppercase font-medium">Portofolio Karya</span>
                    <div className="w-8 h-8 rounded-lg bg-[#0066CC]/10 border border-[#0066CC]/30 flex items-center justify-center text-[#0066CC]">
                      <Camera className="w-4 h-4" />
                    </div>
                  </div>
                  <span className="font-serif-editorial text-3xl sm:text-4xl text-zinc-100 font-light tracking-tight mt-1">
                    {projects.length} Project
                  </span>
                  <span className="text-[11px] text-zinc-400 font-light">
                    {projects.filter((p) => p.isFeatured).length} Project Featured Beranda
                  </span>
                </div>

                <div className="p-6 bg-zinc-900/60 border border-zinc-800/80 hover:border-[#0066CC]/50 transition-all rounded-xl flex flex-col gap-3 relative overflow-hidden group shadow-lg">
                  <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#0066CC] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="flex items-center justify-between text-zinc-400">
                    <span className="text-[11px] font-mono tracking-widest text-zinc-400 uppercase font-medium">Layanan & Paket</span>
                    <div className="w-8 h-8 rounded-lg bg-[#0066CC]/10 border border-[#0066CC]/30 flex items-center justify-center text-[#0066CC]">
                      <Layers className="w-4 h-4" />
                    </div>
                  </div>
                  <span className="font-serif-editorial text-3xl sm:text-4xl text-zinc-100 font-light tracking-tight mt-1">
                    {packages.length} Paket
                  </span>
                  <span className="text-[11px] text-zinc-400 font-light">
                    {services.length} Kategori Layanan Aktif
                  </span>
                </div>
              </div>

              {/* Action Bar Shortcuts */}
              <div className="p-6 sm:p-8 bg-zinc-900/60 border border-zinc-800/80 rounded-xl flex flex-col gap-5 shadow-xl">
                <span className="text-[11px] font-mono tracking-[0.25em] text-[#0066CC] uppercase font-semibold">
                  Aksi Cepat Manajemen Studio
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <button
                    onClick={() => { setActiveTab('portfolio'); setShowAddProjectModal(true); }}
                    className="p-4 bg-zinc-950 border border-zinc-800/80 hover:border-[#0066CC] rounded-xl flex flex-col items-center gap-2 text-center transition-all group shadow-md"
                  >
                    <FolderPlus className="w-5 h-5 text-[#0066CC] group-hover:scale-110 transition-transform" />
                    <span className="text-xs font-medium text-zinc-200 tracking-wide">Tambah Portofolio</span>
                  </button>

                  <button
                    onClick={() => { setActiveTab('pricing'); setShowAddPackageModal(true); }}
                    className="p-4 bg-zinc-950 border border-zinc-800/80 hover:border-[#0066CC] rounded-xl flex flex-col items-center gap-2 text-center transition-all group shadow-md"
                  >
                    <PackagePlus className="w-5 h-5 text-[#0066CC] group-hover:scale-110 transition-transform" />
                    <span className="text-xs font-medium text-zinc-200 tracking-wide">Tambah Paket Baru</span>
                  </button>

                  <button
                    onClick={() => setShowAddBookingModal(true)}
                    className="p-4 bg-zinc-950 border border-zinc-800/80 hover:border-[#0066CC] rounded-xl flex flex-col items-center gap-2 text-center transition-all group shadow-md"
                  >
                    <Plus className="w-5 h-5 text-[#0066CC] group-hover:scale-110 transition-transform" />
                    <span className="text-xs font-medium text-zinc-200 tracking-wide">Booking Manual Baru</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('calendar')}
                    className="p-4 bg-zinc-950 border border-zinc-800/80 hover:border-[#0066CC] rounded-xl flex flex-col items-center gap-2 text-center transition-all group shadow-md"
                  >
                    <Clock className="w-5 h-5 text-[#0066CC] group-hover:scale-110 transition-transform" />
                    <span className="text-xs font-medium text-zinc-200 tracking-wide">Status Tanggal Libur</span>
                  </button>
                </div>
              </div>

              {/* Recent Bookings Table */}
              <div className="p-6 sm:p-8 bg-zinc-900/60 border border-zinc-800/80 rounded-xl flex flex-col gap-6 shadow-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-mono text-[#0066CC] uppercase tracking-widest">Aktivitas Terbaru</span>
                    <h3 className="font-serif-editorial text-2xl sm:text-3xl text-zinc-100 font-light uppercase tracking-wide">
                      Pesanan Terbaru
                    </h3>
                  </div>
                  <button
                    onClick={() => setActiveTab('bookings')}
                    className="text-xs text-[#0066CC] hover:underline font-medium tracking-wide"
                  >
                    Lihat Semua Pesanan →
                  </button>
                </div>

                <div className="overflow-x-auto rounded-lg border border-zinc-800/80">
                  <table className="w-full text-left text-xs font-light">
                    <thead className="bg-zinc-950 border-b border-zinc-800 text-[#0066CC] font-mono font-medium tracking-[0.2em] uppercase text-[10px]">
                      <tr>
                        <th className="p-4">Kode Booking</th>
                        <th className="p-4">Pelanggan</th>
                        <th className="p-4">Layanan</th>
                        <th className="p-4">Tanggal Acara</th>
                        <th className="p-4">Est. Harga</th>
                        <th className="p-4">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/60">
                      {bookings.slice(0, 5).map((b) => (
                        <tr key={b.id} className="hover:bg-zinc-800/40 transition-colors">
                          <td className="p-4 font-mono font-bold text-[#0066CC]">{b.bookingCode}</td>
                          <td className="p-4 font-semibold text-zinc-100">{b.customerName}</td>
                          <td className="p-4 text-zinc-300">{b.serviceName}</td>
                          <td className="p-4 text-zinc-400">{formatDate(b.bookingDate)}</td>
                          <td className="p-4 font-serif-editorial text-base font-semibold text-[#0066CC]">
                            {b.totalPrice ? formatCurrency(b.totalPrice) : '-'}
                          </td>
                          <td className="p-4">
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] uppercase font-mono tracking-wider font-semibold ${b.status === 'confirmed'
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                                : 'bg-[#0066CC]/10 text-[#0066CC] border border-[#0066CC]/30'
                              }`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${b.status === 'confirmed' ? 'bg-emerald-400' : 'bg-[#0066CC]'}`} />
                              {b.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ================= TAB 2: BOOKINGS MANAGEMENT ================= */}
          {activeTab === 'bookings' && (
            <div className="flex flex-col gap-6">
              {/* Filter & Search Toolbar */}
              <div className="p-6 bg-zinc-900/60 border border-zinc-800/80 rounded-xl flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl">
                <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
                  <Filter className="w-4 h-4 text-[#0066CC] shrink-0" />
                  <span className="text-xs text-zinc-400 uppercase tracking-wider whitespace-nowrap font-mono">Filter Status:</span>
                  {['all', 'pending', 'confirmed', 'completed', 'cancelled'].map((st) => (
                    <button
                      key={st}
                      onClick={() => setBookingStatusFilter(st)}
                      className={`px-3 py-1.5 text-xs tracking-wider uppercase rounded-md transition-colors whitespace-nowrap font-medium ${bookingStatusFilter === st
                          ? 'bg-[#0066CC] text-white font-semibold shadow-sm'
                          : 'bg-zinc-950 text-zinc-400 hover:text-white border border-zinc-800'
                        }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                  <div className="relative w-full md:w-64">
                    <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Cari Kode / Nama / WA..."
                      value={bookingSearch}
                      onChange={(e) => setBookingSearch(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 focus:border-[#0066CC] text-zinc-100 pl-9 pr-3 py-2 rounded-md text-xs focus:outline-none transition-colors"
                    />
                  </div>
                  <button
                    onClick={() => setShowAddBookingModal(true)}
                    className="px-4 py-2 bg-[#0066CC] hover:bg-[#0052A3] text-white text-xs font-semibold uppercase tracking-wider rounded-md transition-colors whitespace-nowrap flex items-center gap-1.5 shadow-md"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Tambah Booking</span>
                  </button>
                </div>
              </div>

              {/* Bookings Table */}
              <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-xl overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-light">
                    <thead className="bg-zinc-950 border-b border-zinc-800 text-[#0066CC] font-mono font-medium tracking-[0.2em] uppercase text-[10px]">
                      <tr>
                        <th className="p-4">Kode Booking</th>
                        <th className="p-4">Pelanggan</th>
                        <th className="p-4">Layanan & Paket</th>
                        <th className="p-4">Tanggal Acara</th>
                        <th className="p-4">Lokasi / Venue</th>
                        <th className="p-4">Est. Harga</th>
                        <th className="p-4">Status</th>
                        <th className="p-4">Aksi Admin</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/60">
                      {filteredBookings.map((b) => (
                        <tr key={b.id} className="hover:bg-zinc-800/40 transition-colors">
                          <td className="p-4 font-mono font-bold text-[#0066CC]">{b.bookingCode}</td>
                          <td className="p-4">
                            <div className="flex flex-col">
                              <span className="font-semibold text-zinc-100">{b.customerName}</span>
                              <span className="text-[10px] text-zinc-400 font-mono">{b.whatsapp}</span>
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="flex flex-col">
                              <span className="text-zinc-200 font-semibold">{b.serviceName}</span>
                              <span className="text-[10px] text-zinc-400">{b.packageName}</span>
                            </div>
                          </td>
                          <td className="p-4 text-zinc-300">{formatDate(b.bookingDate)}</td>
                          <td className="p-4 text-zinc-400 max-w-[140px] truncate">{b.location}</td>
                          <td className="p-4 font-serif-editorial text-base font-semibold text-[#0066CC]">
                            {b.totalPrice ? formatCurrency(b.totalPrice) : '-'}
                          </td>
                          <td className="p-4">
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] uppercase font-mono tracking-wider font-semibold ${b.status === 'confirmed'
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                                : b.status === 'completed'
                                  ? 'bg-blue-500/10 text-blue-300 border border-blue-500/30'
                                  : b.status === 'pending'
                                    ? 'bg-[#0066CC]/10 text-[#0066CC] border border-[#0066CC]/30'
                                    : 'bg-rose-950/40 text-rose-400 border border-rose-900/50'
                              }`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${b.status === 'confirmed' ? 'bg-emerald-400' : b.status === 'completed' ? 'bg-blue-400' : 'bg-[#0066CC]'
                                }`} />
                              {b.status}
                            </span>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => setSelectedBookingForDetail(b)}
                                className="p-1.5 bg-zinc-950 border border-zinc-800 hover:border-zinc-700 text-zinc-300 rounded"
                                title="Lihat Detail"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                              {b.status === 'pending' && (
                                <button
                                  onClick={() => handleUpdateBookingStatus(b.id, 'confirmed')}
                                  className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-semibold uppercase tracking-wider rounded transition-colors"
                                >
                                  Confirm
                                </button>
                              )}
                              {b.status === 'confirmed' && (
                                <button
                                  onClick={() => handleUpdateBookingStatus(b.id, 'completed')}
                                  className="px-2.5 py-1 bg-[#0066CC] hover:bg-[#0052A3] text-white text-[10px] font-semibold uppercase tracking-wider rounded transition-colors"
                                >
                                  Complete
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ================= TAB 3: PORTFOLIO MANAGEMENT ================= */}
          {activeTab === 'portfolio' && (
            <div className="flex flex-col gap-6">
              {/* Header Bar */}
              <div className="p-6 bg-zinc-900/60 border border-zinc-800/80 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
                <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0">
                  <span className="text-xs text-zinc-400 uppercase tracking-wider whitespace-nowrap font-mono">Filter Kategori:</span>
                  {[
                    { id: 'all', label: 'Semua Karya' },
                    { id: 'wedding', label: 'Wedding' },
                    { id: 'pre-wedding', label: 'Pre-Wedding' },
                    { id: 'couple', label: 'Couple' },
                    { id: 'portrait', label: 'Portrait' },
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setPortfolioCategoryFilter(cat.id)}
                      className={`px-3 py-1.5 text-xs tracking-wider uppercase rounded-md transition-colors whitespace-nowrap font-medium ${portfolioCategoryFilter === cat.id
                          ? 'bg-[#0066CC] text-white font-semibold shadow-sm'
                          : 'bg-zinc-950 text-zinc-400 hover:text-white border border-zinc-800'
                        }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setShowAddProjectModal(true)}
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
                      <h4 className="font-serif-editorial text-2xl text-zinc-100 font-light leading-snug">
                        {proj.title}
                      </h4>
                      <p className="text-xs text-zinc-400 font-light line-clamp-2 leading-relaxed">
                        {proj.description}
                      </p>
                      <div className="flex items-center justify-between text-[11px] text-zinc-400 pt-3 border-t border-zinc-800/60 font-light">
                        <span className="flex items-center gap-1"><MapPin className="w-3 h-3 text-[#0066CC]" /> {proj.location}</span>
                        <span>{proj.eventDate}</span>
                      </div>
                    </div>

                    {/* Action Bar */}
                    <div className="p-4 bg-zinc-950/80 border-t border-zinc-800/80 flex items-center justify-between text-xs">
                      <button
                        onClick={() => handleToggleProjectFeatured(proj.id)}
                        className={`text-[11px] font-medium transition-colors ${proj.isFeatured ? 'text-[#0066CC]' : 'text-zinc-500 hover:text-zinc-300'
                          }`}
                      >
                        {proj.isFeatured ? '★ Featured Active' : '☆ Make Featured'}
                      </button>

                      <button
                        onClick={() => handleDeleteProject(proj.id)}
                        className="p-1.5 text-zinc-500 hover:text-rose-400 transition-colors"
                        title="Hapus Project"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ================= TAB 4: SERVICES & PACKAGES PRICING ================= */}
          {activeTab === 'pricing' && (
            <div className="flex flex-col gap-6">
              {/* Category Selector Tabs */}
              <div className="p-6 bg-zinc-900/60 border border-zinc-800/80 rounded-xl flex flex-col gap-4 shadow-xl">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div>
                    <span className="text-[10px] font-mono text-[#0066CC] uppercase tracking-widest font-semibold">
                      Price Configuration System
                    </span>
                    <h3 className="font-serif-editorial text-3xl text-zinc-100 font-light uppercase tracking-wide">
                      Layanan & Tarif Harga Paket
                    </h3>
                  </div>

                  <button
                    onClick={() => setShowAddPackageModal(true)}
                    className="px-4 py-2 bg-[#0066CC] hover:bg-[#0052A3] text-white text-xs font-semibold uppercase tracking-wider rounded-md transition-colors flex items-center gap-1.5 shadow-md"
                  >
                    <PackagePlus className="w-4 h-4" />
                    <span>Tambah Paket Baru</span>
                  </button>
                </div>

                <div className="flex items-center gap-2 overflow-x-auto pt-2 border-t border-zinc-800/80">
                  {services.map((srv) => (
                    <button
                      key={srv.id}
                      onClick={() => setSelectedServiceIdForPricing(srv.id)}
                      className={`px-4 py-2 text-xs tracking-wider uppercase rounded-md transition-all whitespace-nowrap font-medium ${selectedServiceIdForPricing === srv.id
                          ? 'bg-[#0066CC] text-white font-semibold shadow-md'
                          : 'bg-zinc-950 border border-zinc-800 text-zinc-400 hover:text-white'
                        }`}
                    >
                      {srv.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Service Banner */}
              <div className="p-6 bg-zinc-900/40 border border-zinc-800/80 rounded-xl flex items-center justify-between gap-4">
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-[#0066CC] font-mono font-semibold tracking-wider uppercase">
                    Kategori Terpilih: {activeServicePricing.name}
                  </span>
                  <p className="text-xs text-zinc-400 font-light max-w-2xl">
                    {activeServicePricing.description}
                  </p>
                </div>
                <span className="text-xs font-serif-editorial text-zinc-200 bg-zinc-950 px-4 py-2 rounded-lg border border-zinc-800 whitespace-nowrap">
                  Mulai Dari: <strong className="text-[#0066CC] text-base">{formatCurrency(activeServicePricing.startingPrice || 0)}</strong>
                </span>
              </div>

              {/* Package Cards List */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {packagesForSelectedService.map((pkg) => (
                  <div
                    key={pkg.id}
                    className={`bg-zinc-900/60 border rounded-xl p-6 flex flex-col justify-between relative transition-all shadow-xl ${pkg.isPopular ? 'border-[#0066CC] bg-gradient-to-b from-[#0066CC]/15 via-zinc-900/80 to-zinc-900/60 shadow-[0_0_25px_rgba(0,102,204,0.2)]' : 'border-zinc-800/80'
                      }`}
                  >
                    {pkg.isPopular && (
                      <span className="absolute -top-3 left-6 px-3 py-0.5 bg-[#0066CC] text-white text-[9px] font-bold uppercase tracking-widest rounded-full shadow-md">
                        Paling Direkomendasikan
                      </span>
                    )}

                    <div className="flex flex-col gap-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-serif-editorial text-2xl text-zinc-100 font-light">{pkg.name}</h4>
                        <button
                          onClick={() => handleDeletePackage(pkg.id)}
                          className="text-zinc-500 hover:text-rose-400 p-1"
                          title="Hapus Paket"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <p className="text-xs text-zinc-400 font-light leading-relaxed">{pkg.description}</p>

                      <div className="font-serif-editorial text-4xl font-light text-[#0066CC]">
                        {formatCurrency(pkg.price)}
                      </div>

                      <div className="py-3 border-y border-zinc-800/80 flex flex-col gap-2 text-xs text-zinc-300 font-light">
                        <div className="flex items-center justify-between">
                          <span className="text-zinc-500">Durasi Sesi:</span>
                          <strong>{pkg.duration}</strong>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-zinc-500">Fotografer:</span>
                          <strong>{pkg.photographerCount} Fotografer</strong>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-zinc-500">Output Foto:</span>
                          <strong>{pkg.editedPhotos}</strong>
                        </div>
                      </div>

                      {/* Features List */}
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
                        onClick={() => handleTogglePackagePopular(pkg.id)}
                        className={`text-xs font-medium ${pkg.isPopular ? 'text-[#0066CC]' : 'text-zinc-500 hover:text-zinc-300'}`}
                      >
                        {pkg.isPopular ? '★ Tag Popular Active' : '☆ Set As Popular'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ================= TAB 5: CALENDAR AVAILABILITY ================= */}
          {activeTab === 'calendar' && (
            <div className="flex flex-col gap-6">
              <div className="p-6 bg-zinc-900/60 border border-zinc-800/80 rounded-xl flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
                <div>
                  <span className="text-[10px] font-mono text-[#0066CC] uppercase tracking-widest font-semibold">Calendar System</span>
                  <h3 className="font-serif-editorial text-3xl text-zinc-100 font-light uppercase tracking-wide">
                    Kelola Status Tanggal Studio
                  </h3>
                  <p className="text-xs text-zinc-400 font-light mt-1">
                    Tandai tanggal tertentu sebagai Booked atau Blocked secara langsung untuk mencegah pemesanan ganda.
                  </p>
                </div>
              </div>

              {/* Availability List Table */}
              <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-xl p-6 sm:p-8 shadow-xl">
                <h4 className="text-xs font-mono font-semibold text-[#0066CC] uppercase tracking-widest mb-4">
                  Daftar Tanggal Khusus Terdaftar (August & September 2026)
                </h4>
                <div className="overflow-x-auto rounded-lg border border-zinc-800/80">
                  <table className="w-full text-left text-xs font-light">
                    <thead className="bg-zinc-950 border-b border-zinc-800 text-[#0066CC] font-mono font-medium tracking-[0.2em] uppercase text-[10px]">
                      <tr>
                        <th className="p-4">Tanggal</th>
                        <th className="p-4">Status Ketersediaan</th>
                        <th className="p-4">Catatan / Acara</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/60">
                      {availability.map((av) => (
                        <tr key={av.id} className="hover:bg-zinc-800/40 transition-colors">
                          <td className="p-4 font-mono text-zinc-200">{formatDate(av.date)}</td>
                          <td className="p-4">
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] uppercase font-mono tracking-wider font-semibold ${av.status === 'booked'
                                ? 'bg-rose-950/40 text-rose-400 border border-rose-900/50'
                                : av.status === 'blocked'
                                  ? 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                                  : 'bg-[#0066CC]/10 text-[#0066CC] border border-[#0066CC]/30'
                              }`}>
                              {av.status.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="p-4 text-zinc-300">{av.notes || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ================= TAB 6: STUDIO SETTINGS ================= */}
          {activeTab === 'settings' && (
            <div className="flex flex-col gap-6 max-w-3xl">
              <div className="p-8 bg-zinc-900/60 border border-zinc-800/80 rounded-xl flex flex-col gap-6 shadow-xl">
                <div>
                  <span className="text-[10px] font-mono text-[#0066CC] uppercase tracking-widest font-semibold">Studio Profile Settings</span>
                  <h3 className="font-serif-editorial text-3xl text-zinc-100 font-light uppercase tracking-wide">
                    Informasi Kontak Studio
                  </h3>
                  <p className="text-xs text-zinc-400 font-light mt-1">
                    Informasi ini ditampilkan pada bagian footer dan tombol kontak cepat seluruh website.
                  </p>
                </div>

                {studioSettings.savedNotice && (
                  <div className="p-4 bg-emerald-950/40 border border-emerald-800/50 rounded-lg text-xs text-emerald-300 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Pengaturan studio berhasil diperbarui!</span>
                  </div>
                )}

                <form onSubmit={handleSaveSettings} className="flex flex-col gap-5">
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-medium text-zinc-300 uppercase tracking-wider font-mono">Nama Brand Studio</label>
                    <input
                      type="text"
                      value={studioSettings.name}
                      onChange={(e) => setStudioSettings({ ...studioSettings, name: e.target.value })}
                      className="bg-zinc-950 border border-zinc-800 focus:border-[#0066CC] text-zinc-100 p-3.5 rounded-lg text-xs focus:outline-none transition-colors"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-medium text-zinc-300 uppercase tracking-wider font-mono">Nama Owner / Lead Photographer</label>
                    <input
                      type="text"
                      value={studioSettings.owner}
                      onChange={(e) => setStudioSettings({ ...studioSettings, owner: e.target.value })}
                      className="bg-zinc-950 border border-zinc-800 focus:border-[#0066CC] text-zinc-100 p-3.5 rounded-lg text-xs focus:outline-none transition-colors"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-medium text-zinc-300 uppercase tracking-wider font-mono flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-[#0066CC]" /> WhatsApp Contact
                      </label>
                      <input
                        type="text"
                        value={studioSettings.whatsapp}
                        onChange={(e) => setStudioSettings({ ...studioSettings, whatsapp: e.target.value })}
                        className="bg-zinc-950 border border-zinc-800 focus:border-[#0066CC] text-zinc-100 p-3.5 rounded-lg text-xs focus:outline-none transition-colors"
                      />
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-medium text-zinc-300 uppercase tracking-wider font-mono flex items-center gap-2">
                        <Globe className="w-3.5 h-3.5 text-[#0066CC]" /> TikTok Profile URL
                      </label>
                      <input
                        type="text"
                        value={studioSettings.tiktok}
                        onChange={(e) => setStudioSettings({ ...studioSettings, tiktok: e.target.value })}
                        className="bg-zinc-950 border border-zinc-800 focus:border-[#0066CC] text-zinc-100 p-3.5 rounded-lg text-xs focus:outline-none transition-colors"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-medium text-zinc-300 uppercase tracking-wider font-mono">Lokasi Domisili Studio</label>
                    <input
                      type="text"
                      value={studioSettings.location}
                      onChange={(e) => setStudioSettings({ ...studioSettings, location: e.target.value })}
                      className="bg-zinc-950 border border-zinc-800 focus:border-[#0066CC] text-zinc-100 p-3.5 rounded-lg text-xs focus:outline-none transition-colors"
                    />
                  </div>

                  <button
                    type="submit"
                    className="mt-2 py-3.5 bg-[#0066CC] hover:bg-[#0052A3] text-white text-xs font-semibold uppercase tracking-widest rounded-lg transition-all shadow-[0_0_15px_rgba(0,102,204,0.3)]"
                  >
                    Simpan Perubahan Studio
                  </button>
                </form>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ================= MODAL: ADD MANUAL BOOKING ================= */}
      {showAddBookingModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl max-w-lg w-full p-6 md:p-8 flex flex-col gap-6 max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
              <h3 className="font-serif-editorial text-2xl text-zinc-100 font-light">Tambah Booking Manual Baru</h3>
              <button onClick={() => setShowAddBookingModal(false)} className="text-zinc-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateBooking} className="flex flex-col gap-4 text-xs">
              <div className="flex flex-col gap-1.5">
                <label className="text-zinc-300 uppercase font-mono font-medium">Nama Pelanggan *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Rian & Amanda"
                  value={newBookingForm.customerName}
                  onChange={(e) => setNewBookingForm({ ...newBookingForm, customerName: e.target.value })}
                  className="bg-zinc-950 border border-zinc-800 focus:border-[#0066CC] p-3 rounded-lg text-zinc-100 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-zinc-300 uppercase font-mono font-medium">WhatsApp *</label>
                  <input
                    type="text"
                    required
                    placeholder="081931107481"
                    value={newBookingForm.whatsapp}
                    onChange={(e) => setNewBookingForm({ ...newBookingForm, whatsapp: e.target.value })}
                    className="bg-zinc-950 border border-zinc-800 focus:border-[#0066CC] p-3 rounded-lg text-zinc-100 focus:outline-none font-mono"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-zinc-300 uppercase font-mono font-medium">Instagram (@username)</label>
                  <input
                    type="text"
                    placeholder="@username"
                    value={newBookingForm.instagram}
                    onChange={(e) => setNewBookingForm({ ...newBookingForm, instagram: e.target.value })}
                    className="bg-zinc-950 border border-zinc-800 focus:border-[#0066CC] p-3 rounded-lg text-zinc-100 focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-zinc-300 uppercase font-mono font-medium">Tanggal Acara *</label>
                  <input
                    type="date"
                    required
                    value={newBookingForm.bookingDate}
                    onChange={(e) => setNewBookingForm({ ...newBookingForm, bookingDate: e.target.value })}
                    className="bg-zinc-950 border border-zinc-800 focus:border-[#0066CC] p-3 rounded-lg text-zinc-100 focus:outline-none font-mono"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-zinc-300 uppercase font-mono font-medium">Lokasi / Venue *</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Bangkalan, Madura"
                    value={newBookingForm.location}
                    onChange={(e) => setNewBookingForm({ ...newBookingForm, location: e.target.value })}
                    className="bg-zinc-950 border border-zinc-800 focus:border-[#0066CC] p-3 rounded-lg text-zinc-100 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-zinc-300 uppercase font-mono font-medium">Layanan</label>
                  <select
                    value={newBookingForm.serviceId}
                    onChange={(e) => setNewBookingForm({ ...newBookingForm, serviceId: e.target.value })}
                    className="bg-zinc-950 border border-zinc-800 focus:border-[#0066CC] p-3 rounded-lg text-zinc-100 focus:outline-none"
                  >
                    {services.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-zinc-300 uppercase font-mono font-medium">Total Harga (IDR)</label>
                  <input
                    type="number"
                    value={newBookingForm.totalPrice}
                    onChange={(e) => setNewBookingForm({ ...newBookingForm, totalPrice: Number(e.target.value) })}
                    className="bg-zinc-950 border border-zinc-800 focus:border-[#0066CC] p-3 rounded-lg text-zinc-100 focus:outline-none font-mono"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="mt-4 py-3.5 bg-[#0066CC] hover:bg-[#0052A3] text-white font-semibold uppercase tracking-wider rounded-lg transition-colors shadow-md"
              >
                Simpan Booking Manual
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: ADD PORTFOLIO PROJECT ================= */}
      {showAddProjectModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl max-w-lg w-full p-6 md:p-8 flex flex-col gap-6 max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
              <h3 className="font-serif-editorial text-2xl text-zinc-100 font-light">Tambah Project Portofolio Baru</h3>
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
                      const labelMap: any = { wedding: 'Wedding', 'pre-wedding': 'Pre-Wedding', couple: 'Couple', portrait: 'Portrait' };
                      setNewProjectForm({ ...newProjectForm, category: val as any, categoryLabel: labelMap[val] || 'Wedding' });
                    }}
                    className="bg-zinc-950 border border-zinc-800 focus:border-[#0066CC] p-3 rounded-lg text-zinc-100 focus:outline-none"
                  >
                    <option value="wedding">Wedding</option>
                    <option value="pre-wedding">Pre-Wedding</option>
                    <option value="couple">Couple</option>
                    <option value="portrait">Portrait</option>
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

      {/* ================= MODAL: ADD PACKAGE ================= */}
      {showAddPackageModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl max-w-lg w-full p-6 md:p-8 flex flex-col gap-6 max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
              <h3 className="font-serif-editorial text-2xl text-zinc-100 font-light">Tambah Paket Layanan Baru</h3>
              <button onClick={() => setShowAddPackageModal(false)} className="text-zinc-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePackage} className="flex flex-col gap-4 text-xs">
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

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-zinc-300 uppercase font-mono font-medium">Durasi Sesi</label>
                  <input
                    type="text"
                    value={newPackageForm.duration}
                    onChange={(e) => setNewPackageForm({ ...newPackageForm, duration: e.target.value })}
                    className="bg-zinc-950 border border-zinc-800 focus:border-[#0066CC] p-3 rounded-lg text-zinc-100 focus:outline-none"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-zinc-300 uppercase font-mono font-medium">Output Foto</label>
                  <input
                    type="text"
                    value={newPackageForm.editedPhotos}
                    onChange={(e) => setNewPackageForm({ ...newPackageForm, editedPhotos: e.target.value })}
                    className="bg-zinc-950 border border-zinc-800 focus:border-[#0066CC] p-3 rounded-lg text-zinc-100 focus:outline-none"
                  />
                </div>
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

              <button
                type="submit"
                className="mt-4 py-3.5 bg-[#0066CC] hover:bg-[#0052A3] text-white font-semibold uppercase tracking-wider rounded-lg transition-colors shadow-md"
              >
                Simpan Paket Layanan
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: BOOKING DETAIL ================= */}
      {selectedBookingForDetail && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl max-w-lg w-full p-6 md:p-8 flex flex-col gap-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
              <div>
                <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest">Detail Pemesanan</span>
                <h3 className="font-mono text-xl font-bold text-[#0066CC]">
                  {selectedBookingForDetail.bookingCode}
                </h3>
              </div>
              <button onClick={() => setSelectedBookingForDetail(null)} className="text-zinc-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex flex-col gap-3 text-xs text-zinc-300 font-light">
              <div className="flex justify-between py-1 border-b border-zinc-800/60">
                <span className="text-zinc-500 font-mono">Nama Pelanggan:</span>
                <strong className="text-zinc-100">{selectedBookingForDetail.customerName}</strong>
              </div>
              <div className="flex justify-between py-1 border-b border-zinc-800/60">
                <span className="text-zinc-500 font-mono">WhatsApp:</span>
                <strong className="font-mono">{selectedBookingForDetail.whatsapp}</strong>
              </div>
              {selectedBookingForDetail.instagram && (
                <div className="flex justify-between py-1 border-b border-zinc-800/60">
                  <span className="text-zinc-500 font-mono">Instagram Client:</span>
                  <a
                    href={`https://instagram.com/${selectedBookingForDetail.instagram.replace('@', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-[#0066CC] hover:underline font-semibold"
                  >
                    {selectedBookingForDetail.instagram}
                  </a>
                </div>
              )}
              <div className="flex justify-between py-1 border-b border-zinc-800/60">
                <span className="text-zinc-500 font-mono">Layanan:</span>
                <strong>{selectedBookingForDetail.serviceName} ({selectedBookingForDetail.packageName})</strong>
              </div>
              <div className="flex justify-between py-1 border-b border-zinc-800/60">
                <span className="text-zinc-500 font-mono">Tanggal Sesi:</span>
                <strong>{formatDate(selectedBookingForDetail.bookingDate)}</strong>
              </div>
              <div className="flex justify-between py-1 border-b border-zinc-800/60">
                <span className="text-zinc-500 font-mono">Lokasi / Venue:</span>
                <strong>{selectedBookingForDetail.location}</strong>
              </div>
              <div className="flex justify-between py-1 border-b border-zinc-800/60">
                <span className="text-zinc-500 font-mono">Est. Investasi:</span>
                <strong className="text-[#0066CC] font-serif-editorial text-lg">
                  {selectedBookingForDetail.totalPrice ? formatCurrency(selectedBookingForDetail.totalPrice) : '-'}
                </strong>
              </div>
              <div className="flex justify-between py-1 border-b border-zinc-800/60">
                <span className="text-zinc-500 font-mono">Status Pembayaran:</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase font-mono ${
                  selectedBookingForDetail.paymentStatus === 'paid_full'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : selectedBookingForDetail.paymentStatus === 'dp_paid'
                    ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                }`}>
                  {selectedBookingForDetail.paymentStatus === 'paid_full' ? 'LUNAS (100%)' : selectedBookingForDetail.paymentStatus === 'dp_paid' ? 'DP TERBAYAR (30%)' : 'BELUM DP'}
                </span>
              </div>
              {selectedBookingForDetail.notes && (
                <div className="flex flex-col gap-1 pt-2">
                  <span className="text-zinc-500 font-mono text-[10px] uppercase">Catatan Khusus:</span>
                  <p className="p-3 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-300 italic">
                    &ldquo;{selectedBookingForDetail.notes}&rdquo;
                  </p>
                </div>
              )}
              <div className="flex items-center justify-between gap-2 pt-3 border-t border-zinc-800">
                <span className="text-[10px] text-zinc-400 font-mono uppercase">Ubah Status Pembayaran:</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      handleUpdatePaymentStatus(selectedBookingForDetail.id, 'dp_paid');
                      setSelectedBookingForDetail({ ...selectedBookingForDetail, paymentStatus: 'dp_paid' });
                    }}
                    className="px-2.5 py-1 bg-[#0066CC] hover:bg-[#0052A3] text-white text-[10px] font-semibold uppercase rounded transition-colors"
                  >
                    Set DP Terbayar
                  </button>
                  <button
                    onClick={() => {
                      handleUpdatePaymentStatus(selectedBookingForDetail.id, 'paid_full');
                      setSelectedBookingForDetail({ ...selectedBookingForDetail, paymentStatus: 'paid_full' });
                    }}
                    className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-semibold uppercase rounded transition-colors"
                  >
                    Set Lunas
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <a
                href={`https://wa.me/${selectedBookingForDetail.whatsapp.replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs tracking-wider uppercase text-center rounded-lg flex items-center justify-center gap-2 shadow-md transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Chat Client via WA</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
