const {
  Product,
  StockTransaction,
  User,
  sequelize,
} = require("../models/mysql");
const ActivityLog = require("../models/mongo/ActivityLog");
const {
  invalidateCacheByPrefix,
  invalidateCache,
} = require("../middleware/cacheMiddleware");

const stockIn = async (req, res, next) => {
  const { productId, quantity, variantUsed, sourceDestination, notes } =
    req.body;

  if (!productId || !quantity || quantity <= 0) {
    res.status(400);
    throw new Error(
      "Product ID and a positive quantity are required for stock in."
    );
  }

  const t = await sequelize.transaction();
  try {
    const product = await Product.findByPk(productId, { transaction: t });

    if (!product) {
      res.status(404);
      throw new Error("Product not found.");
    }

    product.currentStock += quantity;
    await product.save({ transaction: t });

    const transaction = await StockTransaction.create(
      {
        productId,
        userId: req.user.id,
        type: "in",
        quantity,
        variantUsed: variantUsed || null,
        sourceDestination: sourceDestination || "Unknown Supplier",
        notes: notes || `Stock In: ${quantity} units received`,
      },
      { transaction: t }
    );

    await ActivityLog.create({
      userId: req.user.id,
      username: req.user.username,
      role: req.user.role,
      action: "Stock In",
      details: {
        productId: product.id,
        productName: product.name,
        quantity: quantity,
        variant: variantUsed,
        source: sourceDestination,
      },
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
    });

    await t.commit();

    invalidateCacheByPrefix("/api/products");
    invalidateCacheByPrefix("/api/stock/transactions");
    invalidateCache(`/api/products/${productId}`);

    res
      .status(201)
      .json({ message: "Stock In recorded successfully", transaction });
  } catch (error) {
    await t.rollback();
    next(error);
  }
};

const stockOut = async (req, res, next) => {
  const { productId, quantity, variantUsed, sourceDestination, notes } =
    req.body;

  if (!productId || !quantity || quantity <= 0) {
    res.status(400);
    throw new Error(
      "Product ID and a positive quantity are required for stock out."
    );
  }

  const t = await sequelize.transaction();
  try {
    const product = await Product.findByPk(productId, { transaction: t });

    if (!product) {
      res.status(404);
      throw new Error("Product not found.");
    }

    if (product.currentStock < quantity) {
      res.status(400);
      throw new Error(
        `Insufficient stock for product: ${product.name}. Available: ${product.currentStock}`
      );
    }

    product.currentStock -= quantity;
    await product.save({ transaction: t });

    const transaction = await StockTransaction.create(
      {
        productId,
        userId: req.user.id,
        type: "out",
        quantity,
        variantUsed: variantUsed || null,
        sourceDestination: sourceDestination || "Unknown Customer",
        notes: notes || `Stock Out: ${quantity} units issued`,
      },
      { transaction: t }
    );

    await ActivityLog.create({
      userId: req.user.id,
      username: req.user.username,
      role: req.user.role,
      action: "Stock Out",
      details: {
        productId: product.id,
        productName: product.name,
        quantity: quantity,
        variant: variantUsed,
        destination: sourceDestination,
      },
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
    });

    await t.commit();

    invalidateCacheByPrefix("/api/products");
    invalidateCacheByPrefix("/api/stock/transactions");
    invalidateCache(`/api/products/${productId}`);

    res
      .status(201)
      .json({ message: "Stock Out recorded successfully", transaction });
  } catch (error) {
    await t.rollback();
    next(error);
  }
};

const stockAdjustment = async (req, res, next) => {
  const { productId, quantity, variantUsed, notes } = req.body;

  if (!productId || !quantity || quantity === 0) {
    res.status(400);
    throw new Error(
      "Product ID and a non-zero quantity are required for stock adjustment."
    );
  }

  const t = await sequelize.transaction();
  try {
    const product = await Product.findByPk(productId, { transaction: t });

    if (!product) {
      res.status(404);
      throw new Error("Product not found.");
    }

    const newStock = product.currentStock + quantity;
    if (newStock < 0) {
      res.status(400);
      throw new Error(
        `Adjustment would result in negative stock for product: ${product.name}. Current: ${product.currentStock}, Adjustment: ${quantity}`
      );
    }

    product.currentStock = newStock;
    await product.save({ transaction: t });

    const transaction = await StockTransaction.create(
      {
        productId,
        userId: req.user.id,
        type: "adjustment",
        quantity,
        variantUsed: variantUsed || null,
        sourceDestination: "Adjustment",
        notes:
          notes ||
          (quantity > 0
            ? "Stock increased due to adjustment"
            : "Stock decreased due to adjustment"),
      },
      { transaction: t }
    );

    await ActivityLog.create({
      userId: req.user.id,
      username: req.user.username,
      role: req.user.role,
      action: "Stock Adjustment",
      details: {
        productId: product.id,
        productName: product.name,
        adjustedQuantity: quantity,
        newStock: newStock,
        reason: notes,
        variant: variantUsed,
      },
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
    });

    await t.commit();

    invalidateCacheByPrefix("/api/products");
    invalidateCacheByPrefix("/api/stock/transactions");
    invalidateCache(`/api/products/${productId}`);

    res
      .status(201)
      .json({ message: "Stock Adjustment recorded successfully", transaction });
  } catch (error) {
    await t.rollback();
    next(error);
  }
};

const getAllStockTransactions = async (req, res, next) => {
  try {
    const transactions = await StockTransaction.findAll({
      include: [
        { model: Product, as: "product", attributes: ["name", "code"] },
        { model: User, as: "user", attributes: ["username"] },
      ],
      order: [["transactionDate", "DESC"]],
    });
    res.status(200).json(transactions);
  } catch (error) {
    next(error);
  }
};

const getStockTransactionsByProduct = async (req, res, next) => {
  const { productId } = req.params;
  try {
    const transactions = await StockTransaction.findAll({
      where: { productId },
      include: [
        { model: Product, as: "product", attributes: ["name", "code"] },
        { model: User, as: "user", attributes: ["username"] },
      ],
      order: [["transactionDate", "DESC"]],
    });
    res.status(200).json(transactions);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  stockIn,
  stockOut,
  stockAdjustment,
  getAllStockTransactions,
  getStockTransactionsByProduct,
};
