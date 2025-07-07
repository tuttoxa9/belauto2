# Autobel Image Cache Worker

Cloudflare Worker для кэширования изображений из Firebase Storage.

## Развертывание

1. Установите Wrangler CLI:
```bash
npm install -g wrangler
```

2. Авторизуйтесь в Cloudflare:
```bash
wrangler auth
```

3. Разверните воркер:
```bash
wrangler deploy
```

## Использование

Worker принимает URL Firebase Storage в параметре `url`:

```
https://autobel-image-cache.your-subdomain.workers.dev?url=https://firebasestorage.googleapis.com/v0/b/your-bucket/o/image.jpg%3Falt%3Dmedia
```

## Кэширование

- Все изображения кэшируются на 1 год (31536000 секунд)
- Используется Cloudflare Edge Cache для максимальной производительности
- Заголовки кэша устанавливаются автоматически

## Настройка домена

Для использования собственного домена (например, `images.autobel.by`):

1. Добавьте домен в Cloudflare DNS
2. Обновите `wrangler.toml` с правильными routes
3. Переразверните воркер

## Мониторинг

Worker добавляет заголовки:
- `X-Cached-By: Cloudflare-Worker` - для всех ответов
- `X-Cache-Status: HIT` - для кэшированных ответов
