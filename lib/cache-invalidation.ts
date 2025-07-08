export interface CacheInvalidationParams {
  collection: string
  documentId?: string
  action: 'create' | 'update' | 'delete'
}

export async function invalidateCache(params: CacheInvalidationParams): Promise<void> {
  try {
    const apiKey = process.env.CACHE_INVALIDATION_API_KEY || process.env.NEXT_PUBLIC_CACHE_INVALIDATION_API_KEY

    if (!apiKey) {
      console.warn('Cache invalidation API key not configured')
      return
    }

    const baseUrl = typeof window !== 'undefined'
      ? window.location.origin
      : process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'

    const response = await fetch(`${baseUrl}/api/cache/invalidate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(params)
    })

    if (!response.ok) {
      console.error('Failed to invalidate cache:', await response.text())
    } else {
      console.log(`Cache invalidated for ${params.collection} (${params.action})`)
    }
  } catch (error) {
    console.error('Cache invalidation error:', error)
  }
}

export function createCacheInvalidator(collection: string) {
  return {
    onCreate: (documentId?: string) => invalidateCache({
      collection,
      documentId,
      action: 'create'
    }),
    onUpdate: (documentId?: string) => invalidateCache({
      collection,
      documentId,
      action: 'update'
    }),
    onDelete: (documentId?: string) => invalidateCache({
      collection,
      documentId,
      action: 'delete'
    })
  }
}
