require('dotenv').config();
const mongoose = require('mongoose');

// Your local MongoDB connection
const LOCAL_URI = 'mongodb://localhost:27017/attendance_system';

// Your Atlas connection (from .env)
const ATLAS_URI = process.env.MONGODB_URI;

async function migrateData() {
  try {
    console.log('Connecting to local MongoDB...');
    const localConn = await mongoose.createConnection(LOCAL_URI).asPromise();
    
    console.log('Connecting to MongoDB Atlas...');
    const atlasConn = await mongoose.createConnection(ATLAS_URI).asPromise();
    
    // Get all collections from local DB
    const collections = await localConn.db.listCollections().toArray();
    
    console.log(`Found ${collections.length} collections to migrate`);
    
    for (const collectionInfo of collections) {
      const collectionName = collectionInfo.name;
      console.log(`\nMigrating collection: ${collectionName}`);
      
      // Get data from local
      const localCollection = localConn.db.collection(collectionName);
      const documents = await localCollection.find({}).toArray();
      
      console.log(`  Found ${documents.length} documents`);
      
      if (documents.length > 0) {
        // Insert into Atlas
        const atlasCollection = atlasConn.db.collection(collectionName);
        
        // Clear existing data in Atlas (optional - comment out if you want to keep existing data)
        await atlasCollection.deleteMany({});
        
        await atlasCollection.insertMany(documents);
        console.log(`  ✓ Migrated ${documents.length} documents`);
      }
    }
    
    console.log('\n✓ Migration completed successfully!');
    
    await localConn.close();
    await atlasConn.close();
    process.exit(0);
    
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

migrateData();
