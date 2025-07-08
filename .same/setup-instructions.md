# Настройка Autobel1 с Cloudflare и Vercel

## 🎯 Архитектура решения

```
autobelcenter.by (Cloudflare DNS) → autobel1.vercel.app (Next.js)
images.autobelcenter.by (Cloudflare Worker) → Firebase Storage (кэшированные изображения)
```

## 1. 🌐 Настройка DNS на Cloudflare

### Предварительные требования:
- Домен autobelcenter.by должен быть добавлен в Cloudflare
- Nameservers домена должны указывать на Cloudflare

### DNS записи:
1. **Основной сайт:**
   ```
   Тип: CNAME
   Имя: @
   Содержимое: autobel1.vercel.app
   Proxy status: Proxied (оранжевое облако)
   ```

2. **Поддомен для изображений:**
   ```
   Тип: AAAA
   Имя: images
   Содержимое: 100::
   Proxy status: Proxied (оранжевое облако)
   ```

## 2. ⚡ Деплой Cloudflare Worker

### Установка Wrangler CLI:
```bash
npm install -g wrangler
```

### Авторизация:
```bash
wrangler auth
```

### Деплой воркера:
```bash
cd cloudflare-worker
wrangler deploy --env production
```

## 3. 🔧 Настройка переменных окружения

### Vercel (для Next.js проекта):
```bash
NEXT_PUBLIC_IMAGE_CACHE_WORKER_URL=https://images.autobelcenter.by
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyDSCCGXMJCbZw1SYpwXy58K9iDhpveDzIA
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=autobel-a6390.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=autobel-a6390
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=autobel-a6390.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=376315657256
NEXT_PUBLIC_FIREBASE_APP_ID=1:376315657256:web:459f39d55bd4cb159ac91d
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-93ZRW4X2PY
```

## 4. ✅ Проверка работоспособности

### 1. Основной сайт:
- Откройте https://autobelcenter.by
- Убедитесь, что сайт загружается с Vercel

### 2. Кэширование изображений:
- Откройте Developer Tools → Network
- Перезагрузите страницу
- Найдите запросы к images.autobelcenter.by
- Проверьте заголовки ответа:
  - `X-Cached-By: Cloudflare-Worker`
  - `X-Cache-Status: HIT` (при повторных запросах)

## 5. 🚀 Workflow разработки

### Изменения в коде:
1. Внесите изменения в локальную копию
2. Сделайте commit и push в GitHub
3. Vercel автоматически задеплоит изменения

### Изменения в воркере:
1. Отредактируйте `cloudflare-worker/image-cache-worker.js`
2. Выполните `wrangler deploy --env production`

## 6. 🔧 Оптимизация производительности

### Cloudflare настройки:
- **Caching Level:** Standard
- **Browser Cache TTL:** 1 year
- **Edge Cache TTL:** 1 month
- **Always Online:** On
- **Brotli Compression:** On

### Page Rules для основного домена:
```
autobelcenter.by/*
- Cache Level: Cache Everything
- Edge Cache TTL: 1 day
- Browser Cache TTL: 4 hours
```

## 7. 📊 Мониторинг

### Cloudflare Analytics:
- Worker Metrics для отслеживания использования кэша изображений
- Web Analytics для основного сайта

### Vercel Analytics:
- Performance metrics для Next.js приложения
- Function invocation logs

## 8. 🔒 Безопасность

### Content Security Policy (опционально):
```
img-src 'self' images.autobelcenter.by firebasestorage.googleapis.com firebasestorage.app;
```

### Rate Limiting в Worker (опционально):
Можно добавить rate limiting в worker для защиты от злоупотреблений.

## Преимущества этого решения:

✅ **Скорость:** Изображения кэшируются на Edge серверах Cloudflare
✅ **Экономия:** Снижение расходов на Firebase Storage
✅ **Удобство:** Vercel продолжает автоматически деплоить изменения
✅ **Надежность:** Cloudflare обеспечивает высокую доступность
✅ **Оптимизация:** Автоматическое сжатие и оптимизация изображений
