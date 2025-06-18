// Script to empty all models from the database
require('dotenv').config(); 
const { PrismaClient } = require('@dev-sam17/prisma-client-for-samflix');
const prisma = new PrismaClient();

async function clearDatabase() {
  try {
    console.log('Starting database cleanup...');
    
    // Delete records with relationships first to avoid foreign key constraints
    // Episodes have a relationship with TvSeries
    console.log('Deleting all Episodes...');
    await prisma.episode.deleteMany({});
    console.log('✅ Episodes deleted');
    
    // Now we can delete the rest of the models
    console.log('Deleting all TvSeries...');
    await prisma.tvSeries.deleteMany({});
    console.log('✅ TvSeries deleted');
    
    console.log('Deleting all Movies...');
    await prisma.movie.deleteMany({});
    console.log('✅ Movies deleted');
    
    console.log('Deleting all MediaFolders...');
    await prisma.mediaFolder.deleteMany({});
    console.log('✅ MediaFolders deleted');
    
    console.log('Deleting all ScanningConflicts...');
    await prisma.scanningConflict.deleteMany({});
    console.log('✅ ScanningConflicts deleted');
    
    console.log('Database cleanup completed successfully!');
  } catch (error) {
    console.error('Error during database cleanup:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Execute the function
clearDatabase()
  .then(() => console.log('Script execution completed.'))
  .catch((e) => {
    console.error('Script execution failed:', e);
    process.exit(1);
  });
