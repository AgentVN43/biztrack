const OrderService = require("./order.service");
const OrderDetailService = require("../orderDetails/orderDetail.service");
const ReceiptService = require("../receipts/receipts.service");
const TransactionService = require("../transactions/transaction.service");
const Product = require("../../controllers/product.controller");
const Inventory = require("../inventories/inventory.service");
const { v4: uuidv4 } = require("uuid");

const OrderController = {
  create: (req, res) => {
    OrderService.create(req.body, (error, order) => {
      if (error) {
        return res.status(500).json({ success: false, error: error });
      }
      res.status(201).json({ success: true, data: order });
    });
  },

  read: (req, res) => {
    OrderService.read((error, order) => {
      if (error) {
        return res
          .status(500)
          .json({ message: "Failed to read orders", error });
      }
      res.status(200).json({ success: true, data: order });
    });
  },

  readById: (req, res) => {
    const { id } = req.params;
    OrderService.readById(id, (error, order) => {
      if (error) {
        return res.status(500).json({ message: "Failed to read order", error });
      }
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      res.status(200).json(order);
    });
  },

  update: (req, res) => {
    const { id } = req.params;
    OrderService.update(id, req.body, (error, order) => {
      if (error) {
        return res
          .status(500)
          .json({ message: "Failed to update order", error });
      }
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      res.status(200).json(order);
    });
  },

  delete: (req, res) => {
    const { id } = req.params;
    OrderService.delete(id, (error, success) => {
      if (error) {
        return res
          .status(500)
          .json({ message: "Failed to delete order", error });
      }
      if (!success) {
        return res.status(404).json({ message: "Order not found" });
      }
      res.status(204).send();
    });
  },

  // createOrderWithDetails: (req, res) => {
  //   const { order, orderDetails } = req.body;

  //   // 1. Tạo order
  //   OrderService.create(order, (errorOrder, newOrder) => {
  //     if (errorOrder) {
  //       return res
  //         .status(500)
  //         .json({ message: "Failed to create order", error: errorOrder });
  //     }

  //     const createdOrderDetails = [];
  //     let errorInOrderDetail = null;
  //     let completedOrderDetailCount = 0;

  //     // 2. Tạo order details
  //     if (orderDetails && orderDetails.length > 0) {
  //       orderDetails.forEach((detail) => {
  //         const detailData = { ...detail, order_id: newOrder.order_id };
  //         OrderDetailService.create(
  //           detailData,
  //           (errorDetail, newOrderDetail) => {
  //             if (errorDetail) {
  //               errorInOrderDetail = errorDetail;
  //             } else {
  //               createdOrderDetails.push(newOrderDetail);
  //             }
  //             completedOrderDetailCount++;

  //             // Kiểm tra nếu đã xử lý hết order details
  //             if (completedOrderDetailCount === orderDetails.length) {
  //               if (errorInOrderDetail) {
  //                 // Xử lý lỗi nếu có lỗi khi tạo order detail (có thể rollback order nếu cần)
  //                 return res
  //                   .status(500)
  //                   .json({
  //                     message: "Failed to create some order details",
  //                     error: errorInOrderDetail,
  //                   });
  //               }

  //               // 3. Tạo receipt sau khi order và order details được tạo
  //               const receiptData = {
  //                 order_id: newOrder.order_id,
  //                 receipt_code: `REC-${Date.now()}`, // Ví dụ tạo mã receipt
  //                 receipt_date: new Date(),
  //                 amount: newOrder.final_amount || newOrder.total_amount || 0, // Lấy tổng tiền từ order
  //                 payment_method: order.payment_method || "Unknown",
  //                 note: `Receipt for order ${newOrder.order_code}`,
  //               };

  //               ReceiptService.create(
  //                 receiptData,
  //                 (errorReceipt, newReceipt) => {
  //                   if (errorReceipt) {
  //                     return res
  //                       .status(500)
  //                       .json({
  //                         message: "Failed to create receipt",
  //                         error: errorReceipt,
  //                       });
  //                   }

  //                   res
  //                     .status(201)
  //                     .json({
  //                       order: newOrder,
  //                       orderDetails: createdOrderDetails,
  //                       receipt: newReceipt,
  //                     });
  //                 }
  //               );
  //             }
  //           }
  //         );
  //       });
  //     } else {
  //       // Nếu không có order details, vẫn tạo receipt cho order
  //       const receiptData = {
  //         order_id: newOrder.order_id,
  //         receipt_code: `REC-${Date.now()}`,
  //         receipt_date: new Date(),
  //         amount: newOrder.final_amount || newOrder.total_amount || 0,
  //         payment_method: order.payment_method || "Unknown",
  //         note: `Receipt for order ${newOrder.order_code}`,
  //       };
  //       ReceiptService.create(receiptData, (errorReceipt, newReceipt) => {
  //         if (errorReceipt) {
  //           return res
  //             .status(500)
  //             .json({
  //               message: "Failed to create receipt",
  //               error: errorReceipt,
  //             });
  //         }
  //         res
  //           .status(201)
  //           .json({ order: newOrder, receipt: newReceipt, orderDetails: [] });
  //       });
  //     }
  //   });
  // },

  createOrderWithDetails: (req, res) => {
    const { order, orderDetails } = req.body;

    // 1. Tạo order
    OrderService.create(order, (errorOrder, newOrder) => {
      if (errorOrder) {
        return res.status(500).json({
          message: "Failed to create order",
          error: errorOrder,
        });
      }

      const createdOrderDetails = [];
      let errorInOrderDetail = null;
      let completedOrderDetailCount = 0;

      // 2. Tạo order details
      if (orderDetails && orderDetails.length > 0) {
        orderDetails.forEach((detail) => {
          const detailData = { ...detail, order_id: newOrder.order_id };
          OrderDetailService.create(
            detailData,
            (errorDetail, newOrderDetail) => {
              if (errorDetail) {
                errorInOrderDetail = errorDetail;
              } else {
                createdOrderDetails.push(newOrderDetail);
              }
              completedOrderDetailCount++;

              // Kiểm tra nếu đã xử lý hết order details
              if (completedOrderDetailCount === orderDetails.length) {
                if (errorInOrderDetail) {
                  return res.status(500).json({
                    message: "Failed to create some order details",
                    error: errorInOrderDetail,
                  });
                }

                // ✅ THÊM VÀO ĐÂY: GỌI reserveStockFromOrderDetails
                const warehouse_id = order.warehouse_id || "wh_default"; // Có thể lấy từ client hoặc mặc định

                Inventory.reserveStockFromOrderDetails(
                  orderDetails,
                  warehouse_id,
                  (reserveError) => {
                    if (reserveError) {
                      console.error(
                        "Lỗi khi tạm giữ tồn kho:",
                        reserveError.message
                      );
                      // Có thể log lỗi nhưng không dừng flow
                    }

                    // 3. Tạo receipt sau khi order và order details được tạo
                    const receiptData = {
                      order_id: newOrder.order_id,
                      receipt_code: `REC-${Date.now()}`,
                      receipt_date: new Date(),
                      amount:
                        newOrder.final_amount || newOrder.total_amount || 0,
                      payment_method: order.payment_method || "Unknown",
                      note: `Receipt for order ${newOrder.order_code}`,
                    };

                    ReceiptService.create(
                      receiptData,
                      (errorReceipt, newReceipt) => {
                        if (errorReceipt) {
                          return res.status(500).json({
                            message: "Failed to create receipt",
                            error: errorReceipt,
                          });
                        }

                        return res.status(201).json({
                          order: newOrder,
                          orderDetails: createdOrderDetails,
                          receipt: newReceipt,
                        });
                      }
                    );
                  }
                );
              }
            }
          );
        });
      } else {
        // Nếu không có order details, vẫn tạo receipt cho order
        const receiptData = {
          order_id: newOrder.order_id,
          receipt_code: `REC-${Date.now()}`,
          receipt_date: new Date(),
          amount: newOrder.final_amount || newOrder.total_amount || 0,
          payment_method: order.payment_method || "Unknown",
          note: `Receipt for order ${newOrder.order_code}`,
        };

        ReceiptService.create(receiptData, (errorReceipt, newReceipt) => {
          if (errorReceipt) {
            return res.status(500).json({
              message: "Failed to create receipt",
              error: errorReceipt,
            });
          }

          res
            .status(201)
            .json({ order: newOrder, receipt: newReceipt, orderDetails: [] });
        });
      }
    });
  },
};

module.exports = OrderController;
