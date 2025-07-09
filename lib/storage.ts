import { supabase } from "@/lib/supabase"

export const uploadImage = async (file: File, path: string): Promise<string> => {
  try {
    const fileName = `${Date.now()}_${file.name}`
    const filePath = `${path}/${fileName}`

    const { data, error } = await supabase.storage
      .from('images')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (error) throw error

    const { data: { publicUrl } } = supabase.storage
      .from('images')
      .getPublicUrl(data.path)

    return publicUrl
  } catch (error) {
    console.error("Ошибка загрузки изображения:", error)
    throw error
  }
}

export const deleteImage = async (url: string): Promise<void> => {
  try {
    // Extract file path from Supabase URL
    const urlParts = url.split('/storage/v1/object/public/images/')
    if (urlParts.length < 2) {
      throw new Error('Invalid Supabase storage URL')
    }

    const filePath = urlParts[1]

    const { error } = await supabase.storage
      .from('images')
      .remove([filePath])

    if (error) throw error
  } catch (error) {
    console.error("Ошибка удаления изображения:", error)
    throw error
  }
}

// Helper function to get cached image URL
export const getCachedImageUrl = (supabaseUrl: string): string => {
  if (!supabaseUrl) return ''

  // If already a cached URL, return as is
  const workerUrl = process.env.NEXT_PUBLIC_CLOUDFLARE_WORKER_URL || 'https://autobel-images.autobel.workers.dev'
  if (supabaseUrl.includes(workerUrl)) {
    return supabaseUrl
  }

  // Extract path from Supabase URL and create cached URL
  try {
    const urlParts = supabaseUrl.split('/storage/v1/object/public/images/')
    if (urlParts.length >= 2) {
      return `${workerUrl}/${urlParts[1]}`
    }
  } catch (error) {
    console.warn('Failed to create cached URL:', error)
  }

  return supabaseUrl
}
