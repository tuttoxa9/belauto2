const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs } = require('firebase/firestore');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Firebase configuration (your current config)
const firebaseConfig = {
  apiKey: "AIzaSyDSCCGXMJCbZw1SYpwXy58K9iDhpveDzIA",
  authDomain: "autobel-a6390.firebaseapp.com",
  projectId: "autobel-a6390",
  storageBucket: "autobel-a6390.firebasestorage.app",
  messagingSenderId: "376315657256",
  appId: "1:376315657256:web:459f39d55bd4cb159ac91d",
  measurementId: "G-93ZRW4X2PY"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Initialize Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Migration functions
async function migrateCars() {
  console.log('🚗 Migrating cars...');
  try {
    const carsSnapshot = await getDocs(collection(db, 'cars'));
    const cars = [];

    carsSnapshot.forEach((doc) => {
      const data = doc.data();
      cars.push({
        id: doc.id,
        make: data.make || '',
        model: data.model || '',
        year: data.year || new Date().getFullYear(),
        price: data.price || '',
        mileage: data.mileage || '',
        engine_volume: data.engineVolume || '',
        fuel_type: data.fuelType || '',
        transmission: data.transmission || '',
        drive_train: data.driveTrain || '',
        body_type: data.bodyType || '',
        color: data.color || '',
        description: data.description || '',
        image_urls: data.imageUrls || [],
        is_available: data.isAvailable !== false,
        specifications: data.specifications || {},
        features: data.features || [],
        created_at: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        updated_at: data.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString()
      });
    });

    if (cars.length > 0) {
      const { error } = await supabase
        .from('cars')
        .upsert(cars, { onConflict: 'id' });

      if (error) {
        console.error('Error migrating cars:', error);
      } else {
        console.log(`✅ Successfully migrated ${cars.length} cars`);
      }
    } else {
      console.log('No cars found to migrate');
    }
  } catch (error) {
    console.error('Error in migrateCars:', error);
  }
}

async function migrateLeads() {
  console.log('📞 Migrating leads...');
  try {
    const leadsSnapshot = await getDocs(collection(db, 'leads'));
    const leads = [];

    leadsSnapshot.forEach((doc) => {
      const data = doc.data();
      leads.push({
        id: doc.id,
        name: data.name || '',
        phone: data.phone || '',
        email: data.email || null,
        message: data.message || null,
        type: data.type || 'call',
        car_id: data.carId || null,
        status: data.status || 'new',
        created_at: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        updated_at: data.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString()
      });
    });

    if (leads.length > 0) {
      const { error } = await supabase
        .from('leads')
        .upsert(leads, { onConflict: 'id' });

      if (error) {
        console.error('Error migrating leads:', error);
      } else {
        console.log(`✅ Successfully migrated ${leads.length} leads`);
      }
    } else {
      console.log('No leads found to migrate');
    }
  } catch (error) {
    console.error('Error in migrateLeads:', error);
  }
}

async function migrateReviews() {
  console.log('⭐ Migrating reviews...');
  try {
    const reviewsSnapshot = await getDocs(collection(db, 'reviews'));
    const reviews = [];

    reviewsSnapshot.forEach((doc) => {
      const data = doc.data();
      reviews.push({
        id: doc.id,
        name: data.name || '',
        rating: data.rating || 5,
        comment: data.comment || '',
        is_approved: data.isApproved !== false,
        created_at: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        updated_at: data.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString()
      });
    });

    if (reviews.length > 0) {
      const { error } = await supabase
        .from('reviews')
        .upsert(reviews, { onConflict: 'id' });

      if (error) {
        console.error('Error migrating reviews:', error);
      } else {
        console.log(`✅ Successfully migrated ${reviews.length} reviews`);
      }
    } else {
      console.log('No reviews found to migrate');
    }
  } catch (error) {
    console.error('Error in migrateReviews:', error);
  }
}

async function migrateStories() {
  console.log('📖 Migrating stories...');
  try {
    const storiesSnapshot = await getDocs(collection(db, 'stories'));
    const stories = [];

    storiesSnapshot.forEach((doc) => {
      const data = doc.data();
      stories.push({
        id: doc.id,
        title: data.title || '',
        image_url: data.imageUrl || '',
        link: data.link || null,
        order: data.order || 0,
        is_active: data.isActive !== false,
        created_at: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        updated_at: data.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString()
      });
    });

    if (stories.length > 0) {
      const { error } = await supabase
        .from('stories')
        .upsert(stories, { onConflict: 'id' });

      if (error) {
        console.error('Error migrating stories:', error);
      } else {
        console.log(`✅ Successfully migrated ${stories.length} stories`);
      }
    } else {
      console.log('No stories found to migrate');
    }
  } catch (error) {
    console.error('Error in migrateStories:', error);
  }
}

async function migrateContactForms() {
  console.log('📧 Migrating contact forms...');
  try {
    const contactSnapshot = await getDocs(collection(db, 'contact-forms'));
    const contacts = [];

    contactSnapshot.forEach((doc) => {
      const data = doc.data();
      contacts.push({
        id: doc.id,
        name: data.name || '',
        email: data.email || '',
        phone: data.phone || '',
        message: data.message || '',
        created_at: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString()
      });
    });

    if (contacts.length > 0) {
      const { error } = await supabase
        .from('contact_forms')
        .upsert(contacts, { onConflict: 'id' });

      if (error) {
        console.error('Error migrating contact forms:', error);
      } else {
        console.log(`✅ Successfully migrated ${contacts.length} contact forms`);
      }
    } else {
      console.log('No contact forms found to migrate');
    }
  } catch (error) {
    console.error('Error in migrateContactForms:', error);
  }
}

async function migrateContentPages() {
  console.log('📄 Migrating content pages...');
  try {
    const collections = ['about', 'credit', 'leasing', 'contacts', 'privacy'];

    for (const collectionName of collections) {
      try {
        const snapshot = await getDocs(collection(db, collectionName));
        if (!snapshot.empty) {
          const content = {};
          snapshot.forEach((doc) => {
            content[doc.id] = doc.data();
          });

          const { error } = await supabase
            .from('content_pages')
            .upsert({
              page: collectionName,
              content: content,
              updated_at: new Date().toISOString()
            }, { onConflict: 'page' });

          if (error) {
            console.error(`Error migrating ${collectionName}:`, error);
          } else {
            console.log(`✅ Successfully migrated ${collectionName} content`);
          }
        }
      } catch (error) {
        console.log(`No ${collectionName} collection found or error:`, error.message);
      }
    }
  } catch (error) {
    console.error('Error in migrateContentPages:', error);
  }
}

// Main migration function
async function runMigration() {
  console.log('🚀 Starting Firebase to Supabase migration...\n');

  try {
    await migrateCars();
    await migrateLeads();
    await migrateReviews();
    await migrateStories();
    await migrateContactForms();
    await migrateContentPages();

    console.log('\n🎉 Migration completed successfully!');
    console.log('\nNext steps:');
    console.log('1. Run the SQL schema in Supabase dashboard');
    console.log('2. Update your application code to use Supabase');
    console.log('3. Test all functionality');
    console.log('4. Update Cloudflare Worker for images');

  } catch (error) {
    console.error('Migration failed:', error);
  }
}

// Run migration if called directly
if (require.main === module) {
  runMigration();
}

module.exports = {
  runMigration,
  migrateCars,
  migrateLeads,
  migrateReviews,
  migrateStories,
  migrateContactForms,
  migrateContentPages
};
