// Cloudflare Worker URL for image caching
const WORKER_URL = process.env.NEXT_PUBLIC_IMAGE_CACHE_WORKER_URL || 'https://images.belautocenter.by';

/**
 * Converts Firebase Storage URL to cached URL via Cloudflare Worker
 * @param firebaseUrl - Original Firebase Storage URL
 * @returns Cached URL via Cloudflare Worker
 */
export function getCachedImageUrl(firebaseUrl: string): string {
  // If no Firebase URL provided, return empty string
  if (!firebaseUrl) {
    return '';
  }

  // If it's already a cached URL, return as is
  if (firebaseUrl.includes(WORKER_URL)) {
    return firebaseUrl;
  }

  // If it's not a Firebase Storage URL, return as is
  if (!firebaseUrl.includes('firebasestorage.googleapis.com') &&
      !firebaseUrl.includes('firebasestorage.app')) {
    return firebaseUrl;
  }

  try {
    // Parse Firebase Storage URL and extract the path
    const url = new URL(firebaseUrl);

    // Extract path from Firebase Storage URL
    // Example: /v0/b/autobel-a6390.appspot.com/o/путь%2Fк%2Fкартинке.jpg
    const pathMatch = url.pathname.match(/\/v0\/b\/[^\/]+\/o\/(.+)/);

    if (pathMatch && pathMatch[1]) {
      // Decode the path and convert %2F back to /
      const decodedPath = decodeURIComponent(pathMatch[1]);

      // Remove any query parameters like ?alt=media
      const cleanPath = decodedPath.split('?')[0];

      // Construct new URL: https://images.belautocenter.by/images/cars/картинка.jpg
      return `${WORKER_URL}/${cleanPath}`;
    }
  } catch (error) {
    console.warn('Failed to parse Firebase URL:', firebaseUrl, error);
  }

  // Fallback to original URL if parsing fails
  return firebaseUrl;
}

/**
 * Converts array of Firebase Storage URLs to cached URLs
 * @param firebaseUrls - Array of Firebase Storage URLs
 * @returns Array of cached URLs
 */
export function getCachedImageUrls(firebaseUrls: string[]): string[] {
  return firebaseUrls.map(url => getCachedImageUrl(url));
}
