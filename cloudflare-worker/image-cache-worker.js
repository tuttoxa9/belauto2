// Firebase конфигурация
const FIREBASE_PROJECT_ID = "autobel-a6390";
const FIRESTORE_BASE_URL = `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents/`;
const STORAGE_BASE_URL = `https://firebasestorage.googleapis.com/v0/b/${FIREBASE_PROJECT_ID}.appspot.com/o/`;

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // Определяем тип запроса: файлы или данные Firestore
    if (url.pathname.startsWith('/api/firestore/') || url.pathname.startsWith('/firestore/')) {
      return handleFirestoreRequest(request, env, ctx);
    } else if (url.pathname.startsWith('/api/images/') || url.pathname.startsWith('/images/')) {
      return handleImageRequest(request, env, ctx);
    } else {
      // Обрабатываем как файл изображения (обратная совместимость)
      return handleImageRequest(request, env, ctx);
    }
  },
};

// Обработчик Firestore запросов с кэшированием
async function handleFirestoreRequest(request, env, ctx) {
  const url = new URL(request.url);

  // Очищаем путь от префиксов
  let firestorePath = url.pathname.replace(/^\/api\/firestore\//, '').replace(/^\/firestore\//, '');

  if (!firestorePath) {
    return new Response('Missing Firestore path', { status: 400 });
  }

  // Создаем URL для Firestore REST API
  const firestoreUrl = `${FIRESTORE_BASE_URL}${firestorePath}`;

  // Создаем ключ для кэша
  const cacheKey = new Request(request.url);
  const cache = caches.default;

  // Проверяем кэш
  let response = await cache.match(cacheKey);

  if (!response) {
    // Запрашиваем данные из Firestore
    response = await fetch(firestoreUrl, {
      headers: {
        'Authorization': `Bearer ${env.FIREBASE_API_KEY || ''}`,
        'Content-Type': 'application/json',
        'User-Agent': 'Cloudflare-Worker-Firestore-Cache/1.0'
      }
    });

    if (!response.ok) {
      return response;
    }

    // Добавляем заголовки кэширования
    const headers = new Headers(response.headers);
    headers.set('Cache-Control', 'public, max-age=300, stale-while-revalidate=60'); // 5 минут
    headers.set('CDN-Cache-Control', 'public, max-age=300');
    headers.set('X-Cached-By', 'Cloudflare-Worker-Firestore');
    headers.set('X-Cache-Status', 'MISS');
    headers.set('Access-Control-Allow-Origin', '*');
    headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    response = new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: headers
    });

    // Сохраняем в кэш
    ctx.waitUntil(cache.put(cacheKey, response.clone()));
  } else {
    // Добавляем заголовок о попадании в кэш
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

// Обработчик изображений (существующая логика)
async function handleImageRequest(request, env, ctx) {
  const url = new URL(request.url);

  // Очищаем путь от префиксов
  let imagePath = url.pathname
    .replace(/^\/api\/images\//, '')
    .replace(/^\/images\//, '')
    .replace(/^\//, '');

  if (!imagePath) {
    return new Response('Missing file path', { status: 400 });
  }

  // Firebase Storage требует кодирование слэшей
  const encodedImagePath = imagePath.replace(/\//g, '%2F');
  const firebaseStorageUrl = `${STORAGE_BASE_URL}${encodedImagePath}?alt=media`;

  // Кэширование изображений
  const cacheKey = new Request(request.url);
  const cache = caches.default;

  let response = await cache.match(cacheKey);

  if (!response) {
    response = await fetch(firebaseStorageUrl, {
      headers: {
        'User-Agent': 'Cloudflare-Worker-Image-Cache/1.0'
      },
      cf: {
        cacheTtl: 2592000, // 30 дней
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
    headers.set('X-Cached-By', 'Cloudflare-Worker-Images');
    headers.set('X-Cache-Status', 'MISS');

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
