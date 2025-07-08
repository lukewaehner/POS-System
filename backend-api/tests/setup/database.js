const sqlite3 = require("sqlite3").verbose();
const path = require("path");

// Create test database path
const testDbPath = path.join(__dirname, "../../test.db");

// Initialize test database
const initTestDatabase = () => {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(":memory:", (err) => {
      if (err) {
        reject(err);
      } else {
        // Create tables from schema
        const schema = `
          CREATE TABLE IF NOT EXISTS categories (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name VARCHAR(50) NOT NULL,
            description TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          );

          CREATE TABLE IF NOT EXISTS products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            barcode VARCHAR(50) NOT NULL UNIQUE,
            name VARCHAR(100) NOT NULL,
            description TEXT,
            price DECIMAL(10,2) NOT NULL,
            cost DECIMAL(10,2),
            stock_quantity INTEGER DEFAULT 0,
            min_stock_level INTEGER DEFAULT 0,
            category_id INTEGER,
            tax_rate DECIMAL(5,4) DEFAULT 0.08,
            is_active BOOLEAN DEFAULT true,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (category_id) REFERENCES categories(id)
          );

          CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username VARCHAR(50) NOT NULL UNIQUE,
            password_hash VARCHAR(255) NOT NULL,
            email VARCHAR(100),
            role VARCHAR(20) DEFAULT 'cashier',
            is_active BOOLEAN DEFAULT true,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            last_login TIMESTAMP
          );

          CREATE TABLE IF NOT EXISTS sales (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            sale_number VARCHAR(50) NOT NULL UNIQUE,
            user_id INTEGER NOT NULL,
            subtotal DECIMAL(10,2) NOT NULL,
            tax_amount DECIMAL(10,2) NOT NULL,
            total_amount DECIMAL(10,2) NOT NULL,
            payment_method VARCHAR(20) NOT NULL,
            payment_id VARCHAR(100),
            cash_received DECIMAL(10,2),
            change_given DECIMAL(10,2),
            status VARCHAR(20) DEFAULT 'completed',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id)
          );

          CREATE TABLE IF NOT EXISTS sale_items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            sale_id INTEGER NOT NULL,
            product_id INTEGER NOT NULL,
            quantity INTEGER NOT NULL,
            unit_price DECIMAL(10,2) NOT NULL,
            total_price DECIMAL(10,2) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (sale_id) REFERENCES sales(id),
            FOREIGN KEY (product_id) REFERENCES products(id)
          );

          CREATE TABLE IF NOT EXISTS inventory_adjustments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            product_id INTEGER NOT NULL,
            adjustment_type VARCHAR(20) NOT NULL,
            quantity_change INTEGER NOT NULL,
            old_quantity INTEGER NOT NULL,
            new_quantity INTEGER NOT NULL,
            reason TEXT,
            user_id INTEGER NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (product_id) REFERENCES products(id),
            FOREIGN KEY (user_id) REFERENCES users(id)
          );
        `;

        db.exec(schema, (err) => {
          if (err) {
            reject(err);
          } else {
            resolve(db);
          }
        });
      }
    });
  });
};

// Seed test data
const seedTestData = (db) => {
  return new Promise((resolve, reject) => {
    const seedSQL = `
      INSERT INTO categories (name, description) VALUES
      ('Beverages', 'Soft drinks, juices, energy drinks'),
      ('Snacks', 'Chips, candy, nuts'),
      ('Tobacco', 'Cigarettes, cigars, vaping products'),
      ('Alcohol', 'Beer, wine, spirits'),
      ('Groceries', 'Basic food items');

      INSERT INTO users (username, password_hash, email, role) VALUES
      ('admin', 'test_hash', 'admin@pos.com', 'admin'),
      ('cashier1', 'test_hash', 'cashier1@pos.com', 'cashier');

      INSERT INTO products (barcode, name, description, price, cost, stock_quantity, min_stock_level, category_id, tax_rate) VALUES
      ('049000000443', 'Coca-Cola 12oz Can', 'Classic Coca-Cola in 12oz can', 1.50, 0.75, 100, 20, 1, 0.08),
      ('049000000450', 'Pepsi 12oz Can', 'Pepsi Cola in 12oz can', 1.50, 0.75, 80, 20, 1, 0.08),
      ('049000000467', 'Sprite 12oz Can', 'Lemon-lime soda in 12oz can', 1.50, 0.75, 60, 20, 1, 0.08),
      ('028400000123', 'Lays Classic Chips', 'Regular potato chips', 2.25, 1.00, 75, 15, 2, 0.08),
      ('040000000087', 'Snickers Bar', 'Chocolate bar with peanuts', 1.75, 0.85, 120, 25, 2, 0.08),
      ('012345678901', 'Marlboro Red Pack', 'Marlboro Red cigarettes', 8.50, 6.00, 50, 10, 3, 0.25);
    `;

    db.exec(seedSQL, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve(db);
      }
    });
  });
};

// Clean up test database
const cleanupTestDatabase = (db) => {
  return new Promise((resolve, reject) => {
    if (db) {
      db.close((err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    } else {
      resolve();
    }
  });
};

module.exports = {
  initTestDatabase,
  seedTestData,
  cleanupTestDatabase,
};
