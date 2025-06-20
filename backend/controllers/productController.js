const { sequelize, Product, Category, Supplier } = require("../models/mysql");
const ActivityLog = require("../models/mongo/ActivityLog");
const {
  invalidateCacheByPrefix,
  invalidateCache,
} = require("../middleware/cacheMiddleware");
const path = require("path");
const fs = require("fs");

const deletePhysicalFile = (filePath) => {
  if (filePath && filePath.startsWith("/uploads/")) {
    const fullPath = path.join(__dirname, "../../", filePath);
    fs.unlink(fullPath, (err) => {
      if (err) console.error("Error deleting physical file:", err);
    });
  }
};

const getAllProducts = async (req, res, next) => {
  try {
    const products = await Product.findAll({
      include: [
        { model: Category, as: "category", attributes: ["name"] },
        { model: Supplier, as: "supplier", attributes: ["name"] },
      ],
    });
    res.status(200).json(products);
  } catch (error) {
    next(error);
  }
};

const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findByPk(req.params.id, {
      include: [
        { model: Category, as: "category", attributes: ["name"] },
        { model: Supplier, as: "supplier", attributes: ["name"] },
      ],
    });

    if (!product) {
      res.status(404);
      throw new Error("Product not found");
    }
    res.status(200).json(product);
  } catch (error) {
    next(error);
  }
};

const addProduct = async (req, res, next) => {
  const { name, code, description, price, categoryId, supplierId, color } =
    req.body;
  const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

  const t = await sequelize.transaction();
  try {
    if (!name || !code || !price) {
      res.status(400);
      throw new Error("Please include all required fields: name, code, price.");
    }

    if (categoryId) {
      const categoryExists = await Category.findByPk(categoryId);
      if (!categoryExists) {
        res.status(400);
        throw new Error(
          "Invalid category ID provided. Category does not exist."
        );
      }
    }

    if (supplierId) {
      const supplierExists = await Supplier.findByPk(supplierId);
      if (!supplierExists) {
        res.status(400);
        throw new Error(
          "Invalid supplier ID provided. Supplier does not exist."
        );
      }
    }

    const newProduct = await Product.create(
      {
        name,
        code,
        description,
        price,
        categoryId: categoryId || null,
        supplierId: supplierId || null,
        color: color || null,
        imageUrl,
        currentStock: 0,
      },
      { transaction: t }
    );

    await ActivityLog.create({
      userId: req.user.id,
      username: req.user.username,
      role: req.user.role,
      action: "Add Product",
      details: {
        productId: newProduct.id,
        productName: newProduct.name,
        code: newProduct.code,
        color: newProduct.color,
        imageUrl: newProduct.imageUrl,
      },
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
    });

    await t.commit();
    invalidateCacheByPrefix("/api/products");
    res.status(201).json(newProduct);
  } catch (error) {
    await t.rollback();

    if (req.file && req.file.path) {
      fs.unlink(req.file.path, (err) => {
        if (err)
          console.error("Error deleting uploaded file on add error:", err);
      });
    }

    if (error.name === "SequelizeUniqueConstraintError") {
      res.status(400);
      error.message = "Product with this code already exists.";
    } else if (error.name === "SequelizeValidationError") {
      const validationErrors = error.errors.map((err) => err.message);
      res.status(400);
      error.message = validationErrors.join(", ");
    }
    next(error);
  }
};

const updateProduct = async (req, res, next) => {
  const { name, code, description, price, categoryId, supplierId, color } =
    req.body;
  const productId = req.params.id;

  const newUploadedImagePath = req.file
    ? `/uploads/${req.file.filename}`
    : undefined;

  const removeExistingImageFlag =
    req.body.removeImage === "true" ||
    (req.file === undefined && req.body.imageUrl === "null");
  const t = await sequelize.transaction();
  try {
    let product = await Product.findByPk(productId, { transaction: t });

    if (!product) {
      res.status(404);
      throw new Error("Product not found");
    }

    if (categoryId !== undefined && categoryId !== null) {
      const categoryExists = await Category.findByPk(categoryId);
      if (!categoryExists) {
        res.status(400);
        throw new Error(
          "Invalid category ID provided. Category does not exist."
        );
      }
    }
    if (supplierId !== undefined && supplierId !== null) {
      const supplierExists = await Supplier.findByPk(supplierId);
      if (!supplierExists) {
        res.status(400);
        throw new Error(
          "Invalid supplier ID provided. Supplier does not exist."
        );
      }
    }

    const oldProductDetails = { ...product.dataValues };

    product.name = name !== undefined ? name : product.name;
    if (code && code !== product.code) {
      const existingProductWithCode = await Product.findOne({
        where: { code },
      });
      if (
        existingProductWithCode &&
        existingProductWithCode.id !== product.id
      ) {
        res.status(400);
        throw new Error("Product with this code already exists.");
      }
      product.code = code;
    }
    product.description =
      description !== undefined ? description : product.description;
    product.price = price !== undefined ? price : product.price;
    product.categoryId =
      categoryId !== undefined ? categoryId : product.categoryId;
    product.supplierId =
      supplierId !== undefined ? supplierId : product.supplierId;
    product.color = color !== undefined ? color || null : product.color;

    let oldImagePathToBeDeleted = null;

    if (newUploadedImagePath !== undefined) {
      oldImagePathToBeDeleted = product.imageUrl;
      product.imageUrl = newUploadedImagePath;
    } else if (removeExistingImageFlag && product.imageUrl) {
      oldImagePathToBeDeleted = product.imageUrl;
      product.imageUrl = null;
    }

    await product.save({ transaction: t });

    deletePhysicalFile(oldImagePathToBeDeleted);

    await ActivityLog.create({
      userId: req.user.id,
      username: req.user.username,
      role: req.user.role,
      action: "Update Product",
      details: {
        productId: product.id,
        productName: product.name,
        oldDetails: oldProductDetails,
        newDetails: product.dataValues,
      },
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
    });

    await t.commit();
    invalidateCacheByPrefix("/api/products");
    invalidateCache(`/api/products/${productId}`);

    res.status(200).json(product);
  } catch (error) {
    await t.rollback();

    if (req.file && req.file.path) {
      fs.unlink(req.file.path, (err) => {
        if (err)
          console.error(
            "Error deleting newly uploaded file on update error:",
            err
          );
      });
    }
    if (error.name === "SequelizeUniqueConstraintError") {
      res.status(400);
      error.message = "Product with this code already exists.";
    } else if (error.name === "SequelizeValidationError") {
      const validationErrors = error.errors.map((err) => err.message);
      res.status(400);
      error.message = validationErrors.join(", ");
    }
    next(error);
  }
};

const deleteProduct = async (req, res, next) => {
  const productId = req.params.id;

  const t = await sequelize.transaction();
  try {
    const product = await Product.findByPk(productId, { transaction: t });

    if (!product) {
      res.status(404);
      throw new Error("Product not found");
    }

    const stockTransactionsCount = await product.countStockTransactions({
      transaction: t,
    });
    if (stockTransactionsCount > 0) {
      res.status(400);
      throw new Error(
        "Cannot delete product with existing stock transactions. Archive or disable instead."
      );
    }

    const imageUrlToDelete = product.imageUrl;
    await product.destroy({ transaction: t });

    deletePhysicalFile(imageUrlToDelete);

    await ActivityLog.create({
      userId: req.user.id,
      username: req.user.username,
      role: req.user.role,
      action: "Delete Product",
      details: {
        productId: product.id,
        productName: product.name,
        code: product.code,
      },
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
    });

    await t.commit();
    invalidateCacheByPrefix("/api/products");
    invalidateCache(`/api/products/${productId}`);

    res.status(200).json({ message: "Product removed successfully" });
  } catch (error) {
    await t.rollback();
    next(error);
  }
};

module.exports = {
  getAllProducts,
  getProductById,
  addProduct,
  updateProduct,
  deleteProduct,
};
