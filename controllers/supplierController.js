const { sequelize } = require("../config/db.mysql");
const Supplier = require("../models/mysql/Supplier")(sequelize);
const Product = require("../models/mysql/Product")(sequelize); // To check for linked products
const ActivityLog = require("../models/mongo/ActivityLog");
const {
  invalidateCacheByPrefix,
  invalidateCache,
} = require("../middleware/cacheMiddleware");

// @desc    Get all suppliers
// @route   GET /api/suppliers
// @access  Private (Admin, Staff)
const getAllSuppliers = async (req, res, next) => {
  try {
    const suppliers = await Supplier.findAll();
    res.status(200).json(suppliers);
  } catch (error) {
    next(error);
  }
};

// @desc    Get supplier by ID
// @route   GET /api/suppliers/:id
// @access  Private (Admin, Staff)
const getSupplierById = async (req, res, next) => {
  try {
    const supplier = await Supplier.findByPk(req.params.id);

    if (!supplier) {
      res.status(404);
      throw new Error("Supplier not found");
    }
    res.status(200).json(supplier);
  } catch (error) {
    next(error);
  }
};

// @desc    Add a new supplier
// @route   POST /api/suppliers
// @access  Private (Admin)
const addSupplier = async (req, res, next) => {
  const { name, contactPerson, phoneNumber, email, address } = req.body;

  if (!name) {
    res.status(400);
    throw new Error("Supplier name is required");
  }

  const t = await sequelize.transaction();
  try {
    const newSupplier = await Supplier.create(
      { name, contactPerson, phoneNumber, email, address },
      { transaction: t }
    );

    await ActivityLog.create({
      userId: req.user.id,
      username: req.user.username,
      role: req.user.role,
      action: "Add Supplier",
      details: { supplierId: newSupplier.id, supplierName: newSupplier.name },
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
    });

    await t.commit();
    invalidateCacheByPrefix("/api/suppliers"); // Invalidate supplier list cache
    res.status(201).json(newSupplier);
  } catch (error) {
    await t.rollback();
    if (error.name === "SequelizeUniqueConstraintError") {
      res.status(400);
      error.message = "Supplier name must be unique.";
    }
    next(error);
  }
};

// @desc    Update a supplier
// @route   PUT /api/suppliers/:id
// @access  Private (Admin)
const updateSupplier = async (req, res, next) => {
  const { name, contactPerson, phoneNumber, email, address } = req.body;
  const supplierId = req.params.id;

  const t = await sequelize.transaction();
  try {
    let supplier = await Supplier.findByPk(supplierId, { transaction: t });

    if (!supplier) {
      res.status(404);
      throw new Error("Supplier not found");
    }

    const oldSupplierDetails = { ...supplier.dataValues };

    supplier.name = name || supplier.name;
    supplier.contactPerson =
      contactPerson !== undefined ? contactPerson : supplier.contactPerson;
    supplier.phoneNumber =
      phoneNumber !== undefined ? phoneNumber : supplier.phoneNumber;
    supplier.email = email !== undefined ? email : supplier.email;
    supplier.address = address !== undefined ? address : supplier.address;

    await supplier.save({ transaction: t });

    await ActivityLog.create({
      userId: req.user.id,
      username: req.user.username,
      role: req.user.role,
      action: "Update Supplier",
      details: {
        supplierId: supplier.id,
        supplierName: supplier.name,
        oldDetails: {
          name: oldSupplierDetails.name,
          contactPerson: oldSupplierDetails.contactPerson,
          email: oldSupplierDetails.email,
        },
        newDetails: {
          name: supplier.name,
          contactPerson: supplier.contactPerson,
          email: supplier.email,
        },
      },
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
    });

    await t.commit();
    invalidateCacheByPrefix("/api/suppliers");
    invalidateCache(`/api/suppliers/${supplierId}`);
    res.status(200).json(supplier);
  } catch (error) {
    await t.rollback();
    if (error.name === "SequelizeUniqueConstraintError") {
      res.status(400);
      error.message = "Supplier name must be unique.";
    } else if (
      error.name === "SequelizeValidationError" &&
      error.errors[0]?.path === "email"
    ) {
      res.status(400);
      error.message = "Invalid email format.";
    }
    next(error);
  }
};

// @desc    Delete a supplier
// @route   DELETE /api/suppliers/:id
// @access  Private (Admin)
const deleteSupplier = async (req, res, next) => {
  const supplierId = req.params.id;

  const t = await sequelize.transaction();
  try {
    const supplier = await Supplier.findByPk(supplierId, { transaction: t });

    if (!supplier) {
      res.status(404);
      throw new Error("Supplier not found");
    }

    // Check if any products are linked to this supplier
    const productsCount = await Product.count({
      where: { supplierId: supplierId },
      transaction: t,
    });
    if (productsCount > 0) {
      res.status(400);
      throw new Error(
        "Cannot delete supplier with associated products. Reassign products to another supplier or delete them first."
      );
    }

    await supplier.destroy({ transaction: t });

    await ActivityLog.create({
      userId: req.user.id,
      username: req.user.username,
      role: req.user.role,
      action: "Delete Supplier",
      details: { supplierId: supplier.id, supplierName: supplier.name },
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
    });

    await t.commit();
    invalidateCacheByPrefix("/api/suppliers");
    invalidateCache(`/api/suppliers/${supplierId}`);
    res.status(200).json({ message: "Supplier removed successfully" });
  } catch (error) {
    await t.rollback();
    next(error);
  }
};

module.exports = {
  getAllSuppliers,
  getSupplierById,
  addSupplier,
  updateSupplier,
  deleteSupplier,
};
