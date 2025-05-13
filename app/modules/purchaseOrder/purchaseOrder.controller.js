const service = require('./purchaseOrder.service');

exports.create = (req, res, next) => {
  service.createPurchaseOrder(req.body, (err, result) => {
    if (err) return next(err);
    res.status(201).json({ success: true, data: result });
  });
};

exports.getAll = (req, res, next) => {
  service.getAllPurchaseOrders((err, result) => {
    if (err) return next(err);
    res.json({ success: true, data: result });
  });
};

exports.getById = (req, res, next) => {
  service.getPurchaseOrderById(req.params.id, (err, result) => {
    if (err) return next(err);
    if (!result) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data: result });
  });
};

exports.getWithDetailsById = (req, res, next) => {
  service.getPurchaseOrderDetailsById(req.params.id, (err, result) => {
    if (err) return next(err);
    if (!result) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data: result });
  });
};

exports.remove = (req, res, next) => {
  service.deletePurchaseOrder(req.params.id, (err) => {
    if (err) return next(err);
    res.json({ success: true, message: 'Deleted' });
  });
};

exports.postOrder = (req, res, next) => {
  service.confirmPurchaseOrder(req.params.id, (err, result) => {
    if (err) return next(err);
    res.json({ success: true, data: result });
  });
};

exports.update = (req, res, next) => {
  service.updatePurchaseOrder(req.params.id, req.body, (err, result) => {
    if (err) return next(err);
    if (!result) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data: result });
  });
};


exports.updatePOWithDetails = (req, res, next) => {
  const poId = req.params.id;
  const { supplier_name, note, status, details } = req.body;

  service.updatePOWithDetails(poId, { supplier_name, note, status }, details, (err, result) => {
    if (err) return next(err);
    res.json({ success: true, data: result });
  });
};
