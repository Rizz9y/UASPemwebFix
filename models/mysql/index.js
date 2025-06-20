const { sequelize } = require("../../config/db.mysql");

const User = require("./User")(sequelize);
const Product = require("./Product")(sequelize);
const Category = require("./Category")(sequelize);
const Supplier = require("./Supplier")(sequelize);
const StockTransaction = require("./StockTransaction")(sequelize);

// Associations
User.hasMany(StockTransaction, { foreignKey: "userId", as: "transactions" });
StockTransaction.belongsTo(User, { foreignKey: "userId", as: "user" });

Product.hasMany(StockTransaction, { foreignKey: "productId", as: "stockTransactions" });
StockTransaction.belongsTo(Product, { foreignKey: "productId", as: "product" });

Category.hasMany(Product, { foreignKey: "categoryId", as: "products" });
Product.belongsTo(Category, { foreignKey: "categoryId", as: "category" });

Supplier.hasMany(Product, { foreignKey: "supplierId", as: "products" });
Product.belongsTo(Supplier, { foreignKey: "supplierId", as: "supplier" });

module.exports = {
  sequelize,
  User,
  Product,
  Category,
  Supplier,
  StockTransaction,
};