const express = require("express");
const router = express.Router();

const shoppingCartController = require("../controllers/shoppingCartControllers");

router.get("/:id_user", shoppingCartController.getCart);

router.post("/:id_user", shoppingCartController.addToCart);

router.put("/:id_user/:id_barang", shoppingCartController.updateCartItem);

router.delete("/:id_user/clear", shoppingCartController.clearCart);

router.delete("/:id_user/:id_barang", shoppingCartController.removeCartItem);

module.exports = router;
