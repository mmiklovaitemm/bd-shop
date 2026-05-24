-- ============================================
-- JUVELYRIKOS E-PARDUOTUVĖS DUOMENŲ BAZĖS SCHEMA
-- ============================================

-- 1. VARTOTOJŲ LENTELĖ
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  role ENUM('user', 'admin') DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. PRODUKTŲ LENTELĖ
CREATE TABLE IF NOT EXISTS products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL,
  price_value INT NOT NULL COMMENT 'Kaina centais',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_best_seller TINYINT(1) DEFAULT 0,
  has_gem TINYINT(1) DEFAULT 0,
  surface VARCHAR(100),
  thumbnail TEXT,
  images JSON COMMENT 'Produkto nuotraukų masyvas',
  colors JSON COMMENT 'Galimų spalvų masyvas',
  gemstones JSON COMMENT 'Akmenų informacija',
  sizes JSON COMMENT 'Galimų dydžių masyvas',
  details JSON COMMENT 'Papildoma produkto informacija',
  stock_quantity INT DEFAULT 0 COMMENT 'Bendras variantų kiekis',
  INDEX idx_category (category),
  INDEX idx_price (price_value),
  INDEX idx_bestseller (is_best_seller),
  INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. PRODUKTŲ VARIANTŲ LENTELĖ (NAUJA!)
CREATE TABLE IF NOT EXISTS product_variants (
  id INT AUTO_INCREMENT PRIMARY KEY,
  product_id INT NOT NULL,
  color VARCHAR(50) NOT NULL,
  size VARCHAR(50),
  stock INT DEFAULT 0,
  images JSON COMMENT 'Varianto nuotraukų masyvas',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  INDEX idx_product_id (product_id),
  INDEX idx_color (color),
  INDEX idx_size (size),
  INDEX idx_stock (stock),
  UNIQUE KEY unique_variant (product_id, color, size)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. UŽSAKYMŲ LENTELĖ
CREATE TABLE IF NOT EXISTS orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status ENUM('pending', 'confirmed', 'shipped', 'delivered', 'cancelled') DEFAULT 'pending',
  total_cents INT NOT NULL,
  currency VARCHAR(10) DEFAULT 'EUR',
  contact_email VARCHAR(255) NOT NULL,
  delivery_type VARCHAR(50),
  delivery_method VARCHAR(50),
  delivery_fee_cents INT DEFAULT 0,
  ship_first_name VARCHAR(100),
  ship_last_name VARCHAR(100),
  ship_address VARCHAR(255),
  ship_city VARCHAR(100),
  ship_postal_code VARCHAR(20),
  ship_phone VARCHAR(50),
  payment_type VARCHAR(50),
  payment_bank VARCHAR(50),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_user_id (user_id),
  INDEX idx_status (status),
  INDEX idx_created (created_at),
  INDEX idx_email (contact_email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. UŽSAKYMŲ PREKIŲ LENTELĖ
CREATE TABLE IF NOT EXISTS order_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  product_variant_id INT NOT NULL COMMENT 'Nuoroda į konkretų produkto variantą',
  product_name VARCHAR(255) NOT NULL,
  price_cents INT NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  color VARCHAR(50),
  size VARCHAR(50),
  service_option VARCHAR(100),
  image_url TEXT,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (product_variant_id) REFERENCES product_variants(id) ON DELETE RESTRICT,
  INDEX idx_order_id (order_id),
  INDEX idx_variant_id (product_variant_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. MĖGSTAMŲ PREKIŲ LENTELĖ
CREATE TABLE IF NOT EXISTS favorites (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  product_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  UNIQUE KEY unique_favorite (user_id, product_id),
  INDEX idx_user_id (user_id),
  INDEX idx_product_id (product_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
