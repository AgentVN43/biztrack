const service = require("./purchaseOrder.service");
const paymentService = require("../payments/payments.service"); // Import payment service

exports.create = (req, res, next) => {
  service.createPurchaseOrder(req.body, (err, result) => {
    if (err) return next(err);

    // Tự động tạo phiếu chi khi Purchase Order được tạo thành công
    paymentService.createPaymentOnPOCreation(
      result.po_id,
      result.total_amount || 0,
      (paymentErr, payment) => {
        // Truyền callback vào đây
        if (paymentErr) {
          // Xử lý lỗi khi tạo phiếu chi
          console.error("Error creating payment:", paymentErr);
          // *Quan trọng*:  Bạn CẦN gọi res.status và res.json ở ĐÂY để kết thúc request
          res.status(201).json({
            // Hoặc 500, tùy logic
            success: true, // Có thể là false tùy vào việc bạn có muốn báo lỗi không
            data: { purchaseOrder: result, payment: null },
            message: "Purchase Order created, but Payment creation failed.",
          });
        } else {
          // Nếu tạo phiếu chi thành công, trả về cả thông tin PO và Payment
          res
            .status(201)
            .json({ success: true, data: { purchaseOrder: result, payment } });
        }
      }
    );
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
    if (!result)
      return res.status(404).json({ success: false, message: "Not found" });
    res.json({ success: true, data: result });
  });
};

exports.getWithDetailsById = (req, res, next) => {
  service.getPurchaseOrderDetailsById(req.params.id, (err, result) => {
    if (err) return next(err);
    if (!result)
      return res.status(404).json({ success: false, message: "Not found" });
    res.json({ success: true, data: result });
  });
};

exports.remove = (req, res, next) => {
  service.deletePurchaseOrder(req.params.id, (err) => {
    if (err) return next(err);
    res.json({ success: true, message: "Deleted" });
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
    if (!result)
      return res.status(404).json({ success: false, message: "Not found" });
    res.json({ success: true, data: result });
  });
};

exports.updatePOWithDetails = (req, res, next) => {
  const poId = req.params.id;
  const { supplier_name, note, status, details } = req.body;

  service.updatePOWithDetails(
    poId,
    { supplier_name, note, status },
    details,
    (err, result) => {
      if (err) return next(err);
      res.json({ success: true, data: result });
    }
  );
};
