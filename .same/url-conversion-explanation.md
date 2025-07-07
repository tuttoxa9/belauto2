# URL Conversion Logic Explanation

## Проблема которую мы решаем

Ваш разработчик был прав! Нужно преобразовывать URL-ы следующим образом:

**Было:**
```
https://firebasestorage.googleapis.com/v0/b/autobel-a6390.appspot.com/o/cars%2Faudi-a4.jpg?alt=media&token=abc123
```

**Стало:**
```
https://images.belautocenter.by/cars/audi-a4.jpg
```

## Как это работает

### 1. В приложении (lib/image-cache.ts)

```javascript
function getCachedImageUrl(firebaseUrl) {
  // Парсим Firebase URL
  const url = new URL(firebaseUrl);

  // Извлекаем путь: /v0/b/autobel-a6390.appspot.com/o/cars%2Faudi-a4.jpg
  const pathMatch = url.pathname.match(/\/v0\/b\/[^\/]+\/o\/(.+)/);

  if (pathMatch && pathMatch[1]) {
    // Декодируем путь: cars%2Faudi-a4.jpg → cars/audi-a4.jpg
    const decodedPath = decodeURIComponent(pathMatch[1]);

    // Убираем параметры запроса
    const cleanPath = decodedPath.split('?')[0];

    // Возвращаем: https://images.belautocenter.by/cars/audi-a4.jpg
    return `${WORKER_URL}/${cleanPath}`;
  }
}
```

### 2. В Cloudflare Worker

Когда кто-то запрашивает `https://images.belautocenter.by/cars/audi-a4.jpg`:

```javascript
// Извлекаем путь из URL: cars/audi-a4.jpg
const filePath = url.pathname.substring(1);

// Кодируем обратно для Firebase Storage
const firebaseEncodedPath = encodeURIComponent(filePath);

// Создаём Firebase URL
const firebaseUrl = `https://firebasestorage.googleapis.com/v0/b/autobel-a6390.appspot.com/o/${firebaseEncodedPath}?alt=media`;

// Загружаем файл из Firebase и кэшируем
```

## Примеры преобразования

| Исходный Firebase URL | Результат |
|----------------------|-----------|
| `https://firebasestorage.googleapis.com/v0/b/autobel-a6390.appspot.com/o/cars%2Faudi-a4.jpg?alt=media` | `https://images.belautocenter.by/cars/audi-a4.jpg` |
| `https://firebasestorage.googleapis.com/v0/b/autobel-a6390.appspot.com/o/uploads%2Flogo.png?alt=media` | `https://images.belautocenter.by/uploads/logo.png` |
| `https://firebasestorage.googleapis.com/v0/b/autobel-a6390.appspot.com/o/путь%2Fк%2Fкартинке.jpg?alt=media` | `https://images.belautocenter.by/путь/к/картинке.jpg` |

## Преимущества

1. **Чистые URL**: Вместо длинных Firebase URL получаем короткие красивые ссылки
2. **Кэширование**: Cloudflare автоматически кэширует изображения
3. **Производительность**: Быстрая доставка контента через CDN
4. **Брендинг**: Использование собственного домена `images.belautocenter.by`

## Настройка

Для работы нужно:
1. Настроить DNS запись для `images.belautocenter.by`
2. Развернуть Cloudflare Worker
3. Установить переменную `NEXT_PUBLIC_IMAGE_CACHE_WORKER_URL=https://images.belautocenter.by`
