const { MongoClient, ObjectId } = require('mongodb');

let client = null;
let db = null;

// Database name
const DB_NAME = 'pizza-time';

/**
 * Connect to MongoDB
 */
async function connect() {
  if (client && db) {
    return db;
  }

  const connectionString = process.env.MONGODB_URI || process.env.MONGODB_CONNECTION_STRING;
  
  if (!connectionString) {
    throw new Error('MONGODB_URI or MONGODB_CONNECTION_STRING environment variable is required');
  }

  try {
    client = new MongoClient(connectionString);
    await client.connect();
    db = client.db(DB_NAME);
    console.log('✅ Connected to MongoDB');
    return db;
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    throw error;
  }
}

/**
 * Get collection
 */
async function getCollection(collectionName) {
  const database = await connect();
  return database.collection(collectionName);
}

/**
 * Convert MongoDB _id to string id for compatibility
 */
function normalizeDoc(doc) {
  if (!doc) return null;
  if (doc._id && !doc.id) {
    doc.id = doc._id.toString();
  }
  return doc;
}

/**
 * Normalize array of documents
 */
function normalizeDocs(docs) {
  return docs.map(doc => normalizeDoc(doc));
}

/**
 * Convert query _id/id to ObjectId if needed
 */
function normalizeQuery(query) {
  const normalized = { ...query };
  if (normalized._id && typeof normalized._id === 'string') {
    normalized._id = new ObjectId(normalized._id);
  } else if (normalized.id && !normalized._id) {
    normalized._id = new ObjectId(normalized.id);
    delete normalized.id;
  }
  return normalized;
}

// Database operations (maintaining same interface as data-storage.js)
const dbOperations = {
  // Find all documents matching query
  async find(collection, query = {}) {
    try {
      const coll = await getCollection(collection);
      const normalizedQuery = normalizeQuery(query);
      const docs = await coll.find(normalizedQuery).toArray();
      return normalizeDocs(docs);
    } catch (error) {
      console.error(`Error finding documents in ${collection}:`, error);
      return [];
    }
  },

  // Find one document
  async findOne(collection, query) {
    try {
      const coll = await getCollection(collection);
      const normalizedQuery = normalizeQuery(query);
      const doc = await coll.findOne(normalizedQuery);
      return normalizeDoc(doc);
    } catch (error) {
      console.error(`Error finding one document in ${collection}:`, error);
      return null;
    }
  },

  // Find by ID
  async findById(collection, id) {
    try {
      const coll = await getCollection(collection);
      let objectId;
      try {
        objectId = new ObjectId(id);
      } catch {
        // If id is not a valid ObjectId, try to find by string id field
        return await this.findOne(collection, { id: id });
      }
      const doc = await coll.findOne({ _id: objectId });
      return normalizeDoc(doc);
    } catch (error) {
      console.error(`Error finding document by ID in ${collection}:`, error);
      return null;
    }
  },

  // Insert new document
  async insert(collection, item) {
    try {
      const coll = await getCollection(collection);
      // Remove id if present (MongoDB will generate _id)
      const { id, ...itemWithoutId } = item;
      
      // Set createdAt if not present
      if (!item.createdAt) {
        itemWithoutId.createdAt = new Date();
      }
      
      const result = await coll.insertOne(itemWithoutId);
      const insertedDoc = await coll.findOne({ _id: result.insertedId });
      return normalizeDoc(insertedDoc);
    } catch (error) {
      console.error(`Error inserting document in ${collection}:`, error);
      throw error;
    }
  },

  // Update document
  async update(collection, query, updates) {
    try {
      const coll = await getCollection(collection);
      const normalizedQuery = normalizeQuery(query);
      const result = await coll.updateOne(normalizedQuery, { $set: updates });
      
      if (result.matchedCount === 0) {
        return null;
      }
      
      const updatedDoc = await coll.findOne(normalizedQuery);
      return normalizeDoc(updatedDoc);
    } catch (error) {
      console.error(`Error updating document in ${collection}:`, error);
      return null;
    }
  },

  // Find one and update
  async findOneAndUpdate(collection, query, updates, options = {}) {
    try {
      const coll = await getCollection(collection);
      const normalizedQuery = normalizeQuery(query);
      const result = await coll.findOneAndUpdate(
        normalizedQuery,
        { $set: updates },
        { returnDocument: 'after', ...options }
      );
      return normalizeDoc(result.value || result);
    } catch (error) {
      console.error(`Error finding and updating document in ${collection}:`, error);
      return null;
    }
  },

  // Delete document(s)
  async delete(collection, query) {
    try {
      const coll = await getCollection(collection);
      const normalizedQuery = normalizeQuery(query);
      const result = await coll.deleteMany(normalizedQuery);
      return result.deletedCount > 0;
    } catch (error) {
      console.error(`Error deleting documents in ${collection}:`, error);
      return false;
    }
  },

  // Find one and delete
  async findOneAndDelete(collection, query) {
    try {
      const coll = await getCollection(collection);
      const normalizedQuery = normalizeQuery(query);
      const result = await coll.findOneAndDelete(normalizedQuery);
      return normalizeDoc(result.value || result);
    } catch (error) {
      console.error(`Error finding and deleting document in ${collection}:`, error);
      return null;
    }
  }
};

// Close connection on process exit
process.on('SIGINT', async () => {
  if (client) {
    await client.close();
    console.log('MongoDB connection closed');
  }
  process.exit(0);
});

module.exports = dbOperations;

