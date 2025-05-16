const express = require("express");
const router = express.Router();

const {
  create,
  getAll,
  getById,
  updateById,
  deleteById,
} = require("../controller/transaction.controller");

router.post("/", create); // POST /transactions
router.get("/", getAll); // GET /transactions
router.get("/:id", getById); // GET /transactions/:id
router.put("/:id", updateById); // PUT /transactions/:id
router.delete("/:id", deleteById); // DELETE /transactions/:id

module.exports = router;
