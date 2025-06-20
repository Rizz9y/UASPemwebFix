const jwt = require("jsonwebtoken");
const { secret, expiresIn } = require("../config/jwt");
const { sequelize } = require("../config/db.mysql");
const User = require("../models/mysql/User")(sequelize);
const ActivityLog = require("../models/mongo/ActivityLog");

const generateToken = (id, role) => {
  return jwt.sign({ id, role }, secret, { expiresIn });
};

const loginUser = async (req, res, next) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ where: { username } });

    if (!user) {
      await ActivityLog.create({
        userId: null,
        username,
        role: "guest",
        action: "Login Failed",
        details: { reason: "User not found" },
        ipAddress: req.ip,
        userAgent: req.headers["user-agent"],
      });
      res.status(401);
      throw new Error("Invalid credentials (username or password incorrect)");
    }

    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      await ActivityLog.create({
        userId: user.id,
        username: user.username,
        role: user.role,
        action: "Login Failed",
        details: { reason: "Incorrect password" },
        ipAddress: req.ip,
        userAgent: req.headers["user-agent"],
      });
      res.status(401);
      throw new Error("Invalid credentials (username or password incorrect)");
    }

    const token = generateToken(user.id, user.role);

    await ActivityLog.create({
      userId: user.id,
      username: user.username,
      role: user.role,
      action: "Login Success",
      details: {},
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
    });

    res.status(200).json({
      id: user.id,
      username: user.username,
      role: user.role,
      token,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { loginUser };
