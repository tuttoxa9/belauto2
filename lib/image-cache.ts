// Cloudflare Worker URL for image caching
const WORKER_URL = process.env.NEXT_PUBLIC_IMAGE_CACHE_WORKER_URL || 'https://images.belautocenter.by';

/**
 * Converts Supabase Storage URL to cached URL via Cloudflare Worker
 * @param supabaseUrl - Original Supabase Storage URL
 * @returns Cached URL via Cloudflare Worker
 */
export function getCachedImageUrl(supabaseUrl: string): string {
  // If no Supabase URL provided, return empty string
  if (!supabaseUrl) {
    return '';
  }

  // If it's already a cached URL, return as is
  if (supabaseUrl.includes(WORKER_URL)) {
    return supabaseUrl;
  }

  // Handle both Supabase URLs and legacy Firebase URLs during migration
  if (supabaseUrl.includes('supabase.co/storage/v1/object/public/')) {
    // Supabase URL format: https://project.supabase.co/storage/v1/object/public/images/path/to/file.jpg
    try {
      const url = new URL(supabaseUrl);
      const pathMatch = url.pathname.match(/\/storage\/v1\/object\/public\/images\/(.+)$/);
      if (pathMatch) {
        const imagePath = pathMatch[1];
        return `${WORKER_URL}/${imagePath}`;
      }
    } catch (error) {
      console.warn('Failed to parse Supabase URL:', supabaseUrl, error);
    }
  } else if (supabaseUrl.includes('firebasestorage.googleapis.com') ||
             supabaseUrl.includes('firebasestorage.app')) {
    // Legacy Firebase URL support during migration
    try {
      const url = new URL(supabaseUrl);
      const pathMatch = url.pathname.match(/\/v0\/b\/[^\/]+\/o\/(.+)/);
      if (pathMatch && pathMatch[1]) {
        const decodedPath = decodeURIComponent(pathMatch[1]);
        const cleanPath = decodedPath.split('?')[0];
        return `${WORKER_URL}/${cleanPath}`;
      }
    } catch (error) {
      console.warn('Failed to parse Firebase URL:', supabaseUrl, error);
    }
  }

  // Fallback to original URL if parsing fails
  return supabaseUrl;
}

/**
 * Converts array of Supabase Storage URLs to cached URLs
 * @param supabaseUrls - Array of Supabase Storage URLs
 * @returns Array of cached URLs
 */
export function getCachedImageUrls(supabaseUrls: string[]): string[] {
  return supabaseUrls.map(url => getCachedImageUrl(url));
}
