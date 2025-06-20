const mongoose = require("mongoose");

const activityLogSchema = new mongoose.Schema(
  {
    userId: {
      type: Number, // Reference to MySQL User ID (for cross-database linking)
      required: false, // Can be null for unauthenticated actions like failed login attempts
    },
    username: {
      type: String,
      required: true,
    },
    role: {
      type: String, // 'admin', 'staff', 'guest'
      required: true,
    },
    action: {
      type: String, // e.g., 'Login Success', 'Add Product', 'Update User', 'Stock In', 'Delete Category'
      required: true,
    },
    details: {
      type: mongoose.Schema.Types.Mixed, // Flexible field for any additional details (e.g., { productId: 123, oldPrice: 10, newPrice: 12 })
      default: {}, // Default to an empty object
    },
    timestamp: {
      type: Date,
      default: Date.now, // Automatically sets to current timestamp
      index: true, // Index for faster time-based queries
    },
    ipAddress: {
      type: String,
      required: false,
    },
    userAgent: {
      type: String,
      required: false,
    },
  },
  {
    timestamps: true, // Mongoose will automatically add `createdAt` and `updatedAt` fields
  }
);

const ActivityLog = mongoose.model("ActivityLog", activityLogSchema);

module.exports = ActivityLog;
