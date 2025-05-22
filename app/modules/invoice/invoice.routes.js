const express = require("express");
const router = express.Router();

const InvoiceController = require("./invoice.controller");

// CRUD Routes
router.get("/", InvoiceController.getAllInvoices);                 // Lấy tất cả hóa đơn
router.get("/:id", InvoiceController.getInvoiceById);              // Lấy hóa đơn theo ID
router.post("/", InvoiceController.createInvoice);                 // Tạo hóa đơn mới
router.put("/:id", InvoiceController.updateInvoice);               // Cập nhật hóa đơn
router.delete("/:id", InvoiceController.deleteInvoice);            // Xóa hóa đơn

module.exports = router;