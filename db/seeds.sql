-- Sample data for POS system testing

-- Insert default admin user (password: 'admin123')
INSERT OR REPLACE INTO users (username, password_hash, role, first_name, last_name, email) VALUES
('admin', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewkqNnPkdLfgUgTG', 'admin', 'Store', 'Admin', 'admin@yourstore.com'),
('cashier1', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewkqNnPkdLfgUgTG', 'cashier', 'John', 'Doe', 'cashier1@yourstore.com');

-- Insert product categories
INSERT OR REPLACE INTO categories (name, description) VALUES
('Beverages', 'Soft drinks, juices, water, etc.'),
('Snacks', 'Chips, candy, nuts, etc.'),
('Tobacco', 'Cigarettes, cigars, vaping products'),
('Alcohol', 'Beer, wine, spirits'),
('Groceries', 'Basic food items'),
('Health & Beauty', 'Personal care products'),
('Automotive', 'Car accessories and fluids'),
('Other', 'Miscellaneous items');

-- Insert sample products
INSERT OR REPLACE INTO products (barcode, name, description, price, cost, stock_quantity, min_stock_level, category_id, tax_rate) VALUES
-- Beverages
('049000000443', 'Coca-Cola 12oz Can', 'Classic Coca-Cola in 12oz can', 1.50, 0.75, 100, 20, 1, 0.08),
('049000000450', 'Pepsi 12oz Can', 'Pepsi Cola in 12oz can', 1.50, 0.75, 80, 20, 1, 0.08),
('049000000467', 'Sprite 12oz Can', 'Lemon-lime soda in 12oz can', 1.50, 0.75, 60, 20, 1, 0.08),
('012000000478', 'Bottled Water 16.9oz', 'Pure drinking water', 1.25, 0.50, 200, 50, 1, 0.08),
('051000000432', 'Red Bull 8.4oz', 'Energy drink', 2.50, 1.25, 50, 10, 1, 0.08),

-- Snacks
('028400000123', 'Lays Classic Chips', 'Regular potato chips', 2.25, 1.00, 75, 15, 2, 0.08),
('028400000130', 'Doritos Nacho Cheese', 'Nacho cheese flavored tortilla chips', 2.25, 1.00, 60, 15, 2, 0.08),
('040000000087', 'Snickers Bar', 'Chocolate bar with peanuts', 1.75, 0.85, 120, 25, 2, 0.08),
('040000000094', 'Kit Kat Bar', 'Chocolate wafer bar', 1.75, 0.85, 100, 25, 2, 0.08),
('029000000145', 'Planters Peanuts', 'Salted peanuts', 3.50, 1.75, 40, 10, 2, 0.08),

-- Tobacco (higher tax rate)
('012345678901', 'Marlboro Red Pack', 'Marlboro Red cigarettes', 8.50, 6.00, 200, 50, 3, 0.25),
('012345678902', 'Newport Menthol Pack', 'Newport menthol cigarettes', 8.50, 6.00, 150, 50, 3, 0.25),
('012345678903', 'Camel Blue Pack', 'Camel Blue cigarettes', 8.25, 5.80, 100, 30, 3, 0.25),

-- Alcohol (special tax)
('083783375121', 'Budweiser 6-Pack', 'Budweiser beer 6-pack', 7.99, 4.50, 30, 10, 4, 0.15),
('083783375138', 'Corona 6-Pack', 'Corona beer 6-pack', 8.99, 5.25, 25, 8, 4, 0.15),
('087000000456', 'Smirnoff Vodka 750ml', 'Premium vodka', 19.99, 12.50, 20, 5, 4, 0.15),

-- Groceries
('041196000123', 'Wonder Bread', 'White sandwich bread', 2.49, 1.25, 30, 8, 5, 0.08),
('041196000130', 'Milk 1 Gallon', 'Whole milk', 3.99, 2.50, 25, 5, 5, 0.00),
('041196000147', 'Eggs 1 Dozen', 'Large eggs', 2.99, 1.75, 40, 10, 5, 0.00),

-- Health & Beauty
('037000000123', 'Advil 20ct', 'Pain relief medication', 4.99, 2.50, 20, 5, 6, 0.08),
('037000000130', 'Toothpaste', 'Crest toothpaste', 3.49, 1.75, 15, 5, 6, 0.08),

-- Automotive
('076308000456', 'Motor Oil 1Qt', 'Motor oil for cars', 4.99, 2.75, 12, 3, 7, 0.08),
('076308000463', 'Windshield Washer Fluid', 'Windshield cleaning fluid', 2.99, 1.50, 8, 2, 7, 0.08);

-- Insert default system settings
INSERT OR REPLACE INTO settings (key, value, description) VALUES
('store_name', 'Demo Store', 'Store name for receipts'),
('store_address', '123 Main St, Demo City, ST 12345', 'Store address for receipts'),
('store_phone', '(555) 123-4567', 'Store phone number'),
('store_email', 'info@demostore.com', 'Store email address'),
('default_tax_rate', '0.08', 'Default tax rate (8%)'),
('currency', 'USD', 'Store currency'),
('receipt_footer', 'Thank you for your business!', 'Footer text for receipts'),
('low_stock_threshold', '10', 'Default low stock warning threshold'),
('auto_print_receipt', 'true', 'Automatically print receipt after sale'),
('cash_drawer_enabled', 'false', 'Enable cash drawer integration'); 