'use server';

import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import type { Database } from '@/lib/supabase/database.types';
import type { Service, Package } from '@/lib/types';

type ServiceRow = Database['public']['Tables']['services']['Row'];
type PackageRow = Database['public']['Tables']['packages']['Row'];

function isValidUUID(uuid?: string | null): boolean {
  if (!uuid) return false;
  const regex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return regex.test(uuid);
}

/** Ambil semua layanan aktif (public) dari Supabase */
export async function getServices(): Promise<Service[]> {
  try {
    const supabase = await createClient();

    const { data, error } = await (supabase as any)
      .from('services')
      .select('*')
      .eq('is_active', true)
      .order('name');

    if (error || !data) return [];

    return (data as ServiceRow[]).map((s) => ({
      id: s.id,
      name: s.name,
      slug: s.slug,
      description: s.description ?? '',
      isActive: s.is_active,
    }));
  } catch (err) {
    console.error('Error fetching services from Supabase:', err);
    return [];
  }
}

/** Ambil semua paket aktif (opsional: filter by service_id) dari Supabase */
export async function getPackages(serviceId?: string): Promise<Package[]> {
  try {
    const supabase = await createClient();

    let query = (supabase as any)
      .from('packages')
      .select('*, services(name, slug)')
      .eq('is_active', true)
      .order('price');

    if (serviceId && isValidUUID(serviceId)) {
      query = query.eq('service_id', serviceId);
    }

    const { data, error } = await query;
    if (error || !data) return [];

    return (data as Array<PackageRow & { services: { name: string; slug: string } | null }>).map((p) => ({
      id: p.id,
      serviceId: p.service_id,
      serviceName: p.services?.name ?? undefined,
      name: p.name,
      slug: p.slug,
      description: p.description ?? '',
      price: p.price,
      duration: p.duration ?? '',
      photographerCount: p.photographer_count ?? 1,
      editedPhotos: p.edited_photos ?? '',
      features: Array.isArray(p.features) ? (p.features as string[]) : [],
      isPopular: p.is_popular,
      isActive: p.is_active,
    }));
  } catch (err) {
    console.error('Error fetching packages from Supabase:', err);
    return [];
  }
}

/** Admin: upsert service */
export async function upsertService(
  service: Omit<Service, 'id'> & { id?: string }
): Promise<{ success: boolean; error?: string }> {
  const supabase = createAdminClient();

  const isExistingUUID = isValidUUID(service.id);

  const updatePayload = {
    name: service.name,
    slug: service.slug,
    description: service.description,
    is_active: service.isActive,
    updated_at: new Date().toISOString(),
  };

  const insertPayload = {
    name: service.name,
    slug: service.slug,
    description: service.description ?? null,
    is_active: service.isActive,
  };

  const { error } = isExistingUUID
    ? await (supabase as any).from('services').update(updatePayload).eq('id', service.id)
    : await (supabase as any).from('services').insert(insertPayload);

  if (error) return { success: false, error: error.message };
  return { success: true };
}

/** Admin: delete service */
export async function deleteService(
  id: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = createAdminClient();
  const targetId = isValidUUID(id) ? id : null;
  if (!targetId) return { success: true };

  const { error } = await (supabase as any).from('services').delete().eq('id', targetId);
  if (error) return { success: false, error: error.message };
  return { success: true };
}

/** Admin: upsert package */
export async function upsertPackage(
  pkg: Omit<Package, 'id'> & { id?: string }
): Promise<{ success: boolean; error?: string }> {
  const supabase = createAdminClient();

  let targetServiceId = isValidUUID(pkg.serviceId) ? pkg.serviceId : null;

  if (!targetServiceId && pkg.serviceId) {
    const cleanSlug = pkg.serviceId.replace(/^s-/, '');
    const { data: srv } = await (supabase as any)
      .from('services')
      .select('id')
      .or(`slug.eq.${cleanSlug},slug.eq.${pkg.serviceId}`)
      .limit(1);

    if (srv && srv.length > 0 && isValidUUID(srv[0].id)) {
      targetServiceId = srv[0].id;
    }
  }

  if (!targetServiceId) {
    const { data: firstSrv } = await (supabase as any)
      .from('services')
      .select('id')
      .limit(1);

    if (firstSrv && firstSrv.length > 0 && isValidUUID(firstSrv[0].id)) {
      targetServiceId = firstSrv[0].id;
    }
  }

  if (!targetServiceId) {
    return { success: false, error: 'Silakan buat Kategori Layanan terlebih dahulu sebelum menambahkan Paket.' };
  }

  const payload = {
    service_id: targetServiceId,
    name: pkg.name,
    slug: pkg.slug,
    description: pkg.description ?? null,
    price: pkg.price,
    duration: pkg.duration ?? null,
    photographer_count: pkg.photographerCount ?? 1,
    edited_photos: pkg.editedPhotos ?? null,
    features: pkg.features,
    is_popular: pkg.isPopular,
    is_active: pkg.isActive ?? true,
    updated_at: new Date().toISOString(),
  };

  const isExistingUUID = isValidUUID(pkg.id);

  const { error } = isExistingUUID
    ? await (supabase as any).from('packages').update(payload).eq('id', pkg.id)
    : await (supabase as any).from('packages').insert(payload);

  if (error) return { success: false, error: error.message };
  return { success: true };
}

/** Admin: delete package */
export async function deletePackage(
  id: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = createAdminClient();
  const targetId = isValidUUID(id) ? id : null;
  if (!targetId) return { success: true };

  const { error } = await (supabase as any).from('packages').delete().eq('id', targetId);
  if (error) return { success: false, error: error.message };
  return { success: true };
}
