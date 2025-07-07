// Имя вашего проекта в Firebase (из firebaseConfig)
const FIREBASE_PROJECT_ID = "autobel-a6390";

// Базовый URL для Firebase Storage
const STORAGE_BASE_URL = `https://firebasestorage.googleapis.com/v0/b/${FIREBASE_PROJECT_ID}.appspot.com/o/`;

export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);

  // Получаем путь к файлу из URL (например, /cars/image1.jpg)
  // url.pathname.substring(1) убирает первый слэш
  let imagePath = url.pathname.substring(1);

  if (!imagePath) {
    return new Response('Missing file path', { status: 400 });
  }

  // Firebase Storage требует, чтобы слэши в пути были закодированы как %2F
  const encodedImagePath = imagePath.replace(/\//g, '%2F');

  // Собираем полный URL для запроса к Firebase Storage
  // ?alt=media в конце обязательно, чтобы получить сам файл, а не его метаданные
  const firebaseStorageUrl = `${STORAGE_BASE_URL}${encodedImagePath}?alt=media`;

  // === КЭШИРОВАНИЕ ===
  // Создаем ключ для кэша на основе исходного URL запроса
  const cacheKey = new Request(request.url);
  const cache = caches.default;

  // Сначала проверяем кэш
  let response = await cache.match(cacheKey);

  if (!response) {
    // Если в кэше нет, запрашиваем из Firebase
    response = await fetch(firebaseStorageUrl, {
      headers: {
        'User-Agent': 'Cloudflare-Worker-Image-Cache/1.0'
      }
    });

    // Если Firebase вернул ошибку, просто передаем ее дальше
    if (!response.ok) {
      return response;
    }

    // Клонируем ответ для кэширования
    const responseClone = response.clone();

    // Создаем новый ответ с правильными заголовками кэширования
    const headers = new Headers(response.headers);

    // === САМАЯ ВАЖНАЯ ЧАСТЬ: УПРАВЛЕНИЕ КЭШИРОВАНИЕМ ===
    // Говорим Cloudflare кэшировать на 30 дней
    headers.set('Cache-Control', 'public, max-age=2592000');
    // Говорим браузеру кэшировать на 1 день
    headers.set('CDN-Cache-Control', 'public, max-age=86400');
    // Дополнительно для Cloudflare
    headers.set('Cloudflare-CDN-Cache-Control', 'public, max-age=2592000');
    // Помечаем, что кэшировано нашим worker
    headers.set('X-Cached-By', 'Cloudflare-Worker');
    headers.set('X-Cache-Status', 'MISS');

    // Создаем финальный ответ
    response = new Response(responseClone.body, {
      status: response.status,
      statusText: response.statusText,
      headers: headers
    });

    // Сохраняем в кэш асинхронно (не блокируем ответ)
    context.waitUntil(cache.put(cacheKey, response.clone()));
  } else {
    // Если нашли в кэше, добавляем соответствующий заголовок
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
