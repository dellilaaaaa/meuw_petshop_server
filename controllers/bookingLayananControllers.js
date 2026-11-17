
const mongoose = require("mongoose");
const BookingLayanan = require("../models/BookingLayanan");
const DetailLayanan = require("../models/DetailLayanan");

// Fungsi validasi booking
const validateBooking = async (data) => {
  const {
    id_detail_layanan,
    tanggal_mulai,
    jam_mulai,
    tanggal_selesai,
    status_booking
  } = data;

  if (
    !id_detail_layanan ||
    !tanggal_mulai ||
    !jam_mulai ||
    !tanggal_selesai ||
    !status_booking ||
    !status_booking.trim()
  ) {
    throw new Error("Semua data booking harus diisi");
  }

  if (status_booking.trim().length > 20) {
    throw new Error("Status booking maksimal 20 karakter");
  }

  // Validasi Detail Layanan
  const detailLayanan = await DetailLayanan.findOne({
    id_detail_layanan
  });

  if (!detailLayanan) {
    throw new Error("Detail layanan tidak ditemukan");
  }

  // Validasi format jam HH:mm
  const formatJam = /^([01]\d|2[0-3]):[0-5]\d$/;

  if (!formatJam.test(jam_mulai)) {
    throw new Error("Format jam mulai harus HH:mm");
  }

  // Validasi tanggal
  const tanggalMulai = new Date(tanggal_mulai);
  const tanggalSelesai = new Date(tanggal_selesai);

  if (
    Number.isNaN(tanggalMulai.getTime()) ||
    Number.isNaN(tanggalSelesai.getTime())
  ) {
    throw new Error("Format tanggal tidak valid");
  }

  // Membandingkan waktu mulai dan selesai
  const [jam, menit] = jam_mulai.split(":").map(Number);

  tanggalMulai.setHours(jam, menit, 0, 0);

  if (tanggalSelesai <= tanggalMulai) {
    throw new Error("Tanggal selesai harus setelah waktu mulai");
  }

  return {
    id_detail_layanan,
    tanggal_mulai: new Date(tanggal_mulai),
    jam_mulai,
    tanggal_selesai: tanggalSelesai,
    status_booking: status_booking.trim()
  };
};

// Fungsi membuat ID Booking Auto Increment
const generateBookingId = async () => {
  const counters = mongoose.connection.collection("counters");

  const counter = await counters.findOneAndUpdate(
    { _id: "booking_layanan" },
    { $inc: { seq: 1 } },
    { upsert: true, returnDocument: "after" }
  );

  if (counter.seq > 9999) {
    throw new Error("ID booking sudah mencapai batas maksimal");
  }

  return String(counter.seq);
};

// 1. Tampilkan Semua Booking
exports.getAllBooking = async (req, res) => {
  try {
    const data = await BookingLayanan.find();

    res.status(200).json({
      success: true,
      total: data.length,
      data
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Gagal mengambil data booking",
      error: error.message
    });
  }
};

// 2. Tampilkan Booking Berdasarkan ID
exports.getBookingById = async (req, res) => {
  try {
    const data = await BookingLayanan.findOne({
      id_booking: req.params.id
    });

    if (!data) {
      return res.status(404).json({
        success: false,
        message: "Booking layanan tidak ditemukan"
      });
    }

    res.status(200).json({
      success: true,
      data
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// 3. Tampilkan Booking Berdasarkan Detail Layanan
exports.getBookingByDetail = async (req, res) => {
  try {
    const data = await BookingLayanan.find({
      id_detail_layanan: req.params.id_detail_layanan
    });

    res.status(200).json({
      success: true,
      total: data.length,
      data
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// 4. Tambah Booking
exports.createBooking = async (req, res) => {
  try {
    const dataValid = await validateBooking(req.body);

    // Cek apakah detail layanan sudah memiliki booking
    const bookingSudahAda = await BookingLayanan.findOne({
      id_detail_layanan: dataValid.id_detail_layanan
    });

    if (bookingSudahAda) {
      return res.status(400).json({
        success: false,
        message: "Detail layanan ini sudah memiliki booking"
      });
    }

    const id_booking = await generateBookingId();

    const data = await BookingLayanan.create({
      id_booking,
      ...dataValid
    });

    res.status(201).json({
      success: true,
      message: "Booking layanan berhasil ditambahkan",
      data
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Gagal menambahkan booking",
      error: error.message
    });
  }
};

// 5. Update Booking
exports.updateBooking = async (req, res) => {
  try {
    const dataValid = await validateBooking(req.body);

    const booking = await BookingLayanan.findOne({
      id_booking: req.params.id
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking layanan tidak ditemukan"
      });
    }

    // Cek apakah detail layanan digunakan booking lain
    const bookingDuplikat = await BookingLayanan.findOne({
      id_detail_layanan: dataValid.id_detail_layanan,
      id_booking: { $ne: req.params.id }
    });

    if (bookingDuplikat) {
      return res.status(400).json({
        success: false,
        message: "Detail layanan ini sudah memiliki booking"
      });
    }

    booking.id_detail_layanan = dataValid.id_detail_layanan;
    booking.tanggal_mulai = dataValid.tanggal_mulai;
    booking.jam_mulai = dataValid.jam_mulai;
    booking.tanggal_selesai = dataValid.tanggal_selesai;
    booking.status_booking = dataValid.status_booking;

    await booking.save();

    res.status(200).json({
      success: true,
      message: "Booking layanan berhasil diperbarui",
      data: booking
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Gagal memperbarui booking",
      error: error.message
    });
  }
};

// 6. Hapus Booking
exports.deleteBooking = async (req, res) => {
  try {
    const data = await BookingLayanan.findOneAndDelete({
      id_booking: req.params.id
    });

    if (!data) {
      return res.status(404).json({
        success: false,
        message: "Booking layanan tidak ditemukan"
      });
    }

    res.status(200).json({
      success: true,
      message: "Booking layanan berhasil dihapus",
      data
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
