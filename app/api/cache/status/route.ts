export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('authorization')
    const apiKey = process.env.CACHE_INVALIDATION_API_KEY

    if (!authHeader || authHeader !== `Bearer ${apiKey}`) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Проверяем статус Cloudflare зоны
    const cloudflareZoneId = process.env.CLOUDFLARE_ZONE_ID
    const cloudflareApiToken = process.env.CLOUDFLARE_API_TOKEN

    let cloudflareStatus = 'not_configured'
    let cacheStats = null

    if (cloudflareZoneId && cloudflareApiToken) {
      try {
        // Получаем статистику кэша
        const response = await fetch(
          `https://api.cloudflare.com/client/v4/zones/${cloudflareZoneId}/analytics/dashboard`,
          {
            headers: {
              'Authorization': `Bearer ${cloudflareApiToken}`,
              'Content-Type': 'application/json',
            }
          }
        )

        if (response.ok) {
          cloudflareStatus = 'active'
          const data = await response.json()
          cacheStats = data.result
        } else {
          cloudflareStatus = 'error'
        }
      } catch (error) {
        cloudflareStatus = 'error'
      }
    }

    return Response.json({
      status: 'active',
      cloudflare: {
        status: cloudflareStatus,
        zoneId: cloudflareZoneId ? `${cloudflareZoneId.slice(0, 8)}...` : null,
        stats: cacheStats
      },
      configuration: {
        baseUrl: process.env.NEXT_PUBLIC_BASE_URL,
        apiKeyConfigured: !!apiKey,
        firebaseProjectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
      },
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Cache status error:', error)
    return Response.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
