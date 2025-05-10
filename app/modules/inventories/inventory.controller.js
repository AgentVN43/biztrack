const inventoryService = require('./inventory.service');

exports.create = (req, res, next) => {
  inventoryService.createInventory(req.body, (err, result) => {
    if (err) return next(err);
    res.status(201).json({ success: true, data: req.body });
  });
};

exports.getAll = (req, res, next) => {
  inventoryService.getAllInventories((err, results) => {
    if (err) return next(err);
    res.json({ success: true, data: results });
  });
};

exports.getById = (req, res, next) => {
  inventoryService.getInventoryById(req.params.id, (err, results) => {
    if (err) return next(err);
    if (results.length === 0) {
      return res.status(404).json({ success: false, message: 'Inventory not found' });
    }
    res.json({ success: true, data: results[0] });
  });
};

exports.update = (req, res, next) => {
  inventoryService.updateInventory(req.params.id, req.body, (err, result) => {
    if (err) return next(err);
    res.json({ success: true, message: 'Inventory updated' });
  });
};

exports.remove = (req, res, next) => {
  inventoryService.deleteInventory(req.params.id, (err, result) => {
    if (err) return next(err);
    res.json({ success: true, message: 'Inventory deleted' });
  });
};


exports.getByWarehouse = (req, res, next) => {
  inventoryService.getInventoriesByWarehouse(req.params.id, (err, results) => {
    if (err) return next(err);
    res.json({ success: true, data: results });
  });
};

exports.getSummary = (req, res, next) => {
  inventoryService.getInventorySummary((err, results) => {
    if (err) return next(err);
    res.json({ success: true, data: results });
  });
};
