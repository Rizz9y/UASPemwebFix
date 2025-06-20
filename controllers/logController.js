const ActivityLog = require("../models/mongo/ActivityLog");

const getAllLogs = async (req, res, next) => {
  try {
    const logs = await ActivityLog.find({}).sort({ timestamp: -1 }).limit(100);
    res.status(200).json(logs);
  } catch (error) {
    next(error);
  }
};

const getUserLogs = async (req, res, next) => {
  const { userId } = req.params;
  try {
    const logs = await ActivityLog.find({ userId: parseInt(userId) })
      .sort({ timestamp: -1 })
      .limit(50);
    res.status(200).json(logs);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllLogs,
  getUserLogs,
};
