const mongoose = require("mongoose");
const User = require("../models/User");

// Tambah User Baru (Register)
exports.createUser = async (req, res) => {
  try {
    const { username, nama, email, no_telp, password, alamat } = req.body;

    if (!username || !nama || !email || !no_telp || !password || !alamat) {
      return res.status(400).json({
        success: false,
        message: "Semua data user wajib diisi"
      });
    }

    // Auto Increment ID User
    const counters = mongoose.connection.collection("counters");

    const counter = await counters.findOneAndUpdate(
      { _id: "user" },
      { $inc: { seq: 1 } },
      { upsert: true, returnDocument: "after" }
    );

    if (counter.seq > 9999) {
      return res.status(400).json({
        success: false,
        message: "Batas ID User telah tercapai"
      });
    }

    const user = await User.create({
      id_user: String(counter.seq),
      username,
      nama,
      email,
      no_telp,
      password,
      alamat
    });

    const userData = user.toObject();
    delete userData.password;

    res.status(201).json({
      success: true,
      message: "User berhasil ditambahkan",
      data: userData
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Ambil Semua Data User
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");

    res.status(200).json({
      success: true,
      total: users.length,
      data: users
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Cari User Berdasarkan Nama
exports.getUserByName = async (req, res) => {
  try {
    const nama = req.query.nama;

    if (!nama) {
      return res.status(400).json({
        success: false,
        message: "Nama user harus diisi"
      });
    }

    const users = await User.find({
      nama: { $regex: nama, $options: "i" }
    }).select("-password");

    res.status(200).json({
      success: true,
      total: users.length,
      data: users
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Cari User Berdasarkan Email
exports.getUserByEmail = async (req, res) => {
  try {
    const user = await User.findOne({
      email: req.params.email
    }).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User tidak ditemukan"
      });
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Cari User Berdasarkan ID
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findOne({
      id_user: req.params.id_user
    }).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User tidak ditemukan"
      });
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Edit Data User
exports.updateUser = async (req, res) => {
  try {
    const user = await User.findOne({
      id_user: req.params.id_user
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User tidak ditemukan"
      });
    }

    const { username, nama, email, no_telp, password, alamat } = req.body;

    if (username !== undefined) user.username = username;
    if (nama !== undefined) user.nama = nama;
    if (email !== undefined) user.email = email;
    if (no_telp !== undefined) user.no_telp = no_telp;
    if (password !== undefined) user.password = password;
    if (alamat !== undefined) user.alamat = alamat;

    await user.save();

    const userData = user.toObject();
    delete userData.password;

    res.status(200).json({
      success: true,
      message: "Data user berhasil diperbarui",
      data: userData
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Hapus Data User
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findOneAndDelete({
      id_user: req.params.id_user
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User tidak ditemukan"
      });
    }

    res.status(200).json({
      success: true,
      message: "User berhasil dihapus"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
