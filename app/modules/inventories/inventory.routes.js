const express = require('express');
const router = express.Router();
const controller = require('./inventory.controller');

router.post('/', controller.create);
router.get('/', controller.getAll);
// router.get('/:id/inventories', controller.checkAll);
router.get('/:id', controller.getById);
router.get('/:id/warehouses', controller.getByWareHouseId);
router.delete('/:id', controller.remove);

module.exports = router;
