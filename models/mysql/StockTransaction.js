const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const StockTransaction = sequelize.define(
    "StockTransaction",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      productId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "Products", // This is the table name
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT", // Prevent deleting product if transactions exist
      },
      userId: {
        // User who performed the transaction
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "Users", // This is the table name
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT", // Prevent deleting user if transactions exist
      },
      type: {
        // 'in' (stock received), 'out' (stock issued/sold), 'adjustment' (correction)
        type: DataTypes.ENUM("in", "out", "adjustment"),
        allowNull: false,
      },
      quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          isValidQuantity(value) {
            if ((this.type === "in" || this.type === "out") && value < 1) {
              throw new Error("Quantity must be at least 1 for stock in/out.");
            }
            // Untuk adjustment, boleh negatif atau positif, tapi tidak boleh 0
            if (this.type === "adjustment" && value === 0) {
              throw new Error("Quantity cannot be zero for adjustment.");
            }
          },
        },
      },
      variantUsed: {
        // E.g., "Red-Large", if applicable. Allows tracking of specific variant stock movement.
        type: DataTypes.STRING,
        allowNull: true,
      },
      sourceDestination: {
        // For 'in': Supplier Name; for 'out': Customer Name/Order ID; for 'adjustment': 'System'
        type: DataTypes.STRING,
        allowNull: true,
      },
      notes: {
        type: DataTypes.TEXT,
        allowNull: true, // Additional details for the transaction
      },
      transactionDate: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW, // Automatically sets to current timestamp
      },
    },
    {
      tableName: "stock_transactions",
      timestamps: true,
      indexes: [
        { fields: ["productId"] },
        { fields: ["userId"] },
        { fields: ["type"] },
        { fields: ["transactionDate"] },
      ],
    }
  );

  return StockTransaction;
};
