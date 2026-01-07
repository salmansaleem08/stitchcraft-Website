const mongoose = require('mongoose');
const SupplyReview = require('./models/SupplyReview');
require('dotenv').config();

async function fixIndexes() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const db = mongoose.connection.db;
    const collection = db.collection('supplyreviews');

    // Get current indexes
    const indexes = await collection.indexes();
    console.log('Current indexes:');
    indexes.forEach((index, i) => {
      console.log(`${i + 1}. ${JSON.stringify(index.key)} - unique: ${index.unique || false} - name: ${index.name}`);
    });

    // Drop the old index if it exists
    try {
      await collection.dropIndex('customer_1_order_1');
      console.log('Dropped old index: customer_1_order_1');
    } catch (error) {
      console.log('Old index customer_1_order_1 does not exist or already dropped:', error.message);
    }

    // Ensure the new index exists
    try {
      await collection.createIndex({ customer: 1, supply: 1 }, { unique: true });
      console.log('Created new unique index: customer_1_supply_1');
    } catch (error) {
      console.log('New index may already exist:', error.message);
    }

    // Verify final indexes
    const finalIndexes = await collection.indexes();
    console.log('\nFinal indexes:');
    finalIndexes.forEach((index, i) => {
      console.log(`${i + 1}. ${JSON.stringify(index.key)} - unique: ${index.unique || false} - name: ${index.name}`);
    });

    console.log('\nIndex fix completed successfully!');
    await mongoose.disconnect();

  } catch (error) {
    console.error('Error fixing indexes:', error);
    process.exit(1);
  }
}

fixIndexes();