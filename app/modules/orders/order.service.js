const OrderModel = require("./order.model");
const Inventory = require("../inventories/inventory.service");
const Transaction = require("../transactions/transaction.service");
const Invoice = require("../invoice/invoice.service");

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

  // update: (order_id, data, callback) => {
  //   OrderModel.update(order_id, data, (err, result) => {
  //     if (err || !result) return callback(err || new Error("Order not found"));

  //     // Nếu không có thay đổi status thì không xử lý logic phụ
  //     if (!data.order_status) return callback(null, result);

  //     // Đọc thêm thông tin đơn hàng để xử lý
  //     OrderModel.readById(order_id, (err2, order) => {
  //       if (err2 || !order)
  //         return callback(err2 || new Error("Order not found"));
  //       console.log("Fuck order:", order);
  //       const orderDetails = order.order_details || []; // cần đảm bảo bạn fetch kèm orderDetails
  //       const warehouse_id = order.warehouse_id || 1; // hoặc lấy từ order nếu có

  //       if (data.order_status === "Hoàn tất") {
  //         Inventory.confirmStockReservation(
  //           orderDetails,
  //           warehouse_id,
  //           (err3) => {
  //             if (err3) return callback(err3);

  //             const generateInvoiceCode = () => {
  //               const date = new Date();
  //               const y = date.getFullYear().toString().substr(-2);
  //               const m = ("0" + (date.getMonth() + 1)).slice(-2);
  //               const d = ("0" + date.getDate()).slice(-2);
  //               // Ví dụ: INV-250601-0001
  //               return `INV-${y}${m}${d}-${Math.floor(
  //                 1000 + Math.random() * 9000
  //               )}`;
  //             };

  //             const invoiceData = {
  //               invoice_code: generateInvoiceCode(),
  //               invoice_type: "sale_invoice",
  //               order_id: order.order_id,
  //               customer_id: order.customer?.customer_id || null,
  //               total_amount: parseFloat(order.total_amount),
  //               tax_amount: 0, // Có thể tính nếu có thuế
  //               discount_amount: parseFloat(order.discount_amount || 0),
  //               final_amount: parseFloat(order.final_amount),
  //               issued_date: new Date(),
  //               due_date: new Date(), // hoặc sau vài ngày
  //               status: "paid", // Vì đơn hàng đã hoàn tất
  //               note: "Hóa đơn bán hàng tự động phát sinh từ đơn hàng",
  //             };

  //             // ✅ Gọi InvoiceService.create
  //             InvoiceService.create(
  //               invoiceData,
  //               (errInvoice, invoiceResult) => {
  //                 if (errInvoice) return callback(errInvoice);

  //                 // ✅ Gọi TransactionService.create liên kết tới invoice
  //                 const transactionData = {
  //                   transaction_code: `TRX-${Date.now()}`,
  //                   type: "receipt",
  //                   amount: invoiceData.final_amount,
  //                   description: `Thu tiền từ hóa đơn ${invoiceData.invoice_code}`,
  //                   category: "sale",
  //                   payment_method: order.payment_method || "COD",
  //                   related_type: "invoice",
  //                   related_id: invoiceResult.invoice_id,
  //                 };

  //                 TransactionService.create(
  //                   transactionData,
  //                   (errTransaction) => {
  //                     if (errTransaction) return callback(errTransaction);

  //                     callback(null, result);
  //                   }
  //                 );
  //               }
  //             );
  //           }
  //         );
  //       } else if (data.order_status === "Huỷ đơn") {
  //         Inventory.releaseReservedStock(orderDetails, warehouse_id, (err3) => {
  //           if (err3) return callback(err3);
  //           Receipt.markAsCancelled(order_id, (err4) => {
  //             if (err4) return callback(err4);
  //             Transaction.markAsCancelled(order_id, (err5) => {
  //               if (err5) return callback(err5);
  //               callback(null, result);
  //             });
  //           });
  //         });
  //       } else {
  //         // Trạng thái khác => chỉ cập nhật xong là return
  //         callback(null, result);
  //       }
  //     });
  //   });
  // },

  update: (order_id, data, callback) => {
    OrderModel.update(order_id, data, (err, result) => {
      if (err || !result)
        return callback(err || new Error("Đơn hàng không tồn tại"));

      // Nếu không có thay đổi status thì không xử lý logic phụ
      if (!data.order_status) return callback(null, result);

      // Đọc thêm thông tin đơn hàng để xử lý
      OrderModel.readById(order_id, (err2, order) => {
        if (err2 || !order)
          return callback(
            err2 || new Error("Không thể đọc thông tin đơn hàng")
          );
        console.log("***This is order:", order);
        const orderDetails = order.order_details || [];
        const warehouse_id = order.warehouse_id || null;

        if (data.order_status === "Hoàn tất") {
          Inventory.confirmStockReservation(
            orderDetails,
            order.warehouse_id,
            (err3) => {
              if (err3) return callback(err3);

              // ✅ Tự động sinh invoice_code
              const generateInvoiceCode = () => {
                const date = new Date();
                const y = date.getFullYear().toString().substr(-2);
                const m = ("0" + (date.getMonth() + 1)).slice(-2);
                const d = ("0" + date.getDate()).slice(-2);
                return `INV-${y}${m}${d}-${String(
                  Math.floor(1000 + Math.random() * 9000)
                ).padStart(4, "0")}`;
              };

              const invoiceData = {
                invoice_code: generateInvoiceCode(),
                invoice_type: "sale_invoice",
                order_id: order.order_id,
                customer_id: order.customer_id || null,
                total_amount: parseFloat(order.total_amount),
                tax_amount: 0, // Có thể tính nếu có thuế
                discount_amount: parseFloat(order.discount_amount || 0),
                final_amount: parseFloat(order.final_amount),
                issued_date: new Date(),
                due_date: new Date(), // hoặc sau vài ngày
                status: "paid", // Vì đơn hàng đã hoàn tất
                note: "Hóa đơn bán hàng tự động phát sinh từ đơn hàng",
              };

              // ✅ Tạo hóa đơn
              Invoice.create(invoiceData, (errInvoice, invoiceResult) => {
                if (errInvoice) {
                  console.error("Lỗi tạo invoice:", errInvoice); // ✅ log lỗi chi tiết
                  return callback(errInvoice);
                }

                console.log("Invoice đã tạo:", invoiceResult); // ✅ log để debug

                // ✅ Tạo giao dịch liên kết tới invoice
                const transactionData = {
                  transaction_code: `TRX-${Date.now()}`,
                  type: "receipt",
                  amount: invoiceData.final_amount,
                  description: `Thu tiền từ hóa đơn ${invoiceData.invoice_code}`,
                  category: "sale",
                  payment_method: order.payment_method || "COD",
                  related_type: "invoice",
                  related_id: invoiceResult.invoice_id,
                };

                Transaction.createTransaction(
                  transactionData,
                  (errTransaction) => {
                    if (errTransaction) {
                      console.error("Lỗi tạo transaction:", errTransaction); // ✅
                      return callback(errTransaction);
                    }
                    callback(null, result);
                  }
                );
              });
            }
          );
        } else if (data.order_status === "Huỷ đơn") {
          Inventory.releaseReservedStock(orderDetails, warehouse_id, (err3) => {
            if (err3) return callback(err3);

            // ❌ Loại bỏ Receipt
            // Thay vào đó, nếu cần hủy giao dịch, hãy gọi TransactionService.markAsCancelled
            Transaction.markAsCancelledByOrder(order_id, (errTransaction) => {
              if (errTransaction) return callback(errTransaction);

              callback(null, result);
            });
          });
        } else {
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

    console.log("This is FE send Order:", order);
    console.log("This is FE send OrderDetails:", orderDetails);

    if (!order || !Array.isArray(orderDetails)) {
      return callback(new Error("Missing 'order' or 'orderDetails'"));
    }

    const orderFields = { ...order };
    console.log("This is orderFields:", orderFields);
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

    console.log("*****This is updateOrder:", updatedOrder);

    OrderModel.updateOrderWithDetails(
      orderId,
      updatedOrder,
      orderDetailsData,
      callback
    );
  },
};

module.exports = OrderService;
