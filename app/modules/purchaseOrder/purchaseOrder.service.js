const { v4: uuidv4 } = require("uuid");
const PurchaseOrder = require("./purchaseOrder.model");
const PurchaseOrderDetail = require("./purchaseOrderDetail.model");
const Inventory = require("../inventories/inventory.model"); // dùng chung module inventory

exports.createPurchaseOrder = (data, callback) => {
  const { supplier_name, warehouse_id, note, details } = data;
  const po_id = uuidv4();

  PurchaseOrder.create(
    { po_id, supplier_name, warehouse_id, note, status: "draft" },
    (err) => {
      if (err) return callback(err);

      let completed = 0;
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
            if (++completed === details.length)
              callback(null, {
                message: "Purchase order saved as draft",
                po_id,
              });
          }
        );
      }
    }
  );
};

exports.updatePurchaseOrder = (po_id, data, callback) => {
  PurchaseOrder.update(po_id, data, callback);
};

exports.updatePOWithDetails = (poId, data, details, callback) => {
  PurchaseOrder.update(poId, data, (err, result) => {
    if (err) return callback(err);

    let completed = 0;
    if (!details || details.length === 0) return callback(null, result);

    for (const item of details) {
      PurchaseOrderDetail.update(item.po_detail_id, item, (err) => {
        if (err) return callback(err);
        if (++completed === details.length) {
          callback(null, { message: "PO and details updated successfully" });
        }
      });
    }
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
//   console.log("run conf")
//   PurchaseOrder.findById(po_id, (err, order) => {
//     if (err) return callback(err);
//     if (!order) return callback(new Error('Purchase order not found'));
//     if (order.status === 'posted') return callback(new Error('Already posted'));

//     PurchaseOrderDetail.findByPOId(po_id, (err, details) => {
//       if (err) return callback(err);
//       let completed = 0;

//       for (const item of details) {
//         Inventory.findByProductAndWarehouse(item.product_id, order.warehouse_id, (err, existingInv) => {
//           if (err) return callback(err);

//           const done = () => {
//             if (++completed === details.length) {
//               PurchaseOrder.updateStatus(po_id, 'posted', new Date(), (err) => {
//                 if (err) return callback(err);
//                 callback(null, { message: 'Purchase order posted and inventory updated' });
//               });
//             }
//           };

//           if (existingInv) {
//             Inventory.update(item.product_id, order.warehouse_id, item.quantity, (err) => {
//               if (err) return callback(err);
//               done();
//             });
//           } else {
//             Inventory.create({
//               inventory_id: uuidv4(),
//               product_id: item.product_id,
//               warehouse_id: order.warehouse_id,
//               quantity: item.quantity
//             }, (err) => {
//               if (err) return callback(err);
//               done();
//             });
//           }
//         });
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
              Inventory.findByProductAndWarehouse(
                item.product_id,
                order.warehouse_id,
                (err, existingInv) => {
                  if (err) return reject(err);

                  if (existingInv) {
                    console.log("🔁 Inventory exists. Calling update...");

                    Inventory.update(
                      item.product_id,
                      order.warehouse_id,
                      item.quantity,
                      (err) => {
                        if (err) {
                          console.error("❌ Inventory.update error:", err);
                          return callback(err);
                        }
                        console.log(
                          `✅ Updated inventory for ${item.product_id}`
                        );
                        resolve();
                      }
                    );
                  } else {
                    const newInv = {
                      inventory_id: uuidv4(),
                      product_id: item.product_id,
                      warehouse_id: order.warehouse_id,
                      quantity: item.quantity,
                    };
                    Inventory.create(newInv, (err) => {
                      if (err) return reject(err);
                      console.log(
                        `✅ Created inventory for ${item.product_id}`
                      );
                      resolve();
                    });
                  }
                }
              );
            });
          })
        );

        // Khi tất cả inventory xử lý xong
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
