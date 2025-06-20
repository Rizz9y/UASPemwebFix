const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Product = sequelize.define(
    "Product",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      code: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true, // Product codes must be unique
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      price: {
        type: DataTypes.DECIMAL(10, 2), // Stores price with 2 decimal places
        allowNull: false,
        defaultValue: 0.0,
        validate: {
          isDecimal: true,
          min: 0, // Harga tidak boleh negatif
        },
      },
      currentStock: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        validate: {
          min: 0,
        },
      },
      color: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      // === PERUBAHAN: imageUrl tanpa validasi URL, hanya string biasa untuk path ===
      imageUrl: {
        // Kolom untuk menyimpan path file gambar relatif
        type: DataTypes.STRING,
        allowNull: true, // Path gambar bisa null (jika tidak ada gambar)
        // Tidak ada validasi isURL lagi di sini
      },
      categoryId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "Categories",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      supplierId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "Suppliers",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
    },
    {
      tableName: "products",
      timestamps: true,
      indexes: [
        {
          unique: true,
          fields: ["code"],
        },
        {
          fields: ["name"],
        },
        {
          fields: ["categoryId"],
        },
        {
          fields: ["supplierId"],
        },
        {
          fields: ["color"],
        },
      ],
    }
  );

  return Product;
};
