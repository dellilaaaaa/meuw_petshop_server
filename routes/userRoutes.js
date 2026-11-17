const express = require("express");
const router = express.Router();

const {
  createUser,
  getUsers,
  getUserByName,
  getUserByEmail,
  getUserById,
  updateUser,
  deleteUser
} = require("../controllers/userController");

// Register
router.post("/", createUser);

// Get All User
router.get("/", getUsers);

// Get User By Name
router.get("/search", getUserByName);

// Get User By Email
router.get("/email/:email", getUserByEmail);

// Get User By ID
router.get("/:id_user", getUserById);

// Update User
router.put("/:id_user", updateUser);

// Delete User
router.delete("/:id_user", deleteUser);

module.exports = router;
