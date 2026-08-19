import { useState, useRef } from 'react';
import { Upload, Trash2, ImageIcon, Loader2 } from 'lucide-react';
import { uploadImage, removeImage, validateImageFile } from '@/services/storage';
import type { STORAGE_BUCKETS } from '@/lib/supabase';

interface ImageUploaderProps {
  bucket: keyof typeof STORAGE_BUCKETS;
  currentUrl: string | null;
  onUpload: (url: string) => void;
  onRemove?: () => void;
  label?: string;
  aspectRatio?: 'square' | 'video' | 'portrait';
}

export function ImageUploader({
  bucket, currentUrl, onUpload, onRemove, label = 'Image', aspectRatio = 'video',
}: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(currentUrl);
  const inputRef = useRef<HTMLInputElement>(null);

  const aspectClass = {
    square: 'aspect-square',
    video: 'aspect-video',
    portrait: 'aspect-[3/4]',
  }[aspectRatio];

  const handleFile = async (file: File) => {
    setError(null);
    const validationError = validateImageFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    setUploading(true);
    try {
      const result = await uploadImage(bucket, file, currentUrl ?? undefined);
      if (result.error) {
        setError(result.error);
      } else {
        setPreview(result.url);
        onUpload(result.url);
      }
    } catch {
      setError('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = async () => {
    if (currentUrl) {
      await removeImage(bucket, currentUrl);
    }
    setPreview(null);
    onRemove?.();
  };

  return (
    <div>
      {label && <label className="label-field">{label}</label>}
      <div className={`relative ${aspectClass} w-full overflow-hidden rounded-xl border border-white/10 bg-white/[0.02]`}>
        {preview ? (
          <img src={preview} alt={label} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-slate-500">
            <ImageIcon className="w-8 h-8" />
            <span className="text-xs">No image</span>
          </div>
        )}

        {uploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <Loader2 className="w-6 h-6 animate-spin text-indigo-400" />
          </div>
        )}
      </div>

      {error && <p className="mt-2 text-xs text-rose-400">{error}</p>}

      <div className="mt-3 flex items-center gap-2">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="btn-secondary !py-2 !px-3"
        >
          <Upload className="w-4 h-4" />
          <span className="text-xs">{preview ? 'Replace' : 'Upload'}</span>
        </button>
        {preview && onRemove && (
          <button type="button" onClick={handleRemove} disabled={uploading} className="btn-danger !py-2 !px-3">
            <Trash2 className="w-4 h-4" />
            <span className="text-xs">Remove</span>
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          e.target.value = '';
        }}
      />
    </div>
  );
}
