const { v4: uuidv4 } = require("uuid");
const PurchaseOrder = require("./purchaseOrder.model");
const PurchaseOrderDetail = require("./purchaseOrderDetail.model");
const Inventory = require("../inventories/inventory.model"); // dùng chung module inventory
const Payment = require("../payments/payments.model"); // Import model Payments
const Product = require("../../controllers/product.controller");

exports.createPurchaseOrder = (data, callback) => {
  const { supplier_name, warehouse_id, note, details } = data;
  const po_id = uuidv4();

  // Tính toán totalAmount ở Backend
  const totalAmount = details
    ? details.reduce(
        (sum, detail) => sum + detail.quantity * parseFloat(detail.price || 0),
        0
      )
    : 0;

  console.log("Total Amount:", totalAmount);

  PurchaseOrder.create(
    {
      po_id,
      supplier_name,
      warehouse_id,
      note,
      status: "draft",
      total_amount: totalAmount,
    },
    (err) => {
      if (err) return callback(err);

      let completed = 0;
      const numDetails = details ? details.length : 0;

      if (numDetails === 0) {
        return callback(null, {
          message: "Purchase order saved as draft",
          po_id,
          total_amount: totalAmount,
        });
      }

      for (const item of details) {
        const po_detail_id = uuidv4();
        PurchaseOrderDetail.create(
          {
            po_detail_id,
            po_id,
            product_id: item.product_id,
            quantity: item.quantity,
            price: item.price,
          },
          (err) => {
            if (err) return callback(err);
            if (++completed === numDetails) {
              callback(null, {
                message: "Purchase order saved as draft",
                po_id,
                total_amount: totalAmount,
              });
            }
          }
        );
      }
    }
  );
};

exports.updatePurchaseOrder = (po_id, data, callback) => {
  PurchaseOrder.update(po_id, data, callback);
};

// exports.updatePOWithDetails = (poId, data, details, callback) => {
//   PurchaseOrder.update(poId, data, (err, result) => {
//     if (err) return callback(err);

//     let completed = 0;
//     const detailsToProcess = details || [];
//     const totalDetails = detailsToProcess.length;

//     if (totalDetails === 0) {
//       return callback(null, {
//         message: "PO updated successfully (no details).",
//       });
//     }

//     for (const item of detailsToProcess) {
//       if (item.po_detail_id) {
//         // Cập nhật chi tiết đã tồn tại
//         PurchaseOrderDetail.update(item.po_detail_id, item, (err) => {
//           if (err) return callback(err);
//           if (++completed === totalDetails) {
//             callback(null, { message: "PO and details updated successfully" });
//           }
//         });
//       } else {
//         // Tạo mới chi tiết nếu không có po_detail_id
//         const po_detail_id = uuidv4();
//         PurchaseOrderDetail.create(
//           {
//             po_detail_id,
//             po_id: poId,
//             product_id: item.product_id,
//             quantity: item.quantity,
//             price: item.price,
//           },
//           (err) => {
//             if (err) return callback(err);
//             if (++completed === totalDetails) {
//               callback(null, {
//                 message: "PO and details updated successfully",
//               });
//             }
//           }
//         );
//       }
//     }
//   });
// };

exports.updatePOWithDetails = (poId, data, details, callback) => {
  PurchaseOrder.update(poId, data, (err, result) => {
    if (err) return callback(err);

    const detailsToProcess = details || [];
    const totalDetails = detailsToProcess.length;

    PurchaseOrderDetail.findByPOId(poId, (err, existingDetails) => {
      if (err) return callback(err);

      const existingDetailIds = existingDetails.map(
        (detail) => detail.po_detail_id
      );
      const detailsToKeepIds = detailsToProcess
        .filter((item) => item.po_detail_id)
        .map((item) => item.po_detail_id);
      const detailsToDeleteIds = existingDetailIds.filter(
        (id) => !detailsToKeepIds.includes(id)
      );

      let completed = 0;
      const totalOperations = totalDetails + detailsToDeleteIds.length;

      const checkCompletionAndFinalize = () => {
        if (completed === totalOperations) {
          updateTotalAmount();
        }
      };

      // const updateTotalAmount = () => {
      //   PurchaseOrderDetail.findByPOId(poId, (err, detailResults) => {
      //     if (err) return callback(err);

      //     const totalAmount = detailResults.reduce(
      //       (sum, detail) =>
      //         sum + detail.quantity * parseFloat(detail.price || 0),
      //       0
      //     );

      //       console.log("Updating PO with totalAmount:", totalAmount);

      //     PurchaseOrder.update(poId, { total_amount: totalAmount }, (err) => {
      //       if (err) return callback(err);
      //       callback(null, {
      //         message: "PO and details updated successfully",
      //         total_amount: totalAmount,
      //       });
      //     });
      //   });
      // };

      const updateTotalAmount = () => {
        PurchaseOrderDetail.findByPOId(poId, (err, detailResults) => {
          if (err) return callback(err);

          const totalAmount = detailResults.reduce(
            (sum, detail) =>
              sum + detail.quantity * parseFloat(detail.price || 0),
            0
          );

          PurchaseOrder.update(poId, { total_amount: totalAmount }, (err) => {
            if (err) return callback(err);

            // Sau khi cập nhật total_amount của PO, cập nhật payment (nếu có)
            Payment.findByPOId(poId, (err, paymentResults) => {
              console.log(paymentResults);
              if (err) {
                console.error("Error finding payment for PO:", err);
                // Không return callback ở đây, tiếp tục để callback chính được gọi
              } else if (paymentResults && paymentResults.length > 0) {
                const payment = paymentResults[0]; // Giả sử mỗi PO có một payment chính
                Payment.update(
                  payment.payment_id,
                  { amount: totalAmount },
                  (err) => {
                    if (err) {
                      console.error("Error updating payment amount:", err);
                    } else {
                      console.log("Payment amount updated to:", totalAmount);
                    }
                  }
                );
              } else {
                console.log("No payment found for PO:", poId);
                // Có thể tạo một payment mới ở đây nếu cần
              }
              callback(null, {
                message: "PO and details updated successfully",
                total_amount: totalAmount,
              });
            });
          });
        });
      };

      // Delete details to be removed
      detailsToDeleteIds.forEach((detailId) => {
        PurchaseOrderDetail.delete(detailId, (err) => {
          if (err) {
            console.error("Error deleting detail:", err);
            return callback(err);
          }
          completed++;
          checkCompletionAndFinalize();
        });
      });

      // Add new and update existing details
      detailsToProcess.forEach((item) => {
        if (item.po_detail_id) {
          PurchaseOrderDetail.update(item.po_detail_id, item, (err) => {
            if (err) {
              console.error("Error updating detail:", err);
              return callback(err);
            }
            completed++;
            checkCompletionAndFinalize();
          });
        } else {
          const po_detail_id = uuidv4();
          PurchaseOrderDetail.create(
            {
              po_detail_id,
              po_id: poId,
              product_id: item.product_id,
              quantity: item.quantity,
              price: item.price,
            },
            (err) => {
              if (err) {
                console.error("Error creating detail:", err);
                return callback(err);
              }
              completed++;
              checkCompletionAndFinalize();
            }
          );
        }
      });

      // Nếu không có thao tác nào (không có details gửi lên và không có gì để xóa)
      if (totalOperations === 0) {
        updateTotalAmount();
      }
    });
  });
};

exports.getAllPurchaseOrders = (callback) => {
  PurchaseOrder.findAll(callback);
};

exports.getPurchaseOrderById = (po_id, callback) => {
  PurchaseOrder.findById(po_id, callback);
};

exports.deletePurchaseOrder = (po_id, callback) => {
  PurchaseOrder.remove(po_id, callback);
};

// exports.confirmPurchaseOrder = (po_id, callback) => {
//   console.log("=== Running confirmPurchaseOrder ===");

//   PurchaseOrder.findById(po_id, (err, order) => {
//     if (err) return callback(err);
//     if (!order) return callback(new Error("Purchase order not found"));
//     if (order.status === "posted") return callback(new Error("Already posted"));

//     PurchaseOrderDetail.findByPOId(po_id, async (err, details) => {
//       if (err) return callback(err);
//       if (!details || details.length === 0)
//         return callback(new Error("No purchase order details found"));

//       try {
//         // Xử lý từng detail
//         await Promise.all(
//           details.map((item) => {
//             return new Promise((resolve, reject) => {
//               Inventory.findByProductAndWarehouse(
//                 item.product_id,
//                 order.warehouse_id,
//                 (err, existingInv) => {
//                   if (err) return reject(err);

//                   if (existingInv) {
//                     console.log("🔁 Inventory exists. Calling update...");

//                     Inventory.update(
//                       item.product_id,
//                       order.warehouse_id,
//                       item.quantity,
//                       (err) => {
//                         if (err) {
//                           console.error("❌ Inventory.update error:", err);
//                           return callback(err);
//                         }
//                         console.log(
//                           `✅ Updated inventory for ${item.product_id}`
//                         );
//                         resolve();
//                       }
//                     );
//                   } else {
//                     const newInv = {
//                       inventory_id: uuidv4(),
//                       product_id: item.product_id,
//                       warehouse_id: order.warehouse_id,
//                       quantity: item.quantity,
//                     };
//                     Inventory.create(newInv, (err) => {
//                       if (err) return reject(err);
//                       console.log(
//                         `✅ Created inventory for ${item.product_id}`
//                       );
//                       resolve();
//                     });
//                   }
//                 }
//               );
//             });
//           })
//         );

//         // Khi tất cả inventory xử lý xong
//         PurchaseOrder.updateStatus(po_id, "posted", new Date(), (err) => {
//           if (err) return callback(err);
//           callback(null, {
//             message: "Purchase order posted and inventory updated",
//           });
//         });
//       } catch (e) {
//         console.error("❌ Error in inventory processing:", e);
//         callback(e);
//       }
//     });
//   });
// };

exports.confirmPurchaseOrder = (po_id, callback) => {
  console.log("=== Running confirmPurchaseOrder ===");

  PurchaseOrder.findById(po_id, (err, order) => {
    if (err) return callback(err);
    if (!order) return callback(new Error("Purchase order not found"));
    if (order.status === "posted") return callback(new Error("Already posted"));

    PurchaseOrderDetail.findByPOId(po_id, async (err, details) => {
      if (err) return callback(err);
      if (!details || details.length === 0)
        return callback(new Error("No purchase order details found"));

      try {
        // Xử lý từng detail
        await Promise.all(
          details.map((item) => {
            return new Promise((resolve, reject) => {
              const { product_id, quantity } = item;

              // 1️⃣ Cập nhật bảng products
              Product.updateStockFields(
                product_id,
                quantity, // stock += quantity
                0, // reserved_stock giữ nguyên
                quantity, // available_stock += quantity
                (productErr) => {
                  if (productErr) return reject(productErr);

                  // 2️⃣ Cập nhật bảng inventories
                  Inventory.findByProductAndWarehouse(
                    product_id,
                    order.warehouse_id,
                    (invErr, existingInv) => {
                      if (invErr) return reject(invErr);

                      if (existingInv) {
                        // Nếu đã tồn tại -> cập nhật quantity
                        Inventory.update(
                          product_id,
                          order.warehouse_id,
                          quantity,
                          (updateErr) => {
                            if (updateErr) return reject(updateErr);
                            resolve();
                          }
                        );
                      } else {
                        // Nếu chưa có -> tạo mới inventory
                        const newInv = {
                          inventory_id: uuidv4(),
                          product_id,
                          warehouse_id: order.warehouse_id,
                          quantity,
                        };

                        Inventory.create(newInv, (createErr) => {
                          if (createErr) return reject(createErr);
                          resolve();
                        });
                      }
                    }
                  );
                }
              );
            });
          })
        );

        // Khi tất cả xử lý xong
        PurchaseOrder.updateStatus(po_id, "posted", new Date(), (err) => {
          if (err) return callback(err);
          callback(null, {
            message: "Purchase order posted and inventory updated",
          });
        });
      } catch (e) {
        console.error("❌ Error in inventory processing:", e);
        callback(e);
      }
    });
  });
};

exports.getPurchaseOrderDetailsById = (po_id, callback) => {
  PurchaseOrder.findWithDetailsById(po_id, (err, results) => {
    if (err) return callback(err);
    if (!results.length) return callback(null, null);

    const { po_id: id, supplier_name, warehouse_id, note, status } = results[0];
    const details = results.map((row) => ({
      po_detail_id: row.po_detail_id,
      product_id: row.product_id,
      product_name: row.product_name,
      sku: row.sku,
      quantity: row.quantity,
      price: row.price,
    }));

    callback(null, {
      po_id: id,
      supplier_name,
      warehouse_id,
      note,
      status,
      details,
    });
  });
};
