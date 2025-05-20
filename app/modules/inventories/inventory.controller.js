const service = require("./inventory.service");
const { handleResult } = require("../../utils/responseHelper");

exports.create = (req, res, next) => {
  service.createInventory(req.body, (err, result) => {
    if (err) return next(err);
    res.status(201).json({ success: true, data: result });
  });
};

exports.update = (req, res, next) => {
  service.updateInventory(req.params.id, req.body, (err, result) => {
    if (err) return next(err);
    res.json({ success: true, message: "Inventory updated", data: result });
  });
};

exports.getAll = (req, res, next) => {
  service.getAllInventories(handleResult(res, next));
};

exports.getById = (req, res, next) => {
  service.getInventoryById(
    req.params.id,
    handleResult(res, next, "Inventory not found")
  );
};

// exports.getByWareHouseId = (req, res, next) => {
//   service.getByWareHouseId(
//     req.params.id,
//     handleResult(res, next, "Inventory not found")
//   );
// };

exports.getByWareHouseId = (req, res, next) => {
  const warehouseId = req.params.id;

  service.getByWareHouseId(warehouseId, (err, results) => {
    if (err) {
      return next(err);
    }

    // Nếu không có dữ liệu, trả về mảng rỗng thay vì lỗi
    if (!results || results.length === 0) {
      return res.status(200).json([]);
    }

    return res.status(200).json(results);
  });
};

exports.checkAll = (req, res, next) => {
  service.getAllInventoriesByWarehouse(
    req.params.id,
    handleResult(res, next, "Inventory not found")
  );
};

exports.remove = (req, res, next) => {
  service.deleteInventory(req.params.id, (err) => {
    if (err) return next(err);
    res.json({ success: true, message: "Deleted successfully" });
  });
};

// ===============================
// Business Logic APIs
// ===============================

// 1️⃣ Duyệt PO -> tăng tồn kho
exports.increaseStock = (req, res, next) => {
  const { orderDetails, warehouse_id } = req.body;
  service.increaseStockFromPurchaseOrder(orderDetails, warehouse_id, (err) => {
    if (err) return next(err);
    res.json({ success: true, message: "Đã cập nhật tồn kho từ đơn mua" });
  });
};

// 2️⃣ Tạm giữ hàng khi tạo đơn
exports.reserveStock = (req, res, next) => {
  const { orderDetails, warehouse_id } = req.body;
  service.reserveStockFromOrderDetails(orderDetails, warehouse_id, (err) => {
    if (err) return next(err);
    res.json({ success: true, message: "Đã tạm giữ hàng trong tồn kho" });
  });
};

// 3️⃣ Xác nhận thanh toán -> trừ thật sự tồn kho
exports.confirmStock = (req, res, next) => {
  const { orderDetails, warehouse_id } = req.body;
  service.confirmStockReservation(orderDetails, warehouse_id, (err) => {
    if (err) return next(err);
    res.json({ success: true, message: "Đã xác nhận tồn kho" });
  });
};

// 4️⃣ Hủy đơn -> giải phóng hàng đã giữ
exports.releaseStock = (req, res, next) => {
  const { orderDetails, warehouse_id } = req.body;
  service.releaseReservedStock(orderDetails, warehouse_id, (err) => {
    if (err) return next(err);
    res.json({ success: true, message: "Đã giải phóng hàng tồn kho" });
  });
};
