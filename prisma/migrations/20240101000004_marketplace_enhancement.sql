-- CreateTable
CREATE TABLE "marketplace_categories" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "icon" TEXT,
    "parentId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "marketplace_categories_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "marketplace_categories" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "product_reviews" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "userId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "product_reviews_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "product_reviews_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "product_favorites" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "product_favorites_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "product_favorites_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "price_history" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "price" INTEGER NOT NULL,
    "priceInSoles" REAL,
    "productId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "price_history_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_products" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "priceInSoles" REAL,
    "images" TEXT,
    "category" TEXT NOT NULL,
    "subcategory" TEXT,
    "tags" TEXT,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "sold" INTEGER NOT NULL DEFAULT 0,
    "rating" REAL NOT NULL DEFAULT 0,
    "ratingCount" INTEGER NOT NULL DEFAULT 0,
    "views" INTEGER NOT NULL DEFAULT 0,
    "isOfficial" BOOLEAN NOT NULL DEFAULT false,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "sellerId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "products_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_products" ("id", "name", "description", "price", "images", "category", "tags", "stock", "sold", "rating", "ratingCount", "isOfficial", "status", "sellerId", "createdAt", "updatedAt") SELECT "id", "name", "description", "price", "images", "category", "tags", "stock", "sold", "rating", "ratingCount", "isOfficial", "status", "sellerId", "createdAt", "updatedAt" FROM "products";
DROP TABLE "products";
ALTER TABLE "new_products" RENAME TO "products";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;

-- CreateIndex
CREATE UNIQUE INDEX "marketplace_categories_name_key" ON "marketplace_categories"("name");

-- CreateIndex
CREATE UNIQUE INDEX "product_reviews_userId_productId_key" ON "product_reviews"("userId", "productId");

-- CreateIndex
CREATE UNIQUE INDEX "product_favorites_userId_productId_key" ON "product_favorites"("userId", "productId");

-- Insert sample marketplace categories
INSERT INTO "marketplace_categories" ("id", "name", "description", "icon") VALUES
('cat_electronics', 'Electrónicos', 'Dispositivos electrónicos, gadgets y accesorios', '📱'),
('cat_books', 'Libros y Material Académico', 'Libros de texto, apuntes y material de estudio', '📚'),
('cat_clothing', 'Ropa y Accesorios', 'Vestimenta, zapatos y accesorios personales', '👕'),
('cat_sports', 'Deportes y Fitness', 'Equipamiento deportivo y artículos de fitness', '⚽'),
('cat_home', 'Hogar y Decoración', 'Artículos para el hogar y decoración', '🏠'),
('cat_beauty', 'Belleza y Cuidado Personal', 'Productos de belleza y cuidado personal', '💄'),
('cat_automotive', 'Automotriz', 'Repuestos y accesorios para vehículos', '🚗'),
('cat_services', 'Servicios', 'Servicios profesionales y personales', '🔧'),
('cat_food', 'Comida y Bebidas', 'Alimentos, bebidas y productos gastronómicos', '🍕'),
('cat_other', 'Otros', 'Productos que no encajan en otras categorías', '📦');

-- Insert subcategories for Electronics
INSERT INTO "marketplace_categories" ("id", "name", "description", "parentId") VALUES
('subcat_phones', 'Celulares y Smartphones', 'Teléfonos móviles y accesorios', 'cat_electronics'),
('subcat_computers', 'Computadoras y Laptops', 'Equipos de cómputo y accesorios', 'cat_electronics'),
('subcat_audio', 'Audio y Video', 'Auriculares, parlantes y equipos de audio', 'cat_electronics'),
('subcat_gaming', 'Gaming', 'Consolas, videojuegos y accesorios gaming', 'cat_electronics');

-- Insert subcategories for Books
INSERT INTO "marketplace_categories" ("id", "name", "description", "parentId") VALUES
('subcat_textbooks', 'Libros de Texto', 'Libros académicos y de estudio', 'cat_books'),
('subcat_notes', 'Apuntes y Resúmenes', 'Material de estudio elaborado por estudiantes', 'cat_books'),
('subcat_fiction', 'Literatura y Ficción', 'Novelas, cuentos y literatura general', 'cat_books'),
('subcat_reference', 'Libros de Referencia', 'Diccionarios, enciclopedias y manuales', 'cat_books');

-- Insert sample products
INSERT INTO "products" ("id", "name", "description", "price", "priceInSoles", "category", "subcategory", "tags", "stock", "views", "isFeatured", "sellerId") VALUES
('prod_1', 'iPhone 13 Pro Max 256GB', 'iPhone 13 Pro Max en excelente estado, incluye cargador y caja original', 2500, 9250.0, 'cat_electronics', 'subcat_phones', 'iphone,apple,smartphone,256gb', 1, 45, true, NULL),
('prod_2', 'Laptop Gaming ASUS ROG', 'Laptop gaming ASUS ROG Strix con RTX 3060, 16GB RAM, SSD 512GB', 3200, 11840.0, 'cat_electronics', 'subcat_computers', 'laptop,gaming,asus,rtx3060', 1, 32, true, NULL),
('prod_3', 'Cálculo Diferencial e Integral - Stewart', 'Libro de cálculo en perfecto estado, ideal para ingeniería', 80, 296.0, 'cat_books', 'subcat_textbooks', 'calculo,matematicas,stewart,ingenieria', 3, 28, false, NULL),
('prod_4', 'Auriculares Sony WH-1000XM4', 'Auriculares inalámbricos con cancelación de ruido', 650, 2405.0, 'cat_electronics', 'subcat_audio', 'sony,auriculares,bluetooth,noise-cancelling', 2, 19, false, NULL),
('prod_5', 'Apuntes Completos de Física II', 'Apuntes detallados de Física II con ejercicios resueltos', 25, 92.5, 'cat_books', 'subcat_notes', 'fisica,apuntes,ejercicios,universidad', 5, 15, false, NULL);