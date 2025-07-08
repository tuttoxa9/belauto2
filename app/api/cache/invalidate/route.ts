export async function POST(request: Request) {
  try {
    const { collection: collectionName, documentId, action } = await request.json()

    const authHeader = request.headers.get('authorization')
    const apiKey = process.env.CACHE_INVALIDATION_API_KEY

    if (!authHeader || authHeader !== `Bearer ${apiKey}`) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const urlsToInvalidate: string[] = []
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://autobel.vercel.app'

    switch (collectionName) {
      case 'cars':
        urlsToInvalidate.push(`${baseUrl}/catalog`)
        urlsToInvalidate.push(`${baseUrl}/catalog/${documentId}`)
        urlsToInvalidate.push(`${baseUrl}/`)
        break

      case 'reviews':
        urlsToInvalidate.push(`${baseUrl}/reviews`)
        urlsToInvalidate.push(`${baseUrl}/`)
        break

      case 'stories':
        urlsToInvalidate.push(`${baseUrl}/`)
        urlsToInvalidate.push(`${baseUrl}/about`)
        break

      case 'settings':
      case 'pages':
        urlsToInvalidate.push(`${baseUrl}/`)
        urlsToInvalidate.push(`${baseUrl}/about`)
        urlsToInvalidate.push(`${baseUrl}/contacts`)
        urlsToInvalidate.push(`${baseUrl}/credit`)
        urlsToInvalidate.push(`${baseUrl}/leasing`)
        break

      default:
        urlsToInvalidate.push(`${baseUrl}/`)
    }

    const cloudflareZoneId = process.env.CLOUDFLARE_ZONE_ID
    const cloudflareApiToken = process.env.CLOUDFLARE_API_TOKEN

    if (cloudflareZoneId && cloudflareApiToken) {
      const response = await fetch(
        `https://api.cloudflare.com/client/v4/zones/${cloudflareZoneId}/purge_cache`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${cloudflareApiToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            files: urlsToInvalidate
          })
        }
      )

      if (!response.ok) {
        console.error('Failed to purge Cloudflare cache:', await response.text())
      }
    }

    return Response.json({
      success: true,
      message: `Cache invalidated for ${collectionName}`,
      urls: urlsToInvalidate,
      action
    })

  } catch (error) {
    console.error('Cache invalidation error:', error)
    return Response.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
