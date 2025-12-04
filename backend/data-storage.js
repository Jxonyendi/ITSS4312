const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, 'data');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const getFilePath = (collection) => path.join(DATA_DIR, `${collection}.json`);

// Read data from file
function readData(collection) {
  const filePath = getFilePath(collection);
  if (!fs.existsSync(filePath)) {
    return [];
  }
  try {
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error reading ${collection}:`, error);
    return [];
  }
}

// Write data to file
function writeData(collection, data) {
  const filePath = getFilePath(collection);
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  } catch (error) {
    console.error(`Error writing ${collection}:`, error);
    throw error;
  }
}

// Database operations
const db = {
  // Find all documents matching query
  find(collection, query = {}) {
    const data = readData(collection);
    if (Object.keys(query).length === 0) return data;
    return data.filter(item => {
      return Object.keys(query).every(key => {
        // Support both _id and id
        if (key === '_id' || key === 'id') {
          return item._id === query[key] || item.id === query[key];
        }
        return item[key] === query[key];
      });
    });
  },

  // Find one document
  findOne(collection, query) {
    const data = readData(collection);
    return data.find(item => {
      return Object.keys(query).every(key => {
        // Support both _id and id
        if (key === '_id' || key === 'id') {
          return item._id === query[key] || item.id === query[key];
        }
        return item[key] === query[key];
      });
    });
  },

  // Find by ID
  findById(collection, id) {
    const data = readData(collection);
    return data.find(item => item._id === id || item.id === id);
  },

  // Insert new document
  insert(collection, item) {
    const data = readData(collection);
    // Generate unique ID
    item._id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    item.id = item._id; // Also set id for compatibility
    if (!item.createdAt) {
      item.createdAt = new Date();
    }
    data.push(item);
    writeData(collection, data);
    return item;
  },

  // Update document
  update(collection, query, updates) {
    const data = readData(collection);
    const index = data.findIndex(item => {
      return Object.keys(query).every(key => {
        if (key === '_id' || key === 'id') {
          return item._id === query[key] || item.id === query[key];
        }
        return item[key] === query[key];
      });
    });
    
    if (index !== -1) {
      data[index] = { ...data[index], ...updates };
      writeData(collection, data);
      return data[index];
    }
    return null;
  },

  // Find one and update
  findOneAndUpdate(collection, query, updates, options = {}) {
    const data = readData(collection);
    const index = data.findIndex(item => {
      return Object.keys(query).every(key => {
        if (key === '_id' || key === 'id') {
          return item._id === query[key] || item.id === query[key];
        }
        return item[key] === query[key];
      });
    });
    
    if (index !== -1) {
      const updated = { ...data[index], ...updates };
      data[index] = updated;
      writeData(collection, data);
      return updated;
    }
    return null;
  },

  // Delete document
  delete(collection, query) {
    const data = readData(collection);
    const initialLength = data.length;
    const filtered = data.filter(item => {
      return !Object.keys(query).every(key => {
        if (key === '_id' || key === 'id') {
          return item._id === query[key] || item.id === query[key];
        }
        return item[key] === query[key];
      });
    });
    writeData(collection, filtered);
    return filtered.length < initialLength;
  },

  // Find one and delete
  findOneAndDelete(collection, query) {
    const data = readData(collection);
    const index = data.findIndex(item => {
      return Object.keys(query).every(key => {
        if (key === '_id' || key === 'id') {
          return item._id === query[key] || item.id === query[key];
        }
        return item[key] === query[key];
      });
    });
    
    if (index !== -1) {
      const deleted = data[index];
      data.splice(index, 1);
      writeData(collection, data);
      return deleted;
    }
    return null;
  }
};

module.exports = db;

