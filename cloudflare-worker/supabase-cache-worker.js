// Supabase configuration
const SUPABASE_PROJECT_ID = "tpicyvtfaqmyiswocqkh";
const SUPABASE_URL = `https://${SUPABASE_PROJECT_ID}.supabase.co`;
const STORAGE_BASE_URL = `${SUPABASE_URL}/storage/v1/object/public/images/`;
const REST_API_BASE_URL = `${SUPABASE_URL}/rest/v1/`;

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // Handle CORS preflight requests
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization, apikey',
          'Access-Control-Max-Age': '86400',
        },
      });
    }

    // Determine request type: API or images
    if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/rest/')) {
      return handleApiRequest(request, env, ctx);
    } else {
      // Handle as image request
      return handleImageRequest(request, env, ctx);
    }
  },
};

// Handle Supabase REST API requests with caching
async function handleApiRequest(request, env, ctx) {
  const url = new URL(request.url);

  // Clean path from prefixes
  let apiPath = url.pathname.replace(/^\/api\//, '').replace(/^\/rest\//, '');

  if (!apiPath) {
    return new Response('Missing API path', { status: 400 });
  }

  // Construct Supabase REST API URL
  const supabaseApiUrl = `${REST_API_BASE_URL}${apiPath}${url.search}`;

  // Create cache key
  const cacheKey = new Request(request.url);
  const cache = caches.default;

  // Check cache for GET requests only
  let response;
  if (request.method === 'GET') {
    response = await cache.match(cacheKey);
  }

  if (!response) {
    // Forward headers from original request
    const headers = new Headers();

    // Copy important headers
    ['authorization', 'apikey', 'content-type'].forEach(header => {
      const value = request.headers.get(header);
      if (value) {
        headers.set(header, value);
      }
    });

    // Add default apikey if not present
    if (!headers.has('apikey') && env.SUPABASE_ANON_KEY) {
      headers.set('apikey', env.SUPABASE_ANON_KEY);
    }

    // Make request to Supabase
    response = await fetch(supabaseApiUrl, {
      method: request.method,
      headers: headers,
      body: request.method !== 'GET' ? await request.clone().arrayBuffer() : undefined,
    });

    if (!response.ok) {
      return response;
    }

    // Add caching headers for successful GET requests
    if (request.method === 'GET') {
      const responseHeaders = new Headers(response.headers);
      responseHeaders.set('Cache-Control', 'public, max-age=300, stale-while-revalidate=60'); // 5 minutes
      responseHeaders.set('CDN-Cache-Control', 'public, max-age=300');
      responseHeaders.set('X-Cached-By', 'Cloudflare-Worker-Supabase');
      responseHeaders.set('X-Cache-Status', 'MISS');
      responseHeaders.set('Access-Control-Allow-Origin', '*');
      responseHeaders.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      responseHeaders.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, apikey');

      response = new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: responseHeaders
      });

      // Cache successful GET responses
      ctx.waitUntil(cache.put(cacheKey, response.clone()));
    } else {
      // For non-GET requests, just add CORS headers
      const responseHeaders = new Headers(response.headers);
      responseHeaders.set('Access-Control-Allow-Origin', '*');
      responseHeaders.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      responseHeaders.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, apikey');

      response = new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: responseHeaders
      });
    }
  } else {
    // Add cache hit header
    const responseHeaders = new Headers(response.headers);
    responseHeaders.set('X-Cache-Status', 'HIT');

    response = new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders
    });
  }

  return response;
}

// Handle Supabase Storage images (existing logic adapted)
async function handleImageRequest(request, env, ctx) {
  const url = new URL(request.url);

  // Clean path from prefixes
  let imagePath = url.pathname
    .replace(/^\/api\/images\//, '')
    .replace(/^\/images\//, '')
    .replace(/^\//, '');

  if (!imagePath) {
    return new Response('Missing file path', { status: 400 });
  }

  // Construct Supabase Storage URL
  const supabaseStorageUrl = `${STORAGE_BASE_URL}${imagePath}`;

  // Caching for images
  const cacheKey = new Request(request.url);
  const cache = caches.default;

  let response = await cache.match(cacheKey);

  if (!response) {
    response = await fetch(supabaseStorageUrl, {
      headers: {
        'User-Agent': 'Cloudflare-Worker-Supabase-Images/1.0'
      },
      cf: {
        cacheTtl: 2592000, // 30 days
        cacheEverything: true
      }
    });

    if (!response.ok) {
      return response;
    }

    const headers = new Headers(response.headers);
    headers.set('Cache-Control', 'public, max-age=2592000, immutable');
    headers.set('CDN-Cache-Control', 'public, max-age=86400');
    headers.set('Cloudflare-CDN-Cache-Control', 'public, max-age=2592000');
    headers.set('X-Cached-By', 'Cloudflare-Worker-Supabase-Images');
    headers.set('X-Cache-Status', 'MISS');
    headers.set('Access-Control-Allow-Origin', '*');

    response = new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: headers
    });

    ctx.waitUntil(cache.put(cacheKey, response.clone()));
  } else {
    const headers = new Headers(response.headers);
    headers.set('X-Cache-Status', 'HIT');

    response = new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: headers
    });
  }

  return response;
}
