const OrderService = require("./order.service");
const OrderDetailService = require("../orderDetails/orderDetail.service");
const TransactionService = require("../transactions/transaction.service");
const Product = require("../../controllers/product.controller");
const Inventory = require("../inventories/inventory.service");

const { v4: uuidv4 } = require("uuid");

// --- Hàm tạo receipt trong controller (tách khỏi Express) ---
// function createReceiptData(order, paymentMethod) {
//   return {
//     order_id: order.order_id,
//     receipt_code: `REC-${Date.now()}`, // Có thể thay bằng hàm generateReceiptCode()
//     receipt_date: new Date(),
//     amount: order.final_amount || order.total_amount || 0,
//     payment_method: paymentMethod || "Unknown",
//     note: `Receipt for order ${order.order_code}`,
//   };
// }

// --- Hàm tạo receipt và gọi callback khi xong ---
// function createReceiptAndRespond(order, orderDetails, paymentMethod, res) {
//   const receiptData = createReceiptData(order, paymentMethod);

//   ReceiptService.create(receiptData, (errorReceipt, newReceipt) => {
//     if (errorReceipt) {
//       return res.status(500).json({
//         message: "Failed to create receipt",
//         error: errorReceipt,
//       });
//     }

//     res.status(201).json({
//       order,
//       orderDetails,
//       receipt: newReceipt,
//     });
//   });
// }

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
        console.error("🔥 Lỗi cập nhật order:", error);
        return res
          .status(500)
          .json({ message: "Failed to update order", error: error.message || error  });
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

  // createOrderWithDetails: (req, res) => {
  //   const { order: orderData, orderDetails } = req.body;

  //   console.log("***This is orderData:", orderData);

  //   // --- STEP 1: TÍNH TOÁN TỔNG TIỀN VÀ GIẢM GIÁ ---
  //   let calculatedTotalAmount = 0;
  //   let calculatedDiscountProductAmount = 0;
  //   const orderDiscountAmount = parseFloat(orderData.order_amount || 0);

  //   const validDetails = Array.isArray(orderDetails) ? orderDetails : [];

  //   validDetails.forEach((detail) => {
  //     const price = parseFloat(detail.price) || 0;
  //     const quantity = parseInt(detail.quantity) || 0;
  //     const discount = parseFloat(detail.discount) || 0;

  //     calculatedTotalAmount += price * quantity;
  //     calculatedDiscountProductAmount += discount;
  //   });

  //   const totalDiscountAmount =
  //     orderDiscountAmount + calculatedDiscountProductAmount;
  //   const shippingFee = parseFloat(orderData.shipping_fee) || 0;
  //   const finalAmount =
  //     calculatedTotalAmount - totalDiscountAmount + shippingFee;

  //   const orderToCreate = {
  //     ...orderData,
  //     total_amount: calculatedTotalAmount,
  //     discount_amount: totalDiscountAmount,
  //     final_amount: finalAmount,
  //     order_amount: orderDiscountAmount,
  //     shipping_fee: shippingFee,
  //   };

  //   console.log("*** Final orderToCreate:", orderToCreate);

  //   // --- STEP 2: TẠO ORDER ---
  //   OrderService.create(orderToCreate, (errorOrder, newOrder) => {
  //     if (errorOrder) {
  //       return res
  //         .status(500)
  //         .json({ message: "Failed to create order", error: errorOrder });
  //     }

  //     // --- STEP 3: TẠO ORDER DETAILS ---
  //     if (validDetails.length === 0) {
  //       return createReceiptAndRespond(newOrder, [], null, res);
  //     }

  //     let createdDetails = [];
  //     let errorInDetail = null;
  //     let completedCount = 0;

  //     validDetails.forEach((detail) => {
  //       const detailData = { ...detail, order_id: newOrder.order_id };

  //       OrderDetailService.create(detailData, (errorDetail, newDetail) => {
  //         if (errorDetail) errorInDetail = errorDetail;
  //         else createdDetails.push(newDetail);

  //         completedCount++;

  //         if (completedCount === validDetails.length) {
  //           if (errorInDetail) {
  //             return res.status(500).json({
  //               message: "Failed to create some order details",
  //               error: errorInDetail,
  //             });
  //           }

  //           // --- STEP 4: TẠM GIỮ TỒN KHO ---
  //           const warehouseId = orderData.warehouse_id || "wh_default";
  //           Inventory.reserveStockFromOrderDetails(
  //             validDetails,
  //             warehouseId,
  //             (reserveError) => {
  //               if (reserveError) {
  //                 console.error(
  //                   "Lỗi khi tạm giữ tồn kho:",
  //                   reserveError.message
  //                 );
  //                 // Không dừng flow
  //               }

  //               // --- STEP 5: TẠO RECEIPT ---
  //               // createReceiptAndRespond(
  //               //   newOrder,
  //               //   createdDetails,
  //               //   orderData.payment_method,
  //               //   res
  //               // );
  //             }
  //           );
  //         }
  //       });
  //     });
  //   });
  // },

  // updateOrderWithDetail: (req, res) => {
  //   const { orderId } = req.params;
  //   const { order, orderDetails } = req.body;

  //   // --- BƯỚC 1: KIỂM TRA ĐẦU VÀO ---
  //   if (!order || !order.order_id || order.order_id !== orderId) {
  //     return res
  //       .status(400)
  //       .json({ message: "Dữ liệu không hợp lệ hoặc thiếu order_id" });
  //   }

  //   if (!Array.isArray(orderDetails)) {
  //     return res.status(400).json({ message: "orderDetails phải là mảng" });
  //   }

  //   // --- BƯỚC 2: LẤY ORDER HIỆN TẠI ---
  //   OrderService.readById(orderId, (errorOrder, existingOrder) => {
  //     if (errorOrder) {
  //       return res.status(500).json({
  //         message: "Không tìm thấy đơn hàng",
  //         error: errorOrder,
  //       });
  //     }

  //     if (!existingOrder) {
  //       return res.status(404).json({ message: "Đơn hàng không tồn tại" });
  //     }

  //     // --- BƯỚC 3: CHỈ GIỮ NHỮNG TRƯỜNG HỢP LỆ TRONG order ---
  //     const validOrderFields = [
  //       "customer_id",
  //       "order_date",
  //       "shipping_address",
  //       "payment_method",
  //       "note",
  //       "warehouse_id",
  //       "shipping_fee",
  //       "order_amount",
  //     ];

  //     const filteredOrder = {};
  //     validOrderFields.forEach((field) => {
  //       if (order[field] !== undefined) {
  //         filteredOrder[field] = order[field];
  //       }
  //     });

  //     // --- BƯỚC 4: TÍNH TOÁN LẠI TỔNG TIỀN NẾU CẦN ---
  //     let calculatedTotalAmount = 0;
  //     let calculatedDiscountProductAmount = 0;

  //     orderDetails.forEach((detail) => {
  //       const price = parseFloat(detail.price) || 0;
  //       const quantity = parseInt(detail.quantity) || 0;
  //       const discount = parseFloat(detail.discount) || 0;

  //       calculatedTotalAmount += price * quantity;
  //       calculatedDiscountProductAmount += discount;
  //     });

  //     const totalDiscountAmount =
  //       parseFloat(filteredOrder.order_amount) ||
  //       0 + calculatedDiscountProductAmount;
  //     const shippingFee = parseFloat(filteredOrder.shipping_fee) || 0;
  //     const finalAmount =
  //       calculatedTotalAmount - totalDiscountAmount + shippingFee;

  //     // --- BƯỚC 5: GỘP THÔNG TIN CẦN UPDATE ---
  //     const updatedOrder = {
  //       ...filteredOrder,
  //       total_amount: calculatedTotalAmount,
  //       discount_amount: totalDiscountAmount,
  //       final_amount: finalAmount,
  //     };

  //     // --- BƯỚC 6: CẬP NHẬT ĐƠN HÀNG ---
  //     OrderService.update(orderId, updatedOrder, async (errUpdate) => {
  //       if (errUpdate) {
  //         return res.status(500).json({
  //           message: "Lỗi khi cập nhật đơn hàng",
  //           error: errUpdate,
  //         });
  //       }

  //       // --- BƯỚC 7: XÓA order_details CŨ ---
  //       OrderDetailService.deleteByOrderId(
  //         orderId,
  //         (errDelete, resultDelete) => {
  //           if (errDelete) {
  //             return res.status(500).json({
  //               message: "Lỗi khi xóa chi tiết đơn hàng cũ",
  //               error: errDelete,
  //             });
  //           }

  //           // --- BƯỚC 8: THÊM MỚI order_details ---
  //           if (orderDetails.length > 0) {
  //             OrderDetailService.createMany(
  //               orderId,
  //               orderDetails,
  //               (errCreate) => {
  //                 if (errCreate) {
  //                   return res.status(500).json({
  //                     message: "Lỗi khi tạo chi tiết đơn hàng mới",
  //                     error: errCreate,
  //                   });
  //                 }

  //                 // --- BƯỚC 9: CẬP NHẬT TỒN KHO NẾU CẦN ---
  //                 Inventory.decreaseStockFromOrderDetails(
  //                   orderId,
  //                   (inventoryError) => {
  //                     if (inventoryError) {
  //                       console.error(
  //                         "Lỗi cập nhật tồn kho:",
  //                         inventoryError.message
  //                       );
  //                     }

  //                     return res.json({
  //                       message: "Cập nhật đơn hàng và chi tiết thành công",
  //                       data: {
  //                         order: updatedOrder,
  //                         orderDetails,
  //                       },
  //                     });
  //                   }
  //                 );
  //               }
  //             );
  //           } else {
  //             // Nếu không có chi tiết sản phẩm
  //             return res.json({
  //               message: "Cập nhật đơn hàng thành công (không có sản phẩm)",
  //               data: {
  //                 order: updatedOrder,
  //                 orderDetails: [],
  //               },
  //             });
  //           }
  //         }
  //       );
  //     });
  //   });
  // },

  // createOrderWithDetails: (req, res) => {
  //   const { order: orderData, orderDetails } = req.body;

  //   console.log("***This is orderData:", orderData);

  //   // --- STEP 1: GỌI HÀM TÍNH TOÁN ---
  //   const calculated = calculateOrderTotals(orderDetails, orderData);

  //   // --- STEP 2: GỘP VỚI DỮ LIỆU ORDER ĐỂ TẠO MỚI ---
  //   const orderToCreate = {
  //     ...orderData,
  //     total_amount: calculated.total_amount.toFixed(2),
  //     discount_amount: calculated.discount_amount.toFixed(2),
  //     final_amount: calculated.final_amount.toFixed(2),
  //     order_amount: calculated.order_amount.toFixed(2),
  //     shipping_fee: calculated.shipping_fee.toFixed(2),
  //   };

  //   console.log("*** Final orderToCreate:", orderToCreate);

  //   // --- STEP 3: TẠO ORDER ---
  //   OrderService.create(orderToCreate, (errorOrder, newOrder) => {
  //     if (errorOrder) {
  //       return res.status(500).json({
  //         message: "Failed to create order",
  //         error: errorOrder,
  //       });
  //     }

  //   //  --- STEP 4: TẠO ORDER DETAILS ---
  //     if (!Array.isArray(orderDetails) || orderDetails.length === 0) {
  //       return createReceiptAndRespond(newOrder, [], null, res);
  //     }

  //     let createdDetails = [];
  //     let errorInDetail = null;
  //     let completedCount = 0;

  //     orderDetails.forEach((detail) => {
  //       const detailData = { ...detail, order_id: newOrder.order_id };

  //       OrderDetailService.create(detailData, (errorDetail, newDetail) => {
  //         if (errorDetail) errorInDetail = errorDetail;
  //         else createdDetails.push(newDetail);

  //         completedCount++;

  //         if (completedCount === orderDetails.length) {
  //           if (errorInDetail) {
  //             return res.status(500).json({
  //               message: "Failed to create some order details",
  //               error: errorInDetail,
  //             });
  //           }

  //           // --- STEP 5: TẠM GIỮ TỒN KHO ---
  //           const warehouseId = orderData.warehouse_id || "wh_default";
  //           Inventory.reserveStockFromOrderDetails(
  //             orderDetails,
  //             warehouseId,
  //             (reserveError) => {
  //               if (reserveError) {
  //                 console.error(
  //                   "Lỗi khi tạm giữ tồn kho:",
  //                   reserveError.message
  //                 );
  //                 // Không dừng flow
  //               }

  //               // --- STEP 6: TẠO RECEIPT ---
  //               // createReceiptAndRespond(newOrder, createdDetails, orderData.payment_method, res);
  //             }
  //           );
  //         }
  //       });
  //     });
  //   });
  // },

  // createOrderWithDetails: (req, res) => {
  //   const { order: orderData, orderDetails } = req.body;

  //   console.log("***This is orderData:", orderData);

  //   // --- STEP 1: GỌI HÀM TÍNH TOÁN ---
  //   const calculated = calculateOrderTotals(orderDetails, orderData);

  //   // --- STEP 2: GỘP VỚI DỮ LIỆU ORDER ĐỂ TẠO MỚI ---
  //   const orderToCreate = {
  //     ...orderData,
  //     total_amount: calculated.total_amount.toFixed(2),
  //     discount_amount: calculated.discount_amount.toFixed(2),
  //     final_amount: calculated.final_amount.toFixed(2),
  //     order_amount: calculated.order_amount.toFixed(2),
  //     shipping_fee: calculated.shipping_fee.toFixed(2),
  //   };

  //   console.log("*** Final orderToCreate:", orderToCreate);

  //   OrderService.create(orderToCreate, (errorOrder, newOrder) => {
  //     if (errorOrder) return res.status(500).json({ error: errorOrder });

  //     if (!Array.isArray(orderDetails) || orderDetails.length === 0) {
  //       return createReceiptAndRespond(newOrder, [], null, res);
  //     }

  //     let createdDetails = [];
  //     let errorInDetail = null;
  //     let completedCount = 0;

  //     orderDetails.forEach((detail) => {
  //       const detailData = { ...detail, order_id: newOrder.order_id };

  //       OrderDetailService.create(detailData, (errorDetail, newDetail) => {
  //         if (errorDetail) errorInDetail = errorDetail;
  //         else createdDetails.push(newDetail);

  //         completedCount++;

  //         if (completedCount === orderDetails.length) {
  //           if (errorInDetail)
  //             return res.status(500).json({ error: errorInDetail });

  //           const warehouseId = orderData.warehouse_id || "wh_default";
  //           Inventory.reserveStockFromOrderDetails(
  //             orderDetails,
  //             warehouseId,
  //             (reserveError) => {
  //               if (reserveError) console.error(reserveError.message);

  //               // 🔽 Gọi createReceiptAndRespond — cần loại bỏ
  //               createReceiptAndRespond(
  //                 newOrder,
  //                 createdDetails,
  //                 orderData.payment_method,
  //                 res
  //               );
  //             }
  //           );
  //         }
  //       });
  //     });
  //   });
  // },

  // createOrderWithDetails: (req, res) => {
  //   const { order: orderData, orderDetails } = req.body;

  //   console.log("***This is orderData:", orderData);

  //   // --- STEP 1: GỌI HÀM TÍNH TOÁN ---
  //   const calculated = calculateOrderTotals(orderDetails, orderData);

  //   // --- STEP 2: GỘP VỚI DỮ LIỆU ORDER ĐỂ TẠO MỚI ---
  //   const orderToCreate = {
  //     ...orderData,
  //     total_amount: calculated.total_amount.toFixed(2),
  //     discount_amount: calculated.discount_amount.toFixed(2),
  //     final_amount: calculated.final_amount.toFixed(2),
  //     order_amount: calculated.order_amount.toFixed(2),
  //     shipping_fee: calculated.shipping_fee.toFixed(2),
  //   };

  //   console.log("*** Final orderToCreate:", orderToCreate);

  //   // --- STEP 3: TẠO ORDER ---
  //   OrderService.create(orderToCreate, (errorOrder, newOrder) => {
  //     if (errorOrder) {
  //       return res.status(500).json({
  //         message: "Failed to create order",
  //         error: errorOrder,
  //       });
  //     }

  //     // --- STEP 4: TẠO ORDER DETAILS ---
  //     if (!Array.isArray(orderDetails) || orderDetails.length === 0) {
  //       return res.status(400).json({
  //         message: "Danh sách sản phẩm trống hoặc không hợp lệ",
  //       });
  //     }

  //     let createdDetails = [];
  //     let errorInDetail = null;
  //     let completedCount = 0;

  //     orderDetails.forEach((detail) => {
  //       const detailData = { ...detail, order_id: newOrder.order_id };

  //       OrderDetailService.create(detailData, (errorDetail, newDetail) => {
  //         if (errorDetail) errorInDetail = errorDetail;
  //         else createdDetails.push(newDetail);

  //         completedCount++;

  //         if (completedCount === orderDetails.length) {
  //           if (errorInDetail) {
  //             return res.status(500).json({
  //               message: "Failed to create some order details",
  //               error: errorInDetail,
  //             });
  //           }

  //           // --- STEP 5: TẠM GIỮ TỒN KHO ---
  //           const warehouseId = orderData.warehouse_id || "wh_default";
  //           Inventory.reserveStockFromOrderDetails(
  //             orderDetails,
  //             warehouseId,
  //             (reserveError) => {
  //               if (reserveError) {
  //                 console.error(
  //                   "Lỗi khi tạm giữ tồn kho:",
  //                   reserveError.message
  //                 );
  //                 // Không dừng flow
  //               }

  //               // --- STEP 6: TẠO RECEIPT ---
  //               // createReceiptAndRespond(newOrder, createdDetails, orderData.payment_method, res);
  //             }
  //           );
  //         }
  //       });
  //     });
  //   });
  // },

  createOrderWithDetails: (req, res) => {
    const { order: orderData, orderDetails } = req.body;

    console.log("REQ.BODY:", req.body);

    if (!Array.isArray(orderDetails) || orderDetails.length === 0) {
      return res.status(400).json({
        message: "Danh sách sản phẩm trống hoặc không hợp lệ",
      });
    }

    const calculated = calculateOrderTotals(orderDetails, orderData);

    const orderToCreate = {
      ...orderData,
      total_amount: calculated.total_amount.toFixed(2),
      discount_amount: calculated.discount_amount.toFixed(2),
      final_amount: calculated.final_amount.toFixed(2),
      order_amount: calculated.order_amount.toFixed(2),
      shipping_fee: calculated.shipping_fee.toFixed(2),
    };

    OrderService.create(orderToCreate, (errorOrder, newOrder) => {
      if (errorOrder) {
        return res.status(500).json({
          message: "Tạo đơn hàng thất bại",
          error: errorOrder,
        });
      }

      const detailPromises = orderDetails.map((detail) => {
        const detailData = { ...detail, order_id: newOrder.order_id };
        return new Promise((resolve, reject) => {
          OrderDetailService.create(detailData, (err, result) => {
            if (err) reject(err);
            else resolve(result);
          });
        });
      });

      Promise.all(detailPromises)
        .then((createdDetails) => {
          Inventory.reserveStockFromOrderDetails(
            orderDetails,
            orderToCreate.warehouse_id,
            (reserveError) => {
              if (reserveError) console.error(reserveError.message);

              return res.status(201).json({
                message: "Tạo đơn hàng thành công",
                order: newOrder,
                order_details: createdDetails,
              });
            }
          );
        })
        .catch((error) => {
          return res.status(500).json({
            message: "Lỗi khi tạo chi tiết đơn hàng",
            error,
          });
        });
    });
  },

  updateOrderWithDetails: (req, res) => {
    const orderId = req.params.id;
    const orderData = req.body;

    OrderService.updateOrderWithDetails(orderId, orderData, (err, result) => {
      if (err) {
        console.error("Error updating order:", err);
        return res
          .status(500)
          .json({ message: "Failed to update order", error: err });
      }
      res
        .status(200)
        .json({ message: "Order updated successfully", data: result });
    });
  },
};

module.exports = OrderController;
