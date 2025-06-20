const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { connectMySQL, sequelize } = require("./config/db.mysql");
const connectMongoDB = require("./config/db.mongo");
const errorHandler = require("./middleware/errorHandler");

// Load models to establish associations
const User = require("./models/mysql/User")(sequelize);
const Product = require("./models/mysql/Product")(sequelize);
const Category = require("./models/mysql/Category")(sequelize);
const Supplier = require("./models/mysql/Supplier")(sequelize);
const StockTransaction = require("./models/mysql/StockTransaction")(sequelize);

// Define associations
User.hasMany(StockTransaction, { foreignKey: "userId", as: "transactions" });
StockTransaction.belongsTo(User, { foreignKey: "userId", as: "user" });

Product.hasMany(StockTransaction, {
  foreignKey: "productId",
  as: "stockTransactions",
});
StockTransaction.belongsTo(Product, { foreignKey: "productId", as: "product" });

Category.hasMany(Product, { foreignKey: "categoryId", as: "products" });
Product.belongsTo(Category, { foreignKey: "categoryId", as: "category" });

Supplier.hasMany(Product, { foreignKey: "supplierId", as: "products" });
Product.belongsTo(Supplier, { foreignKey: "supplierId", as: "supplier" });

dotenv.config();

const app = express();

connectMySQL();
connectMongoDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // Penting untuk parsing application/x-www-form-urlencoded

// === TAMBAHKAN INI UNTUK MENYAJIKAN GAMBAR SECARA STATIS ===
app.use("/uploads", express.static("uploads"));
// Pastikan Anda membuat folder 'uploads' di root direktori backend Anda.
// ==========================================================

// Define API routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/products", require("./routes/productRoutes"));
app.use("/api/stock", require("./routes/stockRoutes"));
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/suppliers", require("./routes/supplierRoutes"));
app.use("/api/categories", require("./routes/categoryRoutes"));
app.use("/api/logs", require("./routes/logRoutes"));
app.use("/api/export", require("./routes/exportRoutes"));

// Catch-all route for undefined routes
app.use((req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
});

// Centralized error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
