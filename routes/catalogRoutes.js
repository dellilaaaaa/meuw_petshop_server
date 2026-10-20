const express = require("express");
const router = express.Router();
const catalogController = require("../controllers/catalogControllers");

router.post("/", catalogController.createCatalog);
router.get("/", catalogController.getAllCatalog);
router.put("/:id", catalogController.updateCatalog);
router.delete("/:id", catalogController.deleteCatalog);

module.exports = router;