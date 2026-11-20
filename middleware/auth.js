const User = require("../models/User");

exports.verifyAdmin = async (req, res, next) => {
  try {
    const idUser = req.headers["x-user-id"] || req.query.id_user || req.body.id_user;

    if (!idUser) {
      return res.status(401).json({
        success: false,
        message: "Akses ditolak: ID Admin tidak disertakan"
      });
    }

    const user = await User.findOne({ id_user: String(idUser) });
    if (!user || user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Akses ditolak: Hanya Admin yang diizinkan"
      });
    }

    req.admin = user;
    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};