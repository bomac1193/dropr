/**
 * Audio Storage Service
 *
 * Handles uploading audio files to Supabase Storage.
 * Used by the audio generator to persist generated remixes.
 */

import { createAdminClient } from '../supabase/server';

const AUDIO_BUCKET = 'audio';

export interface AudioUploadResult {
  url: string;
  path: string;
  size: number;
}

/**
 * Ensure the audio bucket exists
 */
export async function ensureAudioBucket(): Promise<void> {
  const supabase = createAdminClient();

  const { data: buckets } = await supabase.storage.listBuckets();
  const exists = buckets?.some((b) => b.name === AUDIO_BUCKET);

  if (!exists) {
    const { error } = await supabase.storage.createBucket(AUDIO_BUCKET, {
      public: true,
      fileSizeLimit: 50 * 1024 * 1024, // 50MB max
      allowedMimeTypes: ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/mp3'],
    });

    if (error && !error.message.includes('already exists')) {
      console.error('Failed to create audio bucket:', error);
      throw error;
    }
  }
}

/**
 * Upload audio blob to Supabase Storage
 */
export async function uploadAudio(
  blob: Blob,
  filename: string,
  folder = 'remixes'
): Promise<AudioUploadResult> {
  const supabase = createAdminClient();

  // Ensure bucket exists
  await ensureAudioBucket();

  const path = `${folder}/${filename}`;

  // Convert blob to buffer for upload
  const arrayBuffer = await blob.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const { data, error } = await supabase.storage
    .from(AUDIO_BUCKET)
    .upload(path, buffer, {
      contentType: blob.type || 'audio/mpeg',
      upsert: true,
    });

  if (error) {
    console.error('Audio upload failed:', error);
    throw new Error(`Failed to upload audio: ${error.message}`);
  }

  // Get public URL
  const { data: urlData } = supabase.storage
    .from(AUDIO_BUCKET)
    .getPublicUrl(data.path);

  return {
    url: urlData.publicUrl,
    path: data.path,
    size: buffer.length,
  };
}

/**
 * Upload audio from URL (fetch and re-upload)
 */
export async function uploadAudioFromUrl(
  sourceUrl: string,
  filename: string,
  folder = 'remixes'
): Promise<AudioUploadResult> {
  const response = await fetch(sourceUrl);

  if (!response.ok) {
    throw new Error(`Failed to fetch audio from ${sourceUrl}: ${response.statusText}`);
  }

  const blob = await response.blob();
  return uploadAudio(blob, filename, folder);
}

/**
 * Delete audio file from storage
 */
export async function deleteAudio(path: string): Promise<void> {
  const supabase = createAdminClient();

  const { error } = await supabase.storage
    .from(AUDIO_BUCKET)
    .remove([path]);

  if (error) {
    console.error('Audio deletion failed:', error);
    throw new Error(`Failed to delete audio: ${error.message}`);
  }
}

/**
 * List audio files in a folder
 */
export async function listAudioFiles(
  folder = 'remixes',
  limit = 100
): Promise<{ name: string; path: string; size: number }[]> {
  const supabase = createAdminClient();

  const { data, error } = await supabase.storage
    .from(AUDIO_BUCKET)
    .list(folder, { limit });

  if (error) {
    console.error('Failed to list audio files:', error);
    throw new Error(`Failed to list audio files: ${error.message}`);
  }

  return (data ?? []).map((file) => ({
    name: file.name,
    path: `${folder}/${file.name}`,
    size: file.metadata?.size ?? 0,
  }));
}

/**
 * Generate a unique filename for a remix
 */
export function generateRemixFilename(
  soundName: string,
  genre: string,
  provider: string
): string {
  const timestamp = Date.now();
  const sanitized = soundName
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 30);

  return `${sanitized}_${genre.toLowerCase()}_${provider}_${timestamp}.mp3`;
}
