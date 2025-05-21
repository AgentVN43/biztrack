const OrderModel = require("./order.model");
const Inventory = require("../inventories/inventory.service");
const Transaction = require("../transactions/transaction.service");
const Receipt = require("../receipts/receipts.service");

function calculateOrderTotals(orderDetails, orderData = {}) {
  let calculatedTotalAmount = 0;
  let calculatedDiscountProductAmount = 0;

  const validDetails = Array.isArray(orderDetails) ? orderDetails : [];

  validDetails.forEach((detail) => {
    const price = parseFloat(detail.price) || 0;
    const quantity = parseInt(detail.quantity) || 0;
    const discount = parseFloat(detail.discount) || 0;

    calculatedTotalAmount += price * quantity;
    calculatedDiscountProductAmount += discount * quantity;
  });

  const orderDiscountAmount = parseFloat(orderData.order_amount || 0);
  const totalDiscountAmount =
    orderDiscountAmount + calculatedDiscountProductAmount;
  const shippingFee = parseFloat(orderData.shipping_fee) || 0;

  const finalAmount = calculatedTotalAmount - totalDiscountAmount + shippingFee;

  return {
    total_amount: calculatedTotalAmount,
    discount_amount: totalDiscountAmount,
    final_amount: finalAmount,
    shipping_fee: shippingFee,
    order_amount: orderDiscountAmount,
  };
}

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

  // updateOrderWithDetail: (order_id, data, callback) => {
  //   const orderData = data.order || {};
  //   const orderDetails = data.orderDetails || [];
  //   const customer = data.customer; // nếu có

  //   // Cập nhật thông tin đơn hàng chính
  //   OrderModel.updateOrder(order_id, orderData, (err) => {
  //     if (err) return callback(err);

  //     // Cập nhật thông tin khách hàng nếu có
  //     if (customer) {
  //       OrderModel.updateCustomer(order_id, customer, (err) => {
  //         if (err) return callback(err);
  //       });
  //     }

  //     // Xóa và thêm lại danh sách sản phẩm mới
  //     OrderModel.deleteOrderDetails(order_id, (err) => {
  //       if (err) return callback(err);

  //       if (orderDetails && orderDetails.length > 0) {
  //         OrderModel.insertOrderDetails(order_id, products, (err) => {
  //           if (err) return callback(err);
  //           return callback(null, { updated: true });
  //         });
  //       } else {
  //         return callback(null, { updated: true });
  //       }
  //     });
  //   });
  // },

  updateOrderWithDetails: (orderId, data, callback) => {
    const { order, orderDetails = [] } = data;

    console.log("This is FE send Order:",order)
    console.log("This is FE send OrderDetails:",orderDetails)

    if (!order || !Array.isArray(orderDetails)) {
      return callback(new Error("Missing 'order' or 'orderDetails'"));
    }

    const orderFields = { ...order };
    console.log("This is orderFields:",orderFields)
    const orderDetailsData = orderDetails.map((product) => ({
      order_id: orderId,
      product_id: product.product_id,
      quantity: product.quantity,
      price: product.price,
      discount: product.discount || 0,
      warehouse_id: order.warehouse_id,
    }));

    const totals = calculateOrderTotals(orderDetailsData, orderFields);

    const updatedOrder = {
      ...orderFields,
      ...totals,
    };

    console.log("*****This is updateOrder:",updatedOrder)

    OrderModel.updateOrderWithDetails(
      orderId,
      updatedOrder,
      orderDetailsData,
      callback
    );
  },
};

module.exports = OrderService;
