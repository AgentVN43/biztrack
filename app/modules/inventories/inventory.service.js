const { v4: uuidv4 } = require("uuid");
const Inventory = require("./inventory.model");
const Product = require("../../controllers/product.controller");

exports.createInventory = (data, callback) => {
  const inventory = {
    inventory_id: uuidv4(),
    ...data,
  };

  Inventory.findByProductAndWarehouse(
    data.product_id,
    data.warehouse_id,
    (err, existing) => {
      if (err) return callback(err);
      if (existing)
        return callback(
          new Error(
            "Inventory already exists for this product in the warehouse"
          )
        );

      Inventory.create(inventory, callback);
    }
  );
};

exports.getAllInventories = (callback) => {
  Inventory.findAll(callback);
};

exports.getInventoryById = (id, callback) => {
  Inventory.findById(id, callback);
};

exports.deleteInventory = (id, callback) => {
  Inventory.deleteById(id, callback);
};

exports.updateInventory = (inventory_id, data, callback) => {
  Inventory.update(inventory_id, data, callback);
};

exports.getByWareHouseId = (id, callback) => {
  Inventory.findByWareHouseId(id, callback);
};

exports.getAllInventoriesByWarehouse = async (id, callback) => {
  Inventory.findByWareHouseId(id, callback);
};

// exports.updateProductStock = (
//   product_id,
//   stockChange,
//   reservedChange,
//   availableChange,
//   callback
// ) => {
//   Product.updateStockFields(
//     product_id,
//     stockChange,
//     reservedChange,
//     availableChange,
//     callback
//   );
// };

exports.increaseQuantity = (product_id, warehouse_id, quantity, callback) => {
  Inventory.updateQuantity(product_id, warehouse_id, quantity, callback);
};

exports.increaseStockFromPurchaseOrder = (
  orderDetails,
  warehouse_id,
  callback
) => {
  let completed = 0;

  if (!orderDetails || orderDetails.length === 0) {
    return callback(new Error("Không có orderDetails"));
  }

  const updateNext = () => {
    const { product_id, quantity } = orderDetails[completed];

    // Cập nhật products
    ProductModel.updateStockFields(
      product_id,
      quantity, // stock += quantity
      0, // reserved_stock giữ nguyên
      quantity, // available_stock += quantity
      (productErr) => {
        if (productErr) return callback(productErr);

        // Cập nhật inventories
        Inventory.findByProductAndWarehouse(
          product_id,
          warehouse_id,
          (invErr, existing) => {
            if (invErr) return callback(invErr);

            if (existing) {
              Inventory.updateQuantity(
                product_id,
                warehouse_id,
                quantity,
                handleCallback
              );
            } else {
              Inventory.create(
                {
                  inventory_id: uuidv4(),
                  product_id,
                  warehouse_id,
                  quantity,
                  reserved_quantity: 0,
                  available_quantity: quantity,
                },
                handleCallback
              );
            }
          }
        );
      }
    );
  };

  const handleCallback = (err) => {
    if (err) return callback(err);
    completed++;

    if (completed === orderDetails.length) {
      return callback(null);
    } else {
      updateNext();
    }
  };

  updateNext();
};

// 2️⃣ Giữ tồn kho khi tạo đơn hàng
// exports.reserveStockFromOrderDetails = (
//   orderDetails,
//   warehouse_id,
//   callback
// ) => {
//   if (!orderDetails || orderDetails.length === 0) return callback(null);

//   let completed = 0;

//   for (const detail of orderDetails) {
//     const { product_id, quantity } = detail;

//     Product.updateStockFields(
//       product_id,
//       0, // stock giữ nguyên
//       quantity, // reserved_stock += quantity
//       -quantity, // available_stock -= quantity
//       (productErr) => {
//         if (productErr) return callback(productErr);

//         Inventory.findByProductAndWarehouse(
//           product_id,
//           warehouse_id,
//           (invErr, existingInv) => {
//             if (invErr) console.error(invErr);

//             if (existingInv) {
//               Inventory.updateReservedAndAvailable(
//                 product_id,
//                 warehouse_id,
//                 quantity,
//                 () => {
//                   completed++;
//                   if (completed === orderDetails.length) callback(null);
//                 }
//               );
//             } else {
//               completed++;
//               if (completed === orderDetails.length) callback(null);
//             }
//           }
//         );
//       }
//     );
//   }
// };

exports.reserveStockFromOrderDetails = (
  orderDetails,
  warehouse_id,
  callback
) => {
  if (!orderDetails || orderDetails.length === 0) return callback(null);

  let completed = 0;

  orderDetails.forEach(({ product_id, quantity }) => {
    Inventory.updateReservedAndAvailable(
      product_id,
      warehouse_id,
      quantity, // +reserved
      -quantity, // -available
      (err) => {
        if (err) return callback(err);

        completed++;
        if (completed === orderDetails.length) callback(null);
      }
    );
  });
};

// Khi hủy đơn hàng
exports.releaseReservedStock = (orderDetails, warehouse_id, callback) => {
  let completed = 0;

  orderDetails.forEach(({ product_id, quantity }) => {
    Inventory.updateReservedAndAvailable(
      product_id,
      warehouse_id,
      -quantity, // -reserved
      quantity, // +available
      (err) => {
        if (err) return callback(err);

        completed++;
        if (completed === orderDetails.length) callback(null);
      }
    );
  });
};

// Khi xác nhận đơn hàng
exports.confirmStockReservation = (orderDetails, warehouse_id, callback) => {
  let completed = 0;

  orderDetails.forEach(({ product_id, quantity }) => {
    Inventory.confirmReservation(product_id, warehouse_id, quantity, (err) => {
      if (err) return callback(err);

      completed++;
      if (completed === orderDetails.length) callback(null);
    });
  });
};

exports.decreaseStockFromOrderDetails = (
  orderDetails,
  warehouse_id,
  callback
) => {
  let completed = 0;

  if (!orderDetails || orderDetails.length === 0) {
    return callback(new Error("Không có sản phẩm trong đơn hàng"));
  }

  const updateNext = () => {
    const { product_id, quantity } = orderDetails[completed];

    // Giảm tồn kho: stock -= quantity
    ProductModel.updateStockFromOrderDetails(
      product_id,
      -quantity, // ⚠️ Lưu ý là số âm để giảm
      0, // reserved_stock giữ nguyên (nếu cần có thể tăng)
      -quantity, // available_stock -= quantity
      (productErr) => {
        if (productErr) return callback(productErr);

        // Cập nhật inventories
        Inventory.findByProductAndWarehouse(
          product_id,
          warehouse_id,
          (invErr, existing) => {
            if (invErr) return callback(invErr);

            if (existing) {
              Inventory.updateQuantity(
                product_id,
                warehouse_id,
                -quantity, // giảm tồn kho theo warehouse
                handleCallback
              );
            } else {
              // Nếu chưa có tồn kho ở kho này
              return callback(
                new Error(
                  `Không tìm thấy tồn kho của sản phẩm ${product_id} tại kho ${warehouse_id}`
                )
              );
            }
          }
        );
      }
    );
  };

  const handleCallback = (err) => {
    if (err) return callback(err);
    completed++;

    if (completed === orderDetails.length) {
      return callback(null);
    } else {
      updateNext();
    }
  };

  updateNext();
};
