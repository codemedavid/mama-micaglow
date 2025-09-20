import { supabase } from './supabase';

export type UploadResult = {
  success: boolean;
  url?: string;
  error?: string;
};

export type ImageUploadOptions = {
  file: File;
  bucket: string;
  path?: string;
  upsert?: boolean;
};

/**
 * Upload an image file to Supabase Storage
 */
export async function uploadImage({
  file,
  bucket,
  path,
  upsert = false,
}: ImageUploadOptions): Promise<UploadResult> {
  try {
    // First, ensure the bucket exists
    await ensureBucketExists(bucket);

    // Generate a unique filename if no path provided
    const fileName = path || `${Date.now()}-${Math.random().toString(36).substring(2)}-${file.name}`;

    // Upload the file
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(fileName, file, {
        upsert,
        cacheControl: '3600',
        contentType: file.type,
      });

    if (error) {
      console.error('Upload error:', error);
      return {
        success: false,
        error: `Upload failed: ${error.message}`,
      };
    }

    // Get the public URL
    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(data.path);

    return {
      success: true,
      url: urlData.publicUrl,
    };
  } catch (error) {
    console.error('Upload error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

/**
 * Ensure a storage bucket exists, create it if it doesn't
 */
async function ensureBucketExists(bucketName: string): Promise<void> {
  try {
    // Check if bucket exists
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();

    if (bucketsError) {
      console.warn(`Cannot list buckets: ${bucketsError.message}`);
      return; // Continue anyway
    }

    const bucketExists = buckets?.some(b => b.name === bucketName);
    if (bucketExists) {
      console.warn(`✅ Bucket ${bucketName} exists`);
      return; // Bucket already exists
    }

    // Try to create the bucket
    console.warn(`Creating bucket: ${bucketName}`);
    const { error: createError } = await supabase.storage.createBucket(bucketName, {
      public: true,
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
      fileSizeLimit: 5242880, // 5MB
    });

    if (createError) {
      // If we can't create the bucket due to RLS, that's okay - it might already exist
      if (createError.message.includes('already exists')) {
        console.warn(`Bucket ${bucketName} already exists`);
        return;
      }

      // For RLS errors, provide helpful message
      if (createError.message.includes('row-level security policy')) {
        console.warn(`❌ Cannot create bucket ${bucketName} due to RLS policies`);
        console.warn(`Please create the bucket manually in the Supabase dashboard:`);
        console.warn(`1. Go to Storage in your Supabase dashboard`);
        console.warn(`2. Create a bucket named "${bucketName}"`);
        console.warn(`3. Set it as public`);
        console.warn(`4. Set allowed MIME types to: image/jpeg, image/png, image/webp, image/gif`);
        console.warn(`5. Set file size limit to 5MB`);
        return;
      }

      // For other errors, we'll try to continue anyway
      console.warn(`Could not create bucket ${bucketName}:`, createError.message);
      console.warn('Continuing with upload attempt...');
    } else {
      console.warn(`✅ Successfully created bucket: ${bucketName}`);
    }
  } catch (error) {
    console.warn(`Error ensuring bucket exists:`, error);
    // Continue anyway - the bucket might exist or the upload might still work
  }
}
/**
 * Delete an image from Supabase Storage
 */
export async function deleteImage(bucket: string, path: string): Promise<UploadResult> {
  try {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([path]);

    if (error) {
      console.error('Delete error:', error);
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: true,
    };
  } catch (error) {
    console.error('Delete error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

/**
 * Get a public URL for an image in Supabase Storage
 */
export function getImageUrl(bucket: string, path: string): string {
  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(path);

  return data.publicUrl;
}

/**
 * List images in a bucket
 */
export async function listImages(bucket: string, path?: string) {
  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .list(path, {
        limit: 100,
        offset: 0,
      });

    if (error) {
      console.error('List error:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    console.error('List error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

/**
 * Create a bucket if it doesn't exist
 */
export async function createBucket(bucket: string, isPublic: boolean = true) {
  try {
    const { data, error } = await supabase.storage.createBucket(bucket, {
      public: isPublic,
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
      fileSizeLimit: 5242880, // 5MB
    });

    if (error) {
      console.error('Create bucket error:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Create bucket error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

/**
 * Check if a bucket exists
 */
export async function bucketExists(bucket: string): Promise<boolean> {
  try {
    const { data, error } = await supabase.storage.getBucket(bucket);
    return !error && data !== null;
  } catch {
    return false;
  }
}

/**
 * Initialize storage buckets for the application
 */
export async function initializeStorage() {
  const buckets = [
    { name: 'product-images', public: true },
    { name: 'user-uploads', public: true },
    { name: 'batch-images', public: true },
  ];

  const results = [];

  for (const bucket of buckets) {
    const exists = await bucketExists(bucket.name);
    if (!exists) {
      const result = await createBucket(bucket.name, bucket.public);
      results.push({ bucket: bucket.name, ...result });
    } else {
      results.push({ bucket: bucket.name, success: true, message: 'Bucket already exists' });
    }
  }

  return results;
}
