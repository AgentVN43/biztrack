const express = require('express');
const router = express.Router();
const ReceiptController = require('./receipts.controller');

router.post('/', ReceiptController.create);
router.get('/', ReceiptController.read);
router.get('/:id', ReceiptController.readById);
router.put('/:id', ReceiptController.update);
router.delete('/:id', ReceiptController.delete);

module.exports = router;