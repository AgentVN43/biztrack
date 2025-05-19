const OrderModel = require("./order.model");
const Inventory = require("../inventories/inventory.service");
const Transaction = require("../transactions/transaction.service");
const Receipt = require("../receipts/receipts.service");

const OrderService = {
  create: (data, callback) => {
    OrderModel.create(data, callback);
  },

  read: (callback) => {
    OrderModel.read(callback);
  },

  readById: (order_id, callback) => {
    OrderModel.readById(order_id, callback);
  },

  // update: (order_id, data, callback) => {
  //   OrderModel.update(order_id, data, callback);
  // },

  update: (order_id, data, callback) => {
    OrderModel.update(order_id, data, (err, result) => {
      if (err || !result) return callback(err || new Error("Order not found"));

      // Nếu không có thay đổi status thì không xử lý logic phụ
      if (!data.order_status) return callback(null, result);

      // Đọc thêm thông tin đơn hàng để xử lý
      OrderModel.readById(order_id, (err2, order) => {
        if (err2 || !order)
          return callback(err2 || new Error("Order not found"));
        console.log("Fuck order:", order);
        const orderDetails = order.order_details || []; // cần đảm bảo bạn fetch kèm orderDetails
        const warehouse_id = order.warehouse_id || 1; // hoặc lấy từ order nếu có

        if (data.order_status === "Hoàn tất") {
          Inventory.confirmStockReservation(
            orderDetails,
            warehouse_id,
            (err3) => {
              if (err3) return callback(err3);
              Receipt.markAsPaid(order_id, (err4) => {
                if (err4) return callback(err4);

                Transaction.confirmPayment(order_id, (err5) => {
                  if (err5) return callback(err5);

                  callback(null, result);
                });
              });
            }
          );
        } else if (data.order_status === "Huỷ đơn") {
          Inventory.releaseReservedStock(orderDetails, warehouse_id, (err3) => {
            if (err3) return callback(err3);
            Receipt.markAsCancelled(order_id, (err4) => {
              if (err4) return callback(err4);
              Transaction.markAsCancelled(order_id, (err5) => {
                if (err5) return callback(err5);
                callback(null, result);
              });
            });
          });
        } else {
          // Trạng thái khác => chỉ cập nhật xong là return
          callback(null, result);
        }
      });
    });
  },

  delete: (order_id, callback) => {
    OrderModel.delete, delete (order_id, callback);
  },
};

module.exports = OrderService;
