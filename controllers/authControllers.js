const bcrypt = require("bcryptjs");
const User = require("../models/User");

// Login User & Admin
exports.login = async (req, res) => {
  try {
    const { email, username, password } = req.body;

    if ((!email && !username) || !password) {
      return res.status(400).json({
        success: false,
        message: "Email/username dan password wajib diisi"
      });
    }

    // Bisa login pakai email atau username
    const user = await User.findOne(
      email ? { email: email.trim() } : { username: username.trim() }
    );

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Akun tidak ditemukan"
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Password salah"
      });
    }

    const userData = user.toObject();
    delete userData.password;

    res.status(200).json({
      success: true,
      message: `Login berhasil sebagai ${userData.role || "customer"}`,
      data: userData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};