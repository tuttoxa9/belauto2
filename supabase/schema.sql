-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Cars table
CREATE TABLE IF NOT EXISTS cars (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  make VARCHAR(100) NOT NULL,
  model VARCHAR(100) NOT NULL,
  year INTEGER NOT NULL,
  price VARCHAR(50) NOT NULL,
  mileage VARCHAR(50),
  engine_volume VARCHAR(50),
  fuel_type VARCHAR(50),
  transmission VARCHAR(50),
  drive_train VARCHAR(50),
  body_type VARCHAR(50),
  color VARCHAR(50),
  description TEXT,
  image_urls TEXT[] DEFAULT '{}',
  is_available BOOLEAN DEFAULT true,
  specifications JSONB DEFAULT '{}',
  features TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Leads table
CREATE TABLE IF NOT EXISTS leads (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  email VARCHAR(200),
  message TEXT,
  type VARCHAR(20) NOT NULL CHECK (type IN ('call', 'credit', 'leasing', 'contact')),
  car_id UUID REFERENCES cars(id) ON DELETE SET NULL,
  status VARCHAR(20) DEFAULT 'new' CHECK (status IN ('new', 'in_progress', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT NOT NULL,
  is_approved BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Stories table
CREATE TABLE IF NOT EXISTS stories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  image_url TEXT NOT NULL,
  link TEXT,
  "order" INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Contact forms table
CREATE TABLE IF NOT EXISTS contact_forms (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  email VARCHAR(200) NOT NULL,
  phone VARCHAR(50),
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Content pages table
CREATE TABLE IF NOT EXISTS content_pages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  page VARCHAR(100) NOT NULL UNIQUE,
  content JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_cars_make_model ON cars(make, model);
CREATE INDEX IF NOT EXISTS idx_cars_year ON cars(year);
CREATE INDEX IF NOT EXISTS idx_cars_price ON cars(price);
CREATE INDEX IF NOT EXISTS idx_cars_is_available ON cars(is_available);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_type ON leads(type);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at);
CREATE INDEX IF NOT EXISTS idx_reviews_is_approved ON reviews(is_approved);
CREATE INDEX IF NOT EXISTS idx_stories_order ON stories("order");
CREATE INDEX IF NOT EXISTS idx_stories_is_active ON stories(is_active);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for updated_at
CREATE TRIGGER update_cars_updated_at BEFORE UPDATE ON cars
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON leads
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_stories_updated_at BEFORE UPDATE ON stories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_content_pages_updated_at BEFORE UPDATE ON content_pages
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE cars ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_pages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for public read access
CREATE POLICY "Public read access for cars" ON cars
  FOR SELECT USING (is_available = true);

CREATE POLICY "Public read access for approved reviews" ON reviews
  FOR SELECT USING (is_approved = true);

CREATE POLICY "Public read access for active stories" ON stories
  FOR SELECT USING (is_active = true);

CREATE POLICY "Public read access for content pages" ON content_pages
  FOR SELECT USING (true);

-- RLS Policies for authenticated users (admin)
CREATE POLICY "Authenticated users full access to cars" ON cars
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users full access to leads" ON leads
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users full access to reviews" ON reviews
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users full access to stories" ON stories
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users full access to contact forms" ON contact_forms
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users full access to content pages" ON content_pages
  FOR ALL USING (auth.role() = 'authenticated');

-- Allow public insert for leads and contact forms
CREATE POLICY "Public insert access for leads" ON leads
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Public insert access for contact forms" ON contact_forms
  FOR INSERT WITH CHECK (true);

-- Create storage bucket for images
INSERT INTO storage.buckets (id, name, public, avif_autodetection, webp_autodetection, allowed_mime_types)
VALUES (
  'images',
  'images',
  true,
  true,
  true,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/avif']
) ON CONFLICT (id) DO NOTHING;

-- Storage policy for public read access
CREATE POLICY "Public read access for images" ON storage.objects
  FOR SELECT USING (bucket_id = 'images');

-- Storage policy for authenticated upload
CREATE POLICY "Authenticated upload access for images" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'images' AND auth.role() = 'authenticated');

-- Storage policy for authenticated delete
CREATE POLICY "Authenticated delete access for images" ON storage.objects
  FOR DELETE USING (bucket_id = 'images' AND auth.role() = 'authenticated');
