const { DataTypes } = require("sequelize");
const bcrypt = require("bcryptjs");

module.exports = (sequelize) => {
  const User = sequelize.define(
    "User",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true, // Ensures usernames are unique
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      role: {
        type: DataTypes.ENUM("admin", "staff"), // Defines allowed roles
        defaultValue: "staff", // Default role for new users
        allowNull: false,
      },
    },
    {
      tableName: "users", // Explicitly define table name
      timestamps: true, // Adds createdAt and updatedAt fields automatically
      hooks: {
        // Lifecycle hook: Before creating a new user, hash the password
        beforeCreate: async (user) => {
          const salt = await bcrypt.genSalt(10); // Generate a salt
          user.password = await bcrypt.hash(user.password, salt); // Hash the password
        },
        // Lifecycle hook: Before updating a user, re-hash password if it has changed
        beforeUpdate: async (user) => {
          if (user.changed("password")) {
            // Check if the password field was modified
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(user.password, salt);
          }
        },
      },
    }
  );

  // Instance method to compare an entered password with the hashed password stored in the database
  User.prototype.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
  };

  return User;
};
