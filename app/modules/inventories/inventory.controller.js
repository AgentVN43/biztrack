const service = require('./inventory.service');

exports.create = (req, res, next) => {
  service.createInventory(req.body, (err, result) => {
    if (err) return next(err);
    res.status(201).json({ success: true, data: result });
  });
};

// inventory.controller.js
exports.update = (req, res, next) => {
  const inventory_id = req.params.id;
  const data = req.body;

  service.updateInventory(inventory_id, data, (err, result) => {
    if (err) return next(err);
    res.json({ success: true, message: 'Inventory updated', data: result });
  });
};


exports.getAll = (req, res, next) => {
  service.getAllInventories((err, result) => {
    if (err) return next(err);
    res.json({ success: true, data: result });
  });
};

exports.getById = (req, res, next) => {
  service.getInventoryById(req.params.id, (err, result) => {
    if (err) return next(err);
    if (!result) return res.status(404).json({ success: false, message: 'Inventory not found' });
    res.json({ success: true, data: result });
  });
};

exports.remove = (req, res, next) => {
  service.deleteInventory(req.params.id, (err) => {
    if (err) return next(err);
    res.json({ success: true, message: 'Deleted successfully' });
  });
};


exports.getByWareHouseId = (req, res, next) => {
  service.getByWareHouseId(req.params.id, (err, result) => {
    if (err) return next(err);
    if (!result) return res.status(404).json({ success: false, message: 'Inventory not found' });
    res.json({ success: true, data: result });
  });
};