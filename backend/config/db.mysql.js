const { Sequelize } = require("sequelize");
require("dotenv").config();

const sequelize = new Sequelize(
  process.env.MYSQL_DATABASE,
  process.env.MYSQL_USER,
  process.env.MYSQL_PASSWORD,
  {
    host: process.env.MYSQL_HOST,
    dialect: "mysql",
    logging: false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  }
);

const connectMySQL = async () => {
  try {
    await sequelize.authenticate();
    console.log("MySQL Connection has been established successfully.");

    await sequelize.sync();
    console.log("All MySQL models were synchronized successfully.");
  } catch (error) {
    console.error("Unable to connect to the MySQL database:", error);

    process.exit(1);
  }
};

module.exports = { sequelize, connectMySQL };
