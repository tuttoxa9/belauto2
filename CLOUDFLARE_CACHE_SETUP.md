# Настройка кэширования Firestore в Cloudflare

Этот проект настроен для автоматического кэширования данных Firestore через Cloudflare Workers с автоматической инвалидацией кэша при изменениях.

## Что было реализовано

### 1. Cloudflare Worker для кэширования
- **Файл**: `cloudflare-worker/image-cache-worker.js`
- **Функции**:
  - Кэширование изображений из Firebase Storage (30 дней)
  - Кэширование данных Firestore (5 минут)
  - Автоматические заголовки Cache-Control
  - Поддержка CORS

### 2. API для инвалидации кэша
- **Файл**: `app/api/cache/invalidate/route.ts`
- **Функции**:
  - Безопасная инвалидация кэша по API ключу
  - Умная инвалидация на основе типа данных
  - Интеграция с Cloudflare API

### 3. Автоматическая инвалидация в админке
- **Обновленные компоненты**:
  - `admin-cars.tsx` - автоматически сбрасывает кэш при CRUD операциях с автомобилями
  - `admin-reviews.tsx` - для отзывов
  - `admin-stories.tsx` - для историй
  - `admin-leads.tsx` - для заявок
  - `admin-settings.tsx` - для настроек

### 4. Middleware для кэширования
- **Файл**: `middleware.ts`
- **Функции**:
  - Автоматические заголовки кэширования для разных типов контента
  - Оптимизация для статических ресурсов
  - Настройка ETags

## Инструкция по настройке

### Шаг 1: Настройка переменных окружения

Создайте `.env.local` файл на основе `.env.example`:

```bash
cp .env.example .env.local
```

Заполните переменные:

```env
# Firebase Configuration (уже настроено)
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyDSCCGXMJCbZw1SYpwXy58K9iDhpveDzIA
NEXT_PUBLIC_FIREBASE_PROJECT_ID=autobel-a6390
# ... остальные Firebase переменные

# Cloudflare Configuration
CLOUDFLARE_ZONE_ID=ваш_zone_id_из_cloudflare_dashboard
CLOUDFLARE_API_TOKEN=ваш_api_token_с_правами_на_purge_cache

# Cache Invalidation (сгенерируйте случайный ключ)
CACHE_INVALIDATION_API_KEY=ваш_секретный_ключ_для_апи
NEXT_PUBLIC_CACHE_INVALIDATION_API_KEY=тот_же_ключ

# Base URL
NEXT_PUBLIC_BASE_URL=https://ваш-домен.com
```

### Шаг 2: Настройка Cloudflare Worker

1. **Установите Wrangler CLI**:
```bash
npm install -g wrangler
```

2. **Авторизуйтесь в Cloudflare**:
```bash
wrangler auth
```

3. **Перейдите в папку worker**:
```bash
cd cloudflare-worker
```

4. **Настройте секретные переменные**:
```bash
wrangler secret put FIREBASE_API_KEY
# Введите ваш Firebase API Key

wrangler secret put CLOUDFLARE_API_TOKEN
# Введите ваш Cloudflare API Token
```

5. **Опубликуйте worker**:
```bash
wrangler deploy
```

### Шаг 3: Настройка DNS и маршрутов

1. **В Cloudflare Dashboard**:
   - Перейдите в DNS настройки вашего домена
   - Добавьте CNAME записи:
     - `images` → `ваш_worker_домен.workers.dev`
     - `api` → `ваш_worker_домен.workers.dev`

2. **Настройте Routes** (опционально):
   - В разделе Workers → Routes
   - Добавьте маршруты для production:
     - `images.вашдомен.com/*`
     - `api.вашдомен.com/firestore/*`

### Шаг 4: Получение Cloudflare Zone ID и API Token

#### Zone ID:
1. Перейдите в Cloudflare Dashboard
2. Выберите ваш домен
3. В правой боковой панели найдите "Zone ID"

#### API Token:
1. Перейдите в My Profile → API Tokens
2. Создайте новый токен с правами:
   - Zone:Cache Purge
   - Zone:Zone Read
   - для вашего домена

### Шаг 5: Тестирование

1. **Проверьте работу кэширования**:
```bash
# Проверьте заголовки кэширования
curl -I https://api.вашдомен.com/firestore/cars

# Должны увидеть заголовки:
# Cache-Control: public, max-age=300
# X-Cached-By: Cloudflare-Worker-Firestore
```

2. **Проверьте инвалидацию**:
   - Зайдите в админку
   - Измените любую машину/отзыв
   - Проверьте логи в Cloudflare Dashboard

## Как работает система

### Кэширование данных:
1. **Изображения**: Кэшируются на 30 дней в Cloudflare
2. **Данные Firestore**: Кэшируются на 5 минут в Cloudflare
3. **Страницы**: Кэшируются на 5 минут с stale-while-revalidate

### Инвалидация кэша:
1. При изменении данных в админке срабатывает `cacheInvalidator`
2. Отправляется запрос на `/api/cache/invalidate`
3. API определяет какие URL нужно очистить
4. Отправляется запрос к Cloudflare API для очистки кэша

### Типы инвалидации:
- **cars**: Очищает `/catalog`, `/catalog/[id]`, главную
- **reviews**: Очищает `/reviews`, главную
- **stories**: Очищает главную, `/about`
- **settings**: Очищает все основные страницы

## Мониторинг

### Cloudflare Analytics:
- Перейдите в Workers → Analytics
- Смотрите метрики кэширования и производительности

### Логи:
- Используйте `wrangler tail` для просмотра логов в реальном времени
- Проверяйте заголовки `X-Cache-Status` в ответах

## Оптимизация

### Для лучшей производительности:
1. Убедитесь что Cloudflare включен для вашего домена
2. Включите Brotli сжатие в Cloudflare
3. Настройте Browser Cache TTL в Cloudflare
4. Используйте HTTP/3 если поддерживается

### Настройка TTL:
- Измените `CACHE_TTL` в API routes для настройки времени кэширования
- Измените заголовки в Worker для статических ресурсов

## Troubleshooting

### Кэш не работает:
1. Проверьте DNS настройки
2. Убедитесь что Worker развернут
3. Проверьте переменные окружения

### Инвалидация не работает:
1. Проверьте CACHE_INVALIDATION_API_KEY
2. Убедитесь что CLOUDFLARE_API_TOKEN имеет нужные права
3. Проверьте логи в Network tab браузера

### Ошибки Worker:
1. Используйте `wrangler tail` для просмотра ошибок
2. Проверьте секретные переменные
3. Убедитесь что Firebase API Key корректный
