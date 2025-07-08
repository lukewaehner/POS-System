const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");
const path = require("path");
require("dotenv").config();

// Factory function to create the Express app with dependency injection
const createApp = (database) => {
  const app = express();
  const db = database;

  // Middleware
  app.use(cors());
  app.use(express.json());

  // Test endpoint
  app.get("/api/test", (req, res) => {
    res.json({
      message: "POS API is running!",
      timestamp: new Date().toISOString(),
      database: "Connected",
    });
  });

  // Test database connection endpoint
  app.get("/api/test/database", (req, res) => {
    const query = "SELECT COUNT(*) as count FROM products";

    db.get(query, [], (err, row) => {
      if (err) {
        console.error("Database error:", err.message);
        res
          .status(500)
          .json({ error: "Database connection failed", details: err.message });
      } else {
        res.json({
          message: "Database connection successful!",
          productCount: row.count,
          timestamp: new Date().toISOString(),
        });
      }
    });
  });

  // Get all products endpoint with search and filtering
  app.get("/api/products", (req, res) => {
    const {
      query: searchQuery,
      category,
      minPrice,
      maxPrice,
      inStock,
      lowStock,
      sortBy,
      sortOrder,
      limit,
      offset,
    } = req.query;

    // Build dynamic SQL query with category join
    let sqlQuery = `
      SELECT p.*, c.name as category_name 
      FROM products p 
      LEFT JOIN categories c ON p.category_id = c.id 
      WHERE p.is_active = 1
    `;
    const params = [];

    // Add search by name or description
    if (searchQuery) {
      sqlQuery += " AND (p.name LIKE ? OR p.description LIKE ?)";
      const searchPattern = `%${searchQuery}%`;
      params.push(searchPattern, searchPattern);
    }

    // Add category filter by category name
    if (category) {
      sqlQuery += " AND c.name = ?";
      params.push(category);
    }

    // Add price filters
    if (minPrice) {
      sqlQuery += " AND p.price >= ?";
      params.push(parseFloat(minPrice));
    }
    if (maxPrice) {
      sqlQuery += " AND p.price <= ?";
      params.push(parseFloat(maxPrice));
    }

    // Add stock filters
    if (inStock === "true") {
      sqlQuery += " AND p.stock_quantity > 0";
    }
    if (lowStock === "true") {
      sqlQuery += " AND p.stock_quantity <= p.min_stock_level";
    }

    // Add sorting
    const validSortColumns = ["name", "price", "stock_quantity", "created_at"];
    const validSortOrders = ["asc", "desc"];

    if (sortBy && validSortColumns.includes(sortBy)) {
      const order = validSortOrders.includes(sortOrder?.toLowerCase())
        ? sortOrder.toUpperCase()
        : "ASC";
      sqlQuery += ` ORDER BY p.${sortBy} ${order}`;
    } else {
      sqlQuery += " ORDER BY p.name ASC";
    }

    // Add pagination
    if (limit) {
      sqlQuery += " LIMIT ?";
      params.push(parseInt(limit));

      if (offset) {
        sqlQuery += " OFFSET ?";
        params.push(parseInt(offset));
      }
    }

    console.log("🔍 Products SQL Query:", sqlQuery);
    console.log("🔍 Query Params:", params);

    db.all(sqlQuery, params, (err, rows) => {
      if (err) {
        console.error("Database error:", err.message);
        res
          .status(500)
          .json({ error: "Failed to fetch products", details: err.message });
      } else {
        res.json({
          products: rows,
          count: rows.length,
          timestamp: new Date().toISOString(),
          filters: {
            searchQuery,
            category,
            minPrice,
            maxPrice,
            inStock,
            lowStock,
            sortBy,
            sortOrder,
            limit,
            offset,
          },
        });
      }
    });
  });

  // Get product by barcode endpoint
  app.get("/api/products/barcode/:barcode", (req, res) => {
    const { barcode } = req.params;
    const query = "SELECT * FROM products WHERE barcode = ?";

    db.get(query, [barcode], (err, row) => {
      if (err) {
        console.error("Database error:", err.message);
        res
          .status(500)
          .json({ error: "Failed to fetch product", details: err.message });
      } else if (!row) {
        res.status(404).json({ error: "Product not found", barcode });
      } else {
        res.json({
          product: row,
          timestamp: new Date().toISOString(),
        });
      }
    });
  });

  // Get single product by ID
  app.get("/api/products/:id", (req, res) => {
    const { id } = req.params;
    const query = "SELECT * FROM products WHERE id = ?";

    db.get(query, [id], (err, row) => {
      if (err) {
        console.error("Database error:", err.message);
        res
          .status(500)
          .json({ error: "Failed to fetch product", details: err.message });
      } else if (!row) {
        res.status(404).json({ error: "Product not found", id });
      } else {
        res.json({
          product: row,
          timestamp: new Date().toISOString(),
        });
      }
    });
  });

  // Create new product
  app.post("/api/products", (req, res) => {
    const {
      barcode,
      name,
      description,
      price,
      cost,
      stock_quantity,
      min_stock_level,
      category_id,
      tax_rate,
    } = req.body;

    // Basic validation
    if (!barcode || !name || !price) {
      return res
        .status(400)
        .json({ error: "Missing required fields: barcode, name, price" });
    }

    const query = `
      INSERT INTO products (barcode, name, description, price, cost, stock_quantity, min_stock_level, category_id, tax_rate)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const params = [
      barcode,
      name,
      description || null,
      price,
      cost || null,
      stock_quantity || 0,
      min_stock_level || 0,
      category_id || null,
      tax_rate || 0.08,
    ];

    db.run(query, params, function (err) {
      if (err) {
        console.error("Database error:", err.message);
        if (err.message.includes("UNIQUE constraint failed")) {
          res
            .status(409)
            .json({ error: "Product with this barcode already exists" });
        } else {
          res
            .status(500)
            .json({ error: "Failed to create product", details: err.message });
        }
      } else {
        res.status(201).json({
          message: "Product created successfully",
          productId: this.lastID,
          timestamp: new Date().toISOString(),
        });
      }
    });
  });

  // Update product
  app.put("/api/products/:id", (req, res) => {
    const { id } = req.params;
    const {
      barcode,
      name,
      description,
      price,
      cost,
      stock_quantity,
      min_stock_level,
      category_id,
      tax_rate,
      is_active,
    } = req.body;

    // Build dynamic update query
    const updates = [];
    const params = [];

    if (barcode !== undefined) {
      updates.push("barcode = ?");
      params.push(barcode);
    }
    if (name !== undefined) {
      updates.push("name = ?");
      params.push(name);
    }
    if (description !== undefined) {
      updates.push("description = ?");
      params.push(description);
    }
    if (price !== undefined) {
      updates.push("price = ?");
      params.push(price);
    }
    if (cost !== undefined) {
      updates.push("cost = ?");
      params.push(cost);
    }
    if (stock_quantity !== undefined) {
      updates.push("stock_quantity = ?");
      params.push(stock_quantity);
    }
    if (min_stock_level !== undefined) {
      updates.push("min_stock_level = ?");
      params.push(min_stock_level);
    }
    if (category_id !== undefined) {
      updates.push("category_id = ?");
      params.push(category_id);
    }
    if (tax_rate !== undefined) {
      updates.push("tax_rate = ?");
      params.push(tax_rate);
    }
    if (is_active !== undefined) {
      updates.push("is_active = ?");
      params.push(is_active);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: "No fields to update" });
    }

    updates.push("updated_at = CURRENT_TIMESTAMP");
    params.push(id);

    const query = `UPDATE products SET ${updates.join(", ")} WHERE id = ?`;

    db.run(query, params, function (err) {
      if (err) {
        console.error("Database error:", err.message);
        res
          .status(500)
          .json({ error: "Failed to update product", details: err.message });
      } else if (this.changes === 0) {
        res.status(404).json({ error: "Product not found", id });
      } else {
        res.json({
          message: "Product updated successfully",
          productId: id,
          changesCount: this.changes,
          timestamp: new Date().toISOString(),
        });
      }
    });
  });

  // Delete product (soft delete by setting is_active = false)
  app.delete("/api/products/:id", (req, res) => {
    const { id } = req.params;
    const { hard_delete } = req.query;

    let query, successMessage;

    if (hard_delete === "true") {
      query = "DELETE FROM products WHERE id = ?";
      successMessage = "Product permanently deleted";
    } else {
      query =
        "UPDATE products SET is_active = false, updated_at = CURRENT_TIMESTAMP WHERE id = ?";
      successMessage = "Product deactivated";
    }

    db.run(query, [id], function (err) {
      if (err) {
        console.error("Database error:", err.message);
        res
          .status(500)
          .json({ error: "Failed to delete product", details: err.message });
      } else if (this.changes === 0) {
        res.status(404).json({ error: "Product not found", id });
      } else {
        res.json({
          message: successMessage,
          productId: id,
          timestamp: new Date().toISOString(),
        });
      }
    });
  });

  // ===== SALES RECORDING API =====

  // Get all sales
  app.get("/api/sales", (req, res) => {
    const { limit, offset, start_date, end_date } = req.query;

    let query = `
      SELECT s.*, u.username as cashier_name 
      FROM sales s 
      LEFT JOIN users u ON s.user_id = u.id 
      WHERE 1=1
    `;
    const params = [];

    if (start_date) {
      query += " AND s.created_at >= ?";
      params.push(start_date);
    }

    if (end_date) {
      query += " AND s.created_at <= ?";
      params.push(end_date);
    }

    query += " ORDER BY s.created_at DESC";

    if (limit) {
      query += " LIMIT ?";
      params.push(parseInt(limit));

      if (offset) {
        query += " OFFSET ?";
        params.push(parseInt(offset));
      }
    }

    db.all(query, params, (err, rows) => {
      if (err) {
        console.error("Database error:", err.message);
        res
          .status(500)
          .json({ error: "Failed to fetch sales", details: err.message });
      } else {
        res.json({
          sales: rows,
          count: rows.length,
          timestamp: new Date().toISOString(),
        });
      }
    });
  });

  // Get single sale with items
  app.get("/api/sales/:id", (req, res) => {
    const { id } = req.params;

    const saleQuery = `
      SELECT s.*, u.username as cashier_name 
      FROM sales s 
      LEFT JOIN users u ON s.user_id = u.id 
      WHERE s.id = ?
    `;

    const itemsQuery = `
      SELECT si.*, p.name as product_name, p.barcode 
      FROM sale_items si 
      LEFT JOIN products p ON si.product_id = p.id 
      WHERE si.sale_id = ?
    `;

    db.get(saleQuery, [id], (err, sale) => {
      if (err) {
        console.error("Database error:", err.message);
        res
          .status(500)
          .json({ error: "Failed to fetch sale", details: err.message });
      } else if (!sale) {
        res.status(404).json({ error: "Sale not found", id });
      } else {
        db.all(itemsQuery, [id], (err, items) => {
          if (err) {
            console.error("Database error:", err.message);
            res.status(500).json({
              error: "Failed to fetch sale items",
              details: err.message,
            });
          } else {
            res.json({
              sale: { ...sale, items },
              timestamp: new Date().toISOString(),
            });
          }
        });
      }
    });
  });

  // Create new sale
  app.post("/api/sales", (req, res) => {
    const {
      user_id,
      items,
      payment_method,
      cash_received,
      change_given,
      payment_id,
    } = req.body;

    // Validation
    if (!user_id || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        error: "Missing required fields: user_id, items (array)",
      });
    }

    if (!payment_method || !["cash", "card"].includes(payment_method)) {
      return res.status(400).json({
        error: "payment_method must be 'cash' or 'card'",
      });
    }

    // Generate unique sale number
    const saleNumber = `SALE-${Date.now()}-${Math.random()
      .toString(36)
      .substr(2, 5)}`;

    // Calculate totals
    let subtotal = 0;
    let tax_amount = 0;

    for (const item of items) {
      if (!item.product_id || !item.quantity || !item.unit_price) {
        return res.status(400).json({
          error: "Each item must have product_id, quantity, and unit_price",
        });
      }

      const itemTotal = item.quantity * item.unit_price;
      subtotal += itemTotal;

      // Calculate tax (assuming tax_rate is passed or using default 8%)
      const taxRate = item.tax_rate || 0.08;
      tax_amount += itemTotal * taxRate;
    }

    const total_amount = subtotal + tax_amount;

    // Start transaction
    db.serialize(() => {
      db.run("BEGIN TRANSACTION");

      // Insert sale
      const saleQuery = `
        INSERT INTO sales (sale_number, user_id, subtotal, tax_amount, total_amount, 
                          payment_method, cash_received, change_given, payment_id)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const saleParams = [
        saleNumber,
        user_id,
        subtotal,
        tax_amount,
        total_amount,
        payment_method,
        cash_received || null,
        change_given || null,
        payment_id || null,
      ];

      db.run(saleQuery, saleParams, function (err) {
        if (err) {
          console.error("Sale insert error:", err.message);
          db.run("ROLLBACK");
          return res
            .status(500)
            .json({ error: "Failed to create sale", details: err.message });
        }

        const saleId = this.lastID;
        let itemsProcessed = 0;
        const totalItems = items.length;

        // Insert sale items and update inventory
        items.forEach((item) => {
          const itemQuery = `
            INSERT INTO sale_items (sale_id, product_id, quantity, unit_price, total_price)
            VALUES (?, ?, ?, ?, ?)
          `;

          const itemTotal = item.quantity * item.unit_price;
          const itemParams = [
            saleId,
            item.product_id,
            item.quantity,
            item.unit_price,
            itemTotal,
          ];

          db.run(itemQuery, itemParams, function (err) {
            if (err) {
              console.error("Sale item insert error:", err.message);
              db.run("ROLLBACK");
              return res.status(500).json({
                error: "Failed to create sale item",
                details: err.message,
              });
            }

            // Update product stock
            const stockQuery =
              "UPDATE products SET stock_quantity = stock_quantity - ? WHERE id = ?";
            db.run(
              stockQuery,
              [item.quantity, item.product_id],
              function (err) {
                if (err) {
                  console.error("Stock update error:", err.message);
                  db.run("ROLLBACK");
                  return res.status(500).json({
                    error: "Failed to update stock",
                    details: err.message,
                  });
                }

                itemsProcessed++;

                // If all items processed, commit transaction
                if (itemsProcessed === totalItems) {
                  db.run("COMMIT", (err) => {
                    if (err) {
                      console.error("Commit error:", err.message);
                      return res.status(500).json({
                        error: "Transaction failed",
                        details: err.message,
                      });
                    }

                    res.status(201).json({
                      message: "Sale created successfully",
                      sale: {
                        id: saleId,
                        sale_number: saleNumber,
                        subtotal,
                        tax_amount,
                        total_amount,
                        items_count: totalItems,
                      },
                      timestamp: new Date().toISOString(),
                    });
                  });
                }
              }
            );
          });
        });
      });
    });
  });

  // ===== INVENTORY MANAGEMENT =====

  // Adjust inventory
  app.post("/api/inventory/adjust", (req, res) => {
    const { product_id, adjustment_type, quantity_change, reason, user_id } =
      req.body;

    // Validation
    if (!product_id || !adjustment_type || !quantity_change || !user_id) {
      return res.status(400).json({
        error:
          "Missing required fields: product_id, adjustment_type, quantity_change, user_id",
      });
    }

    if (!["restock", "shrinkage", "correction"].includes(adjustment_type)) {
      return res.status(400).json({
        error:
          "adjustment_type must be 'restock', 'shrinkage', or 'correction'",
      });
    }

    // Get current stock
    const getStockQuery = "SELECT stock_quantity FROM products WHERE id = ?";

    db.get(getStockQuery, [product_id], (err, product) => {
      if (err) {
        console.error("Database error:", err.message);
        return res
          .status(500)
          .json({ error: "Failed to get product", details: err.message });
      }

      if (!product) {
        return res.status(404).json({ error: "Product not found", product_id });
      }

      const oldQuantity = product.stock_quantity;
      const newQuantity = oldQuantity + quantity_change;

      if (newQuantity < 0) {
        return res.status(400).json({
          error: "Adjustment would result in negative stock",
          current_stock: oldQuantity,
          attempted_change: quantity_change,
        });
      }

      // Start transaction
      db.serialize(() => {
        db.run("BEGIN TRANSACTION");

        // Update product stock
        const updateStockQuery =
          "UPDATE products SET stock_quantity = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?";

        db.run(updateStockQuery, [newQuantity, product_id], function (err) {
          if (err) {
            console.error("Stock update error:", err.message);
            db.run("ROLLBACK");
            return res
              .status(500)
              .json({ error: "Failed to update stock", details: err.message });
          }

          // Record adjustment
          const adjustmentQuery = `
            INSERT INTO inventory_adjustments (product_id, adjustment_type, quantity_change, 
                                             old_quantity, new_quantity, reason, user_id)
            VALUES (?, ?, ?, ?, ?, ?, ?)
          `;

          const adjustmentParams = [
            product_id,
            adjustment_type,
            quantity_change,
            oldQuantity,
            newQuantity,
            reason || null,
            user_id,
          ];

          db.run(adjustmentQuery, adjustmentParams, function (err) {
            if (err) {
              console.error("Adjustment record error:", err.message);
              db.run("ROLLBACK");
              return res.status(500).json({
                error: "Failed to record adjustment",
                details: err.message,
              });
            }

            db.run("COMMIT", (err) => {
              if (err) {
                console.error("Commit error:", err.message);
                return res
                  .status(500)
                  .json({ error: "Transaction failed", details: err.message });
              }

              res.json({
                message: "Inventory adjusted successfully",
                adjustment: {
                  id: this.lastID,
                  product_id,
                  adjustment_type,
                  old_quantity: oldQuantity,
                  new_quantity: newQuantity,
                  quantity_change,
                },
                timestamp: new Date().toISOString(),
              });
            });
          });
        });
      });
    });
  });

  // Get low stock products
  app.get("/api/inventory/low-stock", (req, res) => {
    const query = `
      SELECT id, barcode, name, stock_quantity, min_stock_level,
             (min_stock_level - stock_quantity) as shortage
      FROM products 
      WHERE is_active = true AND stock_quantity <= min_stock_level
      ORDER BY shortage DESC
    `;

    db.all(query, [], (err, rows) => {
      if (err) {
        console.error("Database error:", err.message);
        res.status(500).json({
          error: "Failed to fetch low stock products",
          details: err.message,
        });
      } else {
        res.json({
          low_stock_products: rows,
          count: rows.length,
          timestamp: new Date().toISOString(),
        });
      }
    });
  });

  // Get inventory adjustment history
  app.get("/api/inventory/adjustments", (req, res) => {
    const { product_id, limit, offset } = req.query;

    let query = `
      SELECT ia.*, p.name as product_name, p.barcode, u.username
      FROM inventory_adjustments ia
      LEFT JOIN products p ON ia.product_id = p.id
      LEFT JOIN users u ON ia.user_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (product_id) {
      query += " AND ia.product_id = ?";
      params.push(product_id);
    }

    query += " ORDER BY ia.created_at DESC";

    if (limit) {
      query += " LIMIT ?";
      params.push(parseInt(limit));

      if (offset) {
        query += " OFFSET ?";
        params.push(parseInt(offset));
      }
    }

    db.all(query, params, (err, rows) => {
      if (err) {
        console.error("Database error:", err.message);
        res
          .status(500)
          .json({ error: "Failed to fetch adjustments", details: err.message });
      } else {
        res.json({
          adjustments: rows,
          count: rows.length,
          timestamp: new Date().toISOString(),
        });
      }
    });
  });

  return app;
};

// Create database connection and start server only if this file is run directly
if (require.main === module) {
  const PORT = process.env.PORT || 3001;

  // Database connection
  const dbPath = path.join(__dirname, "../../db/pos.db");
  const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
      console.error("Error opening database:", err.message);
    } else {
      console.log("✅ Connected to SQLite database");
    }
  });

  // Create and start the server
  const app = createApp(db);

  app.listen(PORT, () => {
    console.log(`🚀 POS API Server running on port ${PORT}`);
    console.log(`📋 Available API Endpoints:`);
    console.log(`   
🧪 Test & Health:
   - GET  /api/test
   - GET  /api/test/database

📦 Product Management:
   - GET    /api/products
   - GET    /api/products/:id
   - GET    /api/products/barcode/:barcode
   - POST   /api/products
   - PUT    /api/products/:id
   - DELETE /api/products/:id

💰 Sales Recording:
   - GET  /api/sales
   - GET  /api/sales/:id
   - POST /api/sales

📊 Inventory Management:
   - POST /api/inventory/adjust
   - GET  /api/inventory/low-stock
   - GET  /api/inventory/adjustments
  `);
  });

  // Graceful shutdown
  process.on("SIGINT", () => {
    console.log("\n🔄 Shutting down server...");
    db.close((err) => {
      if (err) {
        console.error("Error closing database:", err.message);
      } else {
        console.log("✅ Database connection closed");
      }
      process.exit(0);
    });
  });
}

module.exports = createApp;
