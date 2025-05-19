const OrderService = require("./order.service");
const OrderDetailService = require("../orderDetails/orderDetail.service");
const ReceiptService = require("../receipts/receipts.service");
const TransactionService = require("../transactions/transaction.service");
const Product = require("../../controllers/product.controller");
const Inventory = require("../inventories/inventory.service");
const { v4: uuidv4 } = require("uuid");

// --- Hàm tạo receipt trong controller (tách khỏi Express) ---
function createReceiptData(order, paymentMethod) {
  return {
    order_id: order.order_id,
    receipt_code: `REC-${Date.now()}`, // Có thể thay bằng hàm generateReceiptCode()
    receipt_date: new Date(),
    amount: order.final_amount || order.total_amount || 0,
    payment_method: paymentMethod || "Unknown",
    note: `Receipt for order ${order.order_code}`,
  };
}

// --- Hàm tạo receipt và gọi callback khi xong ---
function createReceiptAndRespond(order, orderDetails, paymentMethod, res) {
  const receiptData = createReceiptData(order, paymentMethod);

  ReceiptService.create(receiptData, (errorReceipt, newReceipt) => {
    if (errorReceipt) {
      return res.status(500).json({
        message: "Failed to create receipt",
        error: errorReceipt,
      });
    }

    res.status(201).json({
      order,
      orderDetails,
      receipt: newReceipt,
    });
  });
}

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

  // createOrderWithDetails: (req, res) => {
  //   const { order, orderDetails } = req.body;

  //     const { order: orderData, orderDetails } = req.body;
  //   console.log("***This is orderData:", orderData);
  //   let calculatedTotalAmount = 0;
  //   let calculatedDiscountProductAmount = 0;
  //   let calculatedDiscountOrderAmount = parseFloat(orderData.order_amount || 0);

  //   const detailsToCreate = []; // ✅ Đã bổ sung

  //   if (Array.isArray(orderDetails)) {
  //     // Tính tổng discount từ các chi tiết sản phẩm
  //     calculatedDiscountProductAmount = orderDetails.reduce(
  //       (sum, detail) => sum + (parseFloat(detail.discount) || 0),
  //       0
  //     );

  //     // Tính total_amount và push vào detailsToCreate
  //     orderDetails.forEach((detail) => {
  //       const itemTotal = parseFloat(detail.price) * parseInt(detail.quantity);
  //       calculatedTotalAmount += itemTotal;
  //       detailsToCreate.push(detail); // Lưu lại để tạo OrderDetail sau
  //     });
  //   }

  //   // Tổng giảm giá = từ sản phẩm + từ đơn
  //   const calculatedDiscountAmount =
  //     calculatedDiscountProductAmount + calculatedDiscountOrderAmount;

  //   // Lấy shipping_fee từ orderData
  //   const shippingFee = parseFloat(orderData.shipping_fee) || 0;

  //   // Tiền cuối cùng
  //   const calculatedFinalAmount =
  //     (calculatedTotalAmount - calculatedDiscountAmount) + shippingFee;

  //   console.log("***This is calculatedFinalAmount:", calculatedFinalAmount);

  //   const orderToCreate = {
  //     ...orderData,
  //     total_amount: calculatedTotalAmount,
  //     discount_amount: calculatedDiscountAmount,
  //     final_amount: calculatedFinalAmount,
  //     order_amount: calculatedDiscountOrderAmount,
  //     shipping_fee: shippingFee,
  //   };

  //   console.log("orderToCreate:", orderToCreate);

  //   // 1. Tạo order
  //   OrderService.create(order, (errorOrder, newOrder) => {
  //     if (errorOrder) {
  //       return res.status(500).json({
  //         message: "Failed to create order",
  //         error: errorOrder,
  //       });
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
  //                 return res.status(500).json({
  //                   message: "Failed to create some order details",
  //                   error: errorInOrderDetail,
  //                 });
  //               }

  //               // ✅ THÊM VÀO ĐÂY: GỌI reserveStockFromOrderDetails
  //               const warehouse_id = order.warehouse_id || "wh_default"; // Có thể lấy từ client hoặc mặc định

  //               Inventory.reserveStockFromOrderDetails(
  //                 orderDetails,
  //                 warehouse_id,
  //                 (reserveError) => {
  //                   if (reserveError) {
  //                     console.error(
  //                       "Lỗi khi tạm giữ tồn kho:",
  //                       reserveError.message
  //                     );
  //                     // Có thể log lỗi nhưng không dừng flow
  //                   }

  //                   // 3. Tạo receipt sau khi order và order details được tạo
  //                   const receiptData = {
  //                     order_id: newOrder.order_id,
  //                     receipt_code: `REC-${Date.now()}`,
  //                     receipt_date: new Date(),
  //                     amount:
  //                       newOrder.final_amount || newOrder.total_amount || 0,
  //                     payment_method: order.payment_method || "Unknown",
  //                     note: `Receipt for order ${newOrder.order_code}`,
  //                   };

  //                   ReceiptService.create(
  //                     receiptData,
  //                     (errorReceipt, newReceipt) => {
  //                       if (errorReceipt) {
  //                         return res.status(500).json({
  //                           message: "Failed to create receipt",
  //                           error: errorReceipt,
  //                         });
  //                       }

  //                       return res.status(201).json({
  //                         order: newOrder,
  //                         orderDetails: createdOrderDetails,
  //                         receipt: newReceipt,
  //                       });
  //                     }
  //                   );
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
  //           return res.status(500).json({
  //             message: "Failed to create receipt",
  //             error: errorReceipt,
  //           });
  //         }

  //         res
  //           .status(201)
  //           .json({ order: newOrder, receipt: newReceipt, orderDetails: [] });
  //       });
  //     }
  //   });
  // },

  createOrderWithDetails: (req, res) => {
    const { order: orderData, orderDetails } = req.body;

    console.log("***This is orderData:", orderData);

    // --- STEP 1: TÍNH TOÁN TỔNG TIỀN VÀ GIẢM GIÁ ---
    let calculatedTotalAmount = 0;
    let calculatedDiscountProductAmount = 0;
    const orderDiscountAmount = parseFloat(orderData.order_amount || 0);

    const validDetails = Array.isArray(orderDetails) ? orderDetails : [];

    validDetails.forEach((detail) => {
      const price = parseFloat(detail.price) || 0;
      const quantity = parseInt(detail.quantity) || 0;
      const discount = parseFloat(detail.discount) || 0;

      calculatedTotalAmount += price * quantity;
      calculatedDiscountProductAmount += discount;
    });

    const totalDiscountAmount =
      orderDiscountAmount + calculatedDiscountProductAmount;
    const shippingFee = parseFloat(orderData.shipping_fee) || 0;
    const finalAmount =
      calculatedTotalAmount - totalDiscountAmount + shippingFee;

    const orderToCreate = {
      ...orderData,
      total_amount: calculatedTotalAmount,
      discount_amount: totalDiscountAmount,
      final_amount: finalAmount,
      order_amount: orderDiscountAmount,
      shipping_fee: shippingFee,
    };

    console.log("*** Final orderToCreate:", orderToCreate);

    // --- STEP 2: TẠO ORDER ---
    OrderService.create(orderToCreate, (errorOrder, newOrder) => {
      if (errorOrder) {
        return res
          .status(500)
          .json({ message: "Failed to create order", error: errorOrder });
      }

      // --- STEP 3: TẠO ORDER DETAILS ---
      if (validDetails.length === 0) {
        return createReceiptAndRespond(newOrder, [], null, res);
      }

      let createdDetails = [];
      let errorInDetail = null;
      let completedCount = 0;

      validDetails.forEach((detail) => {
        const detailData = { ...detail, order_id: newOrder.order_id };

        OrderDetailService.create(detailData, (errorDetail, newDetail) => {
          if (errorDetail) errorInDetail = errorDetail;
          else createdDetails.push(newDetail);

          completedCount++;

          if (completedCount === validDetails.length) {
            if (errorInDetail) {
              return res.status(500).json({
                message: "Failed to create some order details",
                error: errorInDetail,
              });
            }

            // --- STEP 4: TẠM GIỮ TỒN KHO ---
            const warehouseId = orderData.warehouse_id || "wh_default";
            Inventory.reserveStockFromOrderDetails(
              validDetails,
              warehouseId,
              (reserveError) => {
                if (reserveError) {
                  console.error(
                    "Lỗi khi tạm giữ tồn kho:",
                    reserveError.message
                  );
                  // Không dừng flow
                }

                // --- STEP 5: TẠO RECEIPT ---
                createReceiptAndRespond(
                  newOrder,
                  createdDetails,
                  orderData.payment_method,
                  res
                );
              }
            );
          }
        });
      });
    });
  },
};

module.exports = OrderController;
