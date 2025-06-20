const { sequelize } = require("../config/db.mysql");
const Category = require("../models/mysql/Category")(sequelize);
const Product = require("../models/mysql/Product")(sequelize); // To check for linked products
const ActivityLog = require("../models/mongo/ActivityLog");
const {
  invalidateCacheByPrefix,
  invalidateCache,
} = require("../middleware/cacheMiddleware");

const getAllCategories = async (req, res, next) => {
  try {
    const categories = await Category.findAll();
    res.status(200).json(categories);
  } catch (error) {
    next(error);
  }
};

const getCategoryById = async (req, res, next) => {
  try {
    const category = await Category.findByPk(req.params.id);

    if (!category) {
      res.status(404);
      throw new Error("Category not found");
    }
    res.status(200).json(category);
  } catch (error) {
    next(error);
  }
};

// @desc    Add a new category
// @route   POST /api/categories
// @access  Private (Admin)
const addCategory = async (req, res, next) => {
  const { name, description } = req.body;

  if (!name) {
    res.status(400);
    throw new Error("Category name is required");
  }

  const t = await sequelize.transaction();
  try {
    const newCategory = await Category.create(
      { name, description },
      { transaction: t }
    );

    await ActivityLog.create({
      userId: req.user.id,
      username: req.user.username,
      role: req.user.role,
      action: "Add Category",
      details: { categoryId: newCategory.id, categoryName: newCategory.name },
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
    });

    await t.commit();
    invalidateCacheByPrefix("/api/categories"); // Invalidate category list cache
    res.status(201).json(newCategory);
  } catch (error) {
    await t.rollback();
    // Handle unique constraint error specifically
    if (error.name === "SequelizeUniqueConstraintError") {
      res.status(400);
      error.message = "Category name must be unique.";
    }
    next(error);
  }
};

// @desc    Update a category
// @route   PUT /api/categories/:id
// @access  Private (Admin)
const updateCategory = async (req, res, next) => {
  const { name, description } = req.body;
  const categoryId = req.params.id;

  const t = await sequelize.transaction();
  try {
    let category = await Category.findByPk(categoryId, { transaction: t });

    if (!category) {
      res.status(404);
      throw new Error("Category not found");
    }

    const oldCategoryDetails = { ...category.dataValues }; // Capture old details for log

    category.name = name || category.name;
    category.description =
      description !== undefined ? description : category.description; // Allow setting description to empty string or null

    await category.save({ transaction: t });

    await ActivityLog.create({
      userId: req.user.id,
      username: req.user.username,
      role: req.user.role,
      action: "Update Category",
      details: {
        categoryId: category.id,
        categoryName: category.name,
        oldDetails: {
          name: oldCategoryDetails.name,
          description: oldCategoryDetails.description,
        },
        newDetails: { name: category.name, description: category.description },
      },
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
    });

    await t.commit();
    invalidateCacheByPrefix("/api/categories"); // Invalidate category list cache
    invalidateCache(`/api/categories/${categoryId}`); // Invalidate specific category cache
    res.status(200).json(category);
  } catch (error) {
    await t.rollback();
    if (error.name === "SequelizeUniqueConstraintError") {
      res.status(400);
      error.message = "Category name must be unique.";
    }
    next(error);
  }
};

// @desc    Delete a category
// @route   DELETE /api/categories/:id
// @access  Private (Admin)
const deleteCategory = async (req, res, next) => {
  const categoryId = req.params.id;

  const t = await sequelize.transaction();
  try {
    const category = await Category.findByPk(categoryId, { transaction: t });

    if (!category) {
      res.status(404);
      throw new Error("Category not found");
    }

    // Check if any products are linked to this category
    // This relies on the association being correctly set up in server.js
    const productsCount = await Product.count({
      where: { categoryId: categoryId },
      transaction: t,
    });
    if (productsCount > 0) {
      res.status(400);
      throw new Error(
        "Cannot delete category with associated products. Reassign products to another category or delete them first."
      );
    }

    await category.destroy({ transaction: t });

    await ActivityLog.create({
      userId: req.user.id,
      username: req.user.username,
      role: req.user.role,
      action: "Delete Category",
      details: { categoryId: category.id, categoryName: category.name },
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
    });

    await t.commit();
    invalidateCacheByPrefix("/api/categories"); // Invalidate category list cache
    invalidateCache(`/api/categories/${categoryId}`); // Invalidate specific category cache
    res.status(200).json({ message: "Category removed successfully" });
  } catch (error) {
    await t.rollback();
    next(error);
  }
};

module.exports = {
  getAllCategories,
  getCategoryById,
  addCategory,
  updateCategory,
  deleteCategory,
};
