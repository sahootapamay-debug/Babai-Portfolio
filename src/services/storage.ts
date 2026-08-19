import { supabase } from '@/lib/supabase';
import { STORAGE_BUCKETS } from '@/lib/supabase';
import { logActivity } from '@/services/data';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];

export interface UploadResult {
  url: string;
  path: string;
  error: string | null;
}

export function validateImageFile(file: File): string | null {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return 'Only JPG, PNG, WebP, GIF, and SVG images are allowed.';
  }
  if (file.size > MAX_FILE_SIZE) {
    return 'Image must be smaller than 5MB.';
  }
  return null;
}

export async function uploadImage(
  bucket: keyof typeof STORAGE_BUCKETS,
  file: File,
  existingPath?: string | null,
): Promise<UploadResult> {
  const validationError = validateImageFile(file);
  if (validationError) {
    return { url: '', path: '', error: validationError };
  }

  const bucketName = STORAGE_BUCKETS[bucket];
  const ext = file.name.split('.').pop() ?? 'jpg';
  const filePath = `${bucketName}/${crypto.randomUUID()}.${ext}`;

  // Remove old image if replacing
  if (existingPath) {
    const oldName = existingPath.split(`/${bucketName}/`)[1];
    if (oldName) {
      await supabase.storage.from(bucketName).remove([oldName]).catch(() => {});
    }
  }

  const { error: uploadError } = await supabase.storage
    .from(bucketName)
    .upload(filePath, file, { cacheControl: '3600', upsert: false });

  if (uploadError) {
    return { url: '', path: '', error: uploadError.message };
  }

  const { data: pub } = supabase.storage.from(bucketName).getPublicUrl(filePath);

  return { url: pub.publicUrl, path: filePath, error: null };
}

export async function removeImage(bucket: keyof typeof STORAGE_BUCKETS, path: string): Promise<{ error: string | null }> {
  const bucketName = STORAGE_BUCKETS[bucket];
  const name = path.split(`/${bucketName}/`)[1];
  if (!name) return { error: null };
  const { error } = await supabase.storage.from(bucketName).remove([name]);
  return { error: error?.message ?? null };
}

export { logActivity };
