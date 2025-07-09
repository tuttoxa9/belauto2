import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Admin client with service role key (server-side only)
export const supabaseAdmin = createClient(
  supabaseUrl,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

// Database types
export interface Car {
  id: string
  make: string
  model: string
  year: number
  price: string
  mileage: string
  engine_volume: string
  fuel_type: string
  transmission: string
  drive_train: string
  body_type: string
  color: string
  description: string
  image_urls: string[]
  is_available: boolean
  specifications: Record<string, string>
  features: string[]
  created_at: string
  updated_at: string
}

export interface Lead {
  id: string
  name: string
  phone: string
  email?: string
  message?: string
  type: 'call' | 'credit' | 'leasing' | 'contact'
  car_id?: string
  status: 'new' | 'in_progress' | 'completed' | 'cancelled'
  created_at: string
  updated_at: string
}

export interface Review {
  id: string
  name: string
  rating: number
  comment: string
  is_approved: boolean
  created_at: string
  updated_at: string
}

export interface Story {
  id: string
  title: string
  image_url: string
  link?: string
  order: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface ContactForm {
  id: string
  name: string
  email: string
  phone: string
  message: string
  created_at: string
}

export interface ContentPage {
  id: string
  page: string
  content: Record<string, any>
  updated_at: string
}
