const { sequelize } = require("../config/db.mysql");
const User = require("../models/mysql/User")(sequelize);
const ActivityLog = require("../models/mongo/ActivityLog");
const {
  invalidateCacheByPrefix,
  invalidateCache,
} = require("../middleware/cacheMiddleware"); // Assuming user list might be cached

// @desc    Get all users
// @route   GET /api/users
// @access  Private (Admin)
const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ["password"] }, // EXCLUDE PASSWORDS FOR SECURITY
    });
    res.status(200).json(users);
  } catch (error) {
    next(error);
  }
};

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private (Admin)
const getUserById = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: { exclude: ["password"] }, // EXCLUDE PASSWORDS
    });

    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }
    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new user (typically Staff account, Admin can create both)
// @route   POST /api/users
// @access  Private (Admin)
const createUser = async (req, res, next) => {
  const { username, password, role } = req.body;

  // Basic validation
  if (!username || !password || !role) {
    res.status(400);
    throw new Error("Please enter all fields: username, password, role.");
  }

  // Validate role type
  if (!["admin", "staff"].includes(role)) {
    res.status(400);
    throw new Error('Invalid role specified. Role must be "admin" or "staff".');
  }

  // Optional: Add logic to restrict an admin from creating another admin
  // if (req.user.role !== 'admin' && role === 'admin') {
  //     res.status(403);
  //     throw new Error('Only super-admins can create new admin accounts.');
  // }

  const t = await sequelize.transaction(); // Start transaction
  try {
    // Check if username already exists
    const userExists = await User.findOne({ where: { username } });
    if (userExists) {
      res.status(400);
      throw new Error("User with this username already exists.");
    }

    // Create new user (password hashing handled by User model hook)
    const newUser = await User.create(
      { username, password, role },
      { transaction: t }
    );

    // Log activity to MongoDB
    await ActivityLog.create({
      userId: req.user.id,
      username: req.user.username,
      role: req.user.role,
      action: "Create User",
      details: {
        newUserId: newUser.id,
        newUsername: newUser.username,
        newRole: newUser.role,
      },
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
    });

    await t.commit(); // Commit transaction
    invalidateCacheByPrefix("/api/users"); // Invalidate user list cache
    res.status(201).json({
      id: newUser.id,
      username: newUser.username,
      role: newUser.role,
    });
  } catch (error) {
    await t.rollback(); // Rollback on error
    next(error);
  }
};

// @desc    Update user details (Admin can update anyone)
// @route   PUT /api/users/:id
// @access  Private (Admin)
const updateUser = async (req, res, next) => {
  const { username, password, role } = req.body;
  const userId = req.params.id;

  const t = await sequelize.transaction();
  try {
    let user = await User.findByPk(userId, { transaction: t });

    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }

    // Capture old details for logging
    const oldUserDetails = { ...user.dataValues };

    // If username is being changed, check for uniqueness against other users
    if (username && username !== user.username) {
      const userExists = await User.findOne({ where: { username } });
      if (userExists && userExists.id !== user.id) {
        res.status(400);
        throw new Error("Username already taken by another user.");
      }
      user.username = username;
    }

    // Only update password if a new password is provided (hashing handled by model hook)
    if (password) {
      user.password = password;
    }

    // Only allow admin to change role
    if (role && req.user.role === "admin") {
      if (!["admin", "staff"].includes(role)) {
        res.status(400);
        throw new Error(
          'Invalid role specified. Role must be "admin" or "staff".'
        );
      }
      user.role = role;
    } else if (role && req.user.role !== "admin") {
      res.status(403);
      throw new Error("Only administrators can change user roles.");
    }

    await user.save({ transaction: t }); // Save changes

    await ActivityLog.create({
      userId: req.user.id,
      username: req.user.username,
      role: req.user.role,
      action: "Update User",
      details: {
        targetUserId: user.id,
        targetUsername: user.username,
        oldDetails: {
          username: oldUserDetails.username,
          role: oldUserDetails.role,
        },
        newDetails: { username: user.username, role: user.role },
      },
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
    });

    await t.commit();
    invalidateCacheByPrefix("/api/users"); // Invalidate user list cache
    invalidateCache(`/api/users/${userId}`); // Invalidate specific user cache
    res.status(200).json({
      id: user.id,
      username: user.username,
      role: user.role,
    });
  } catch (error) {
    await t.rollback();
    next(error);
  }
};

// @desc    Reset user password (Admin only)
// @route   PUT /api/users/:id/reset-password
// @access  Private (Admin)
const resetUserPassword = async (req, res, next) => {
  const { newPassword } = req.body;
  const userId = req.params.id;

  if (!newPassword) {
    res.status(400);
    throw new Error("New password is required.");
  }

  const t = await sequelize.transaction();
  try {
    let user = await User.findByPk(userId, { transaction: t });

    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }

    // Update password (model hook will hash it before saving)
    user.password = newPassword;
    await user.save({ transaction: t });

    await ActivityLog.create({
      userId: req.user.id,
      username: req.user.username,
      role: req.user.role,
      action: "Reset User Password",
      details: { targetUserId: user.id, targetUsername: user.username },
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
    });

    await t.commit();
    invalidateCacheByPrefix("/api/users");
    invalidateCache(`/api/users/${userId}`);
    res.status(200).json({ message: "User password reset successfully" });
  } catch (error) {
    await t.rollback();
    next(error);
  }
};

// @desc    Delete a user
// @route   DELETE /api/users/:id
// @access  Private (Admin)
const deleteUser = async (req, res, next) => {
  const userId = req.params.id;

  const t = await sequelize.transaction();
  try {
    const userToDelete = await User.findByPk(userId, { transaction: t });

    if (!userToDelete) {
      res.status(404);
      throw new Error("User not found");
    }

    // Prevent an admin from deleting their own account
    if (req.user.id === userToDelete.id) {
      res.status(400);
      throw new Error("You cannot delete your own account.");
    }

    // Optionally, prevent deletion if the user has recorded stock transactions
    const stockTransactionsCount = await userToDelete.countTransactions({
      transaction: t,
    });
    if (stockTransactionsCount > 0) {
      res.status(400);
      throw new Error(
        "Cannot delete user with existing stock transactions. Inactivate user instead."
      );
    }

    await userToDelete.destroy({ transaction: t }); // Delete the user

    await ActivityLog.create({
      userId: req.user.id,
      username: req.user.username,
      role: req.user.role,
      action: "Delete User",
      details: {
        deletedUserId: userToDelete.id,
        deletedUsername: userToDelete.username,
      },
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
    });

    await t.commit();
    invalidateCacheByPrefix("/api/users");
    invalidateCache(`/api/users/${userId}`);
    res.status(200).json({ message: "User removed successfully" });
  } catch (error) {
    await t.rollback();
    next(error);
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  resetUserPassword,
  deleteUser,
};
