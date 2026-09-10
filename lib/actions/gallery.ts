'use server';

import { createPublicClient } from '@/lib/supabase/public';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireAdmin } from '@/lib/actions/admin';
import { deleteCloudinaryImage } from '@/lib/actions/upload';
import { MOCK_PROJECTS } from '@/lib/mock-data';
import type { Database } from '@/lib/supabase/database.types';
import type { GalleryProject, GalleryImage } from '@/lib/types';

type ProjectRow = Database['public']['Tables']['gallery_projects']['Row'];
type ImageRow = Database['public']['Tables']['gallery_images']['Row'];

function mapProject(p: ProjectRow, images?: GalleryImage[]): GalleryProject {
  return {
    id: p.id,
    title: p.title,
    slug: p.slug,
    category: p.category as GalleryProject['category'],
    categoryLabel: p.category_label ?? p.category,
    description: p.description ?? '',
    location: p.location ?? '',
    eventDate: p.event_date ?? '',
    coverImage: p.cover_image ?? '',
    isFeatured: p.is_featured,
    images: images ?? [],
  };
}

/** Ambil semua project portofolio dari Supabase (dengan fallback ke MOCK_PROJECTS) */
export async function getGalleryProjects(options?: {
  featuredOnly?: boolean;
  category?: string;
  limit?: number;
}): Promise<GalleryProject[]> {
  try {
    const supabase = createPublicClient();

    let query = (supabase as any)
      .from('gallery_projects')
      .select('*')
      .order('created_at', { ascending: false });

    if (options?.featuredOnly) {
      query = query.eq('is_featured', true);
    }
    if (options?.category && options.category !== 'all') {
      query = query.eq('category', options.category);
    }
    if (options?.limit) {
      query = query.limit(options.limit);
    }

    const { data, error } = await query;
    if (error || !data || data.length === 0) {
      let mockList = MOCK_PROJECTS;
      if (options?.featuredOnly) {
        mockList = mockList.filter((p) => p.isFeatured);
      }
      if (options?.category && options.category !== 'all') {
        mockList = mockList.filter((p) => p.category === options.category);
      }
      if (options?.limit) {
        mockList = mockList.slice(0, options.limit);
      }
      return mockList;
    }

    return (data as ProjectRow[]).map((p) => mapProject(p));
  } catch (err) {
    console.error('Error fetching gallery projects from Supabase, using mock fallback:', err);
    let mockList = MOCK_PROJECTS;
    if (options?.featuredOnly) {
      mockList = mockList.filter((p) => p.isFeatured);
    }
    if (options?.category && options.category !== 'all') {
      mockList = mockList.filter((p) => p.category === options.category);
    }
    if (options?.limit) {
      mockList = mockList.slice(0, options.limit);
    }
    return mockList;
  }
}

/** Ambil detail project beserta semua foto galeri */
export async function getGalleryProjectBySlug(
  slug: string
): Promise<GalleryProject | null> {
  try {
    const supabase = createPublicClient();

    const { data: project, error: projectError } = await (supabase as any)
      .from('gallery_projects')
      .select('*')
      .eq('slug', slug)
      .single();

    if (projectError || !project) {
      const mock = MOCK_PROJECTS.find((p) => p.slug === slug);
      return mock ?? null;
    }

    const projRow = project as ProjectRow;

    const { data: images } = await (supabase as any)
      .from('gallery_images')
      .select('*')
      .eq('project_id', projRow.id)
      .order('sort_order');

    const mappedImages: GalleryImage[] = ((images as ImageRow[]) ?? []).map((img) => ({
      id: img.id,
      projectId: img.project_id,
      imageUrl: img.image_url,
      altText: img.alt_text ?? '',
      sortOrder: img.sort_order,
      aspectRatio: (img.aspect_ratio as GalleryImage['aspectRatio']) ?? undefined,
    }));

    return mapProject(projRow, mappedImages);
  } catch (err) {
    console.error('Error fetching project by slug, using mock fallback:', err);
    const mock = MOCK_PROJECTS.find((p) => p.slug === slug);
    return mock ?? null;
  }
}

/** Ambil semua foto galeri (images) untuk project tertentu */
export async function getProjectImages(projectId: string): Promise<GalleryImage[]> {
  if (!(await requireAdmin())) return [];
  const supabase = createAdminClient();

  const { data, error } = await (supabase as any)
    .from('gallery_images')
    .select('*')
    .eq('project_id', projectId)
    .order('sort_order', { ascending: true });

  if (error || !data) return [];

  return (data as ImageRow[]).map((img) => ({
    id: img.id,
    projectId: img.project_id,
    imageUrl: img.image_url,
    altText: img.alt_text ?? '',
    sortOrder: img.sort_order,
    aspectRatio: (img.aspect_ratio as GalleryImage['aspectRatio']) ?? undefined,
  }));
}

/** Admin: buat project baru */
export async function createGalleryProject(
  data: Omit<GalleryProject, 'id' | 'images'> & { coverImage?: string }
): Promise<{ success: boolean; error?: string; id?: string }> {
  if (!(await requireAdmin())) return { success: false, error: 'Unauthorized' };
  const supabase = createAdminClient();

  const payload = {
    title: data.title,
    slug: data.slug || data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    category: data.category,
    category_label: data.categoryLabel || data.category,
    description: data.description ?? null,
    location: data.location ?? null,
    event_date: data.eventDate ?? null,
    cover_image: data.coverImage ?? null,
    is_featured: data.isFeatured ?? false,
  };

  const { data: inserted, error } = await (supabase as any)
    .from('gallery_projects')
    .insert(payload)
    .select('id')
    .single();

  if (error || !inserted) return { success: false, error: error?.message ?? 'Gagal membuat project' };

  const createdId = (inserted as { id: string }).id;

  if (data.coverImage) {
    await (supabase as any).from('gallery_images').insert({
      project_id: createdId,
      image_url: data.coverImage,
      alt_text: data.title,
      sort_order: 1,
      aspect_ratio: 'landscape',
    });
  }

  return { success: true, id: createdId };
}

/** Admin: tambah foto lembaran baru ke album project */
export async function addGalleryImage(
  projectId: string,
  imageUrl: string,
  altText?: string,
  aspectRatio: 'landscape' | 'portrait' | 'square' = 'landscape'
): Promise<{ success: boolean; error?: string }> {
  if (!(await requireAdmin())) return { success: false, error: 'Unauthorized' };
  const supabase = createAdminClient();

  const { data: existing } = await (supabase as any)
    .from('gallery_images')
    .select('sort_order')
    .eq('project_id', projectId)
    .order('sort_order', { ascending: false })
    .limit(1);

  const nextSortOrder = (existing && existing.length > 0) ? (existing[0].sort_order + 1) : 1;

  const { error } = await (supabase as any).from('gallery_images').insert({
    project_id: projectId,
    image_url: imageUrl,
    alt_text: altText ?? '',
    sort_order: nextSortOrder,
    aspect_ratio: aspectRatio,
  });

  if (error) return { success: false, error: error.message };
  return { success: true };
}

/** Admin: hapus foto lembaran dari album project */
export async function deleteGalleryImage(
  imageId: string
): Promise<{ success: boolean; error?: string }> {
  if (!(await requireAdmin())) return { success: false, error: 'Unauthorized' };
  const supabase = createAdminClient();

  // Fetch image URL before deleting from DB
  const { data: img } = await (supabase as any)
    .from('gallery_images')
    .select('image_url')
    .eq('id', imageId)
    .single();

  const { error } = await (supabase as any).from('gallery_images').delete().eq('id', imageId);
  if (error) return { success: false, error: error.message };

  // Auto-delete from Cloudinary CDN if it's a Cloudinary URL
  if (img?.image_url) {
    await deleteCloudinaryImage(img.image_url);
  }

  return { success: true };
}

/** Admin: hapus project */
export async function deleteGalleryProject(
  id: string
): Promise<{ success: boolean; error?: string }> {
  if (!(await requireAdmin())) return { success: false, error: 'Unauthorized' };
  const supabase = createAdminClient();

  // Fetch project cover and album images before deleting
  const { data: project } = await (supabase as any)
    .from('gallery_projects')
    .select('cover_image')
    .eq('id', id)
    .single();

  const { data: images } = await (supabase as any)
    .from('gallery_images')
    .select('image_url')
    .eq('project_id', id);

  await (supabase as any).from('gallery_images').delete().eq('project_id', id);
  const { error } = await (supabase as any).from('gallery_projects').delete().eq('id', id);

  if (error) return { success: false, error: error.message };

  // Auto-delete cover and album photos from Cloudinary CDN
  const urlsToDelete = new Set<string>();
  if (project?.cover_image) urlsToDelete.add(project.cover_image);
  if (images && images.length > 0) {
    images.forEach((img: { image_url: string }) => {
      if (img.image_url) urlsToDelete.add(img.image_url);
    });
  }

  for (const url of Array.from(urlsToDelete)) {
    await deleteCloudinaryImage(url);
  }

  return { success: true };
}

/** Admin: toggle featured */
export async function toggleProjectFeatured(
  id: string,
  isFeatured: boolean
): Promise<{ success: boolean; error?: string }> {
  if (!(await requireAdmin())) return { success: false, error: 'Unauthorized' };
  const supabase = createAdminClient();

  const payload = {
    is_featured: isFeatured,
    updated_at: new Date().toISOString(),
  };

  const { error } = await (supabase as any)
    .from('gallery_projects')
    .update(payload)
    .eq('id', id);

  if (error) return { success: false, error: error.message };
  return { success: true };
}
