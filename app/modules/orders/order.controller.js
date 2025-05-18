const OrderService = require("./order.service");
const OrderDetailService = require("../orderDetails/orderDetail.service");
const ReceiptService = require("../receipts/receipts.service");
const TransactionService = require("../transactions/transaction.service");
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
  //     const { order, orderDetails } = req.body;

  //     // 1. Tạo order
  //     OrderService.create(order, (errorOrder, newOrder) => {
  //         if (errorOrder) {
  //             return res.status(500).json({ message: 'Failed to create order', error: errorOrder });
  //         }

  //         const createdOrderDetails = [];
  //         let errorInOrderDetail = null;
  //         let completedOrderDetailCount = 0;

  //         // 2. Tạo order details
  //         if (orderDetails && orderDetails.length > 0) {
  //             orderDetails.forEach(detail => {
  //                 const detailData = { ...detail, order_id: newOrder.order_id };
  //                 OrderDetailService.create(detailData, (errorDetail, newOrderDetail) => {
  //                     if (errorDetail) {
  //                         errorInOrderDetail = errorDetail;
  //                     } else {
  //                         createdOrderDetails.push(newOrderDetail);
  //                     }
  //                     completedOrderDetailCount++;

  //                     // Kiểm tra nếu đã xử lý hết order details
  //                     if (completedOrderDetailCount === orderDetails.length) {
  //                         if (errorInOrderDetail) {
  //                             // Xử lý lỗi nếu có lỗi khi tạo order detail (có thể rollback order nếu cần)
  //                             return res.status(500).json({ message: 'Failed to create some order details', error: errorInOrderDetail });
  //                         }

  //                         // 3. Tạo receipt sau khi order và order details được tạo
  //                         const receiptData = {
  //                             order_id: newOrder.order_id,
  //                             receipt_code: `REC-${Date.now()}`, // Ví dụ tạo mã receipt
  //                             receipt_date: new Date(),
  //                             amount: newOrder.final_amount || newOrder.total_amount || 0, // Lấy tổng tiền từ order
  //                             payment_method: order.payment_method || 'Unknown',
  //                             note: `Receipt for order ${newOrder.order_code}`
  //                         };

  //                         ReceiptService.create(receiptData, (errorReceipt, newReceipt) => {
  //                             if (errorReceipt) {
  //                                 return res.status(500).json({ message: 'Failed to create receipt', error: errorReceipt });
  //                             }

  //                             res.status(201).json({ order: newOrder, orderDetails: createdOrderDetails, receipt: newReceipt });
  //                         });
  //                     }
  //                 });
  //             });
  //         } else {
  //             // Nếu không có order details, vẫn tạo receipt cho order
  //             const receiptData = {
  //                 order_id: newOrder.order_id,
  //                 receipt_code: `REC-${Date.now()}`,
  //                 receipt_date: new Date(),
  //                 amount: newOrder.final_amount || newOrder.total_amount || 0,
  //                 payment_method: order.payment_method || 'Unknown',
  //                 note: `Receipt for order ${newOrder.order_code}`
  //             };
  //             ReceiptService.create(receiptData, (errorReceipt, newReceipt) => {
  //                 if (errorReceipt) {
  //                     return res.status(500).json({ message: 'Failed to create receipt', error: errorReceipt });
  //                 }
  //                 res.status(201).json({ order: newOrder, receipt: newReceipt, orderDetails: [] });
  //             });
  //         }
  //     });
  // }
  createOrderWithDetails: (req, res) => {
    const { order: orderData, orderDetails } = req.body;
    console.log("***This is orderData:", orderData);
    let calculatedTotalAmount = 0;
    let calculatedDiscountProductAmount = 0;
    let calculatedDiscountOrderAmount = parseFloat(orderData.order_amount || 0);

    const detailsToCreate = []; // ✅ Đã bổ sung

    if (Array.isArray(orderDetails)) {
      // Tính tổng discount từ các chi tiết sản phẩm
      calculatedDiscountProductAmount = orderDetails.reduce(
        (sum, detail) => sum + (parseFloat(detail.discount) || 0),
        0
      );

      // Tính total_amount và push vào detailsToCreate
      orderDetails.forEach((detail) => {
        const itemTotal = parseFloat(detail.price) * parseInt(detail.quantity);
        calculatedTotalAmount += itemTotal;
        detailsToCreate.push(detail); // Lưu lại để tạo OrderDetail sau
      });
    }

    // Tổng giảm giá = từ sản phẩm + từ đơn
    const calculatedDiscountAmount =
      calculatedDiscountProductAmount + calculatedDiscountOrderAmount;

    // Lấy shipping_fee từ orderData
    const shippingFee = parseFloat(orderData.shipping_fee) || 0;

    // Tiền cuối cùng
    const calculatedFinalAmount =
      (calculatedTotalAmount - calculatedDiscountAmount) + shippingFee;

    console.log("***This is calculatedFinalAmount:", calculatedFinalAmount);

    const orderToCreate = {
      ...orderData,
      total_amount: calculatedTotalAmount,
      discount_amount: calculatedDiscountAmount,
      final_amount: calculatedFinalAmount,
      order_amount: calculatedDiscountOrderAmount,
      shipping_fee: shippingFee,
    };

    console.log("orderToCreate:", orderToCreate);

    // 1. Tạo order
    OrderService.create(orderToCreate, (errorOrder, newOrder) => {
      if (errorOrder) {
        console.error("Lỗi tạo order:", errorOrder);
        return res
          .status(500)
          .json({ message: "Failed to create order", error: errorOrder });
      }

      const createdOrderDetails = [];
      let errorInOrderDetail = null;
      let completedOrderDetailCount = 0;
      const numberOfOrderDetails = detailsToCreate.length;

      // 2. Tạo order details
      if (numberOfOrderDetails > 0) {
        detailsToCreate.forEach((detail) => {
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
              if (completedOrderDetailCount === numberOfOrderDetails) {
                if (errorInOrderDetail) {
                  // Xử lý lỗi nếu có lỗi khi tạo order detail (có thể rollback order nếu cần)
                  return res.status(500).json({
                    message: "Failed to create some order details",
                    error: errorInOrderDetail,
                  });
                }

                // 3. Tạo receipt sau khi order và order details được tạo
                const receiptData = {
                  order_id: newOrder.order_id,
                  receipt_code: `REC-${Date.now()}`, // Ví dụ tạo mã receipt
                  receipt_date: new Date(),
                  // amount: newOrder.final_amount,
                  amount: calculatedFinalAmount,

                  payment_method: newOrder.payment_method || "Unknown",
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

                    res.status(201).json({
                      order: newOrder,
                      orderDetails: createdOrderDetails,
                      receipt: newReceipt,
                    });
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
          amount: calculatedFinalAmount,
          payment_method: newOrder.payment_method || "Unknown",
          note: `Receipt for order ${newOrder.order_code}`,
        };
        ReceiptService.create(receiptData, (errorReceipt, newReceipt) => {
          if (errorReceipt) {
            return res.status(500).json({
              message: "Failed to create receipt",
              error: errorReceipt,
            });
          }
          // res
          //   .status(201)
          //   .json({ order: newOrder, receipt: newReceipt, orderDetails: [] });

          // 4. Tạo transaction từ receipt vừa tạo
          const transactionData = {
            transaction_code: `TX-R-${newReceipt.receipt_code}`,
            transaction_type: "income",
            amount: newReceipt.amount,
            description:
              newReceipt.note || `Thu từ đơn hàng ${newOrder.order_id}`,
            category: "order_receipt",
            payment_method: newReceipt.payment_method,
            source_type: "receipt",
            source_id: newReceipt.receipt_id,
          };

          TransactionService.createTransaction(
            transactionData,
            (transactionErr, transaction) => {
              if (transactionErr) {
                console.error(
                  "Lỗi khi tạo transaction từ receipt:",
                  transactionErr.message
                );
                // Không dừng flow nếu transaction thất bại
              }

              // Trả về kết quả cuối cùng
              return res.status(201).json({
                success: true,
                data: {
                  order: newOrder,
                  orderDetails: createdOrderDetails,
                  receipt: newReceipt,
                  transaction,
                },
              });
            }
          );
        });
      }
    });
  },
};

module.exports = OrderController;
