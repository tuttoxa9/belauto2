import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge'

const CACHE_TTL = 300 // 5 минут

export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  const collection = url.searchParams.get('collection')
  const documentId = url.searchParams.get('document')

  if (!collection) {
    return NextResponse.json({ error: 'Collection parameter required' }, { status: 400 })
  }

  // Строим путь к Firestore
  const baseUrl = `https://firestore.googleapis.com/v1/projects/${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}/databases/(default)/documents`
  let firestoreUrl = `${baseUrl}/${collection}`

  if (documentId) {
    firestoreUrl += `/${documentId}`
  }

  try {
    // Проверяем заголовки кэша
    const ifNoneMatch = request.headers.get('if-none-match')

    const response = await fetch(firestoreUrl, {
      headers: {
        'Authorization': `Bearer ${process.env.FIREBASE_API_KEY || ''}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch from Firestore' }, { status: response.status })
    }

    const data = await response.json()

    // Генерируем ETag на основе данных
    const etag = `"${Buffer.from(JSON.stringify(data)).toString('base64').slice(0, 16)}"`

    // Если ETag совпадает, возвращаем 304 Not Modified
    if (ifNoneMatch === etag) {
      return new NextResponse(null, { status: 304 })
    }

    // Возвращаем данные с заголовками кэширования
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': `public, max-age=${CACHE_TTL}, stale-while-revalidate=60`,
        'ETag': etag,
        'Vary': 'Accept-Encoding',
        'X-Cache-TTL': CACHE_TTL.toString(),
      },
    })

  } catch (error) {
    console.error('Firestore cache error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
