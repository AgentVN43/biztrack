const db = require("../../config/db.config");

// exports.findByProductAndWarehouse = (product_id, warehouse_id, callback) => {
//   const sql = 'SELECT * FROM inventories WHERE product_id = ? AND warehouse_id = ?';
//   db.query(sql, [product_id, warehouse_id], (err, results) => {
//     callback(err, results && results.length ? results[0] : null);
//   });
// };

exports.findByProductAndWarehouse = (product_id, warehouse_id, callback) => {
  const sql =
    "SELECT product_id, warehouse_id, SUM(quantity) AS total_quantity FROM inventories WHERE product_id = ? AND warehouse_id = ? GROUP BY product_id, warehouse_id";
  db.query(sql, [product_id, warehouse_id], (err, results) => {
    callback(err, results && results.length ? results[0] : null);
  });
};

exports.create = (
  { inventory_id, product_id, warehouse_id, quantity },
  callback
) => {
  const sql =
    "INSERT INTO inventories (inventory_id, product_id, warehouse_id, quantity, available_stock ) VALUES (?, ?, ?, ?, ?)";
  db.query(
    sql,
    [inventory_id, product_id, warehouse_id, quantity, quantity],
    callback
  );
};

exports.update = (product_id, warehouse_id, quantity, callback) => {
  const sql = `UPDATE inventories
    SET 
      quantity = quantity + ?, 
      available_stock = available_stock + ?, 
      updated_at = CURRENT_TIMESTAMP
    WHERE product_id = ? AND warehouse_id = ?`;

  db.query(
    sql,
    [quantity, quantity, product_id, warehouse_id],
    (err, result) => {
      if (err);
      else;
      callback(err, result);
    }
  );
};

// exports.updateQuantity = (product_id, warehouse_id, quantity, callback) => {
//   const sql = `UPDATE inventories
//     SET
//       quantity = quantity + ?,
//       available_stock = available_stock + ?,
//       updated_at = CURRENT_TIMESTAMP
//     WHERE product_id = ? AND warehouse_id = ?`;
//   db.query(sql, [quantity, product_id, warehouse_id], callback);
// };

exports.updateQuantity = (
  product_id,
  warehouse_id,
  { quantityDelta = 0, reservedDelta = 0, availableDelta = 0 },
  callback
) => {
  const sql = `
    UPDATE inventories
    SET
      quantity = quantity + ?,
      reserved_stock = reserved_stock + ?,
      available_stock = available_stock + ?,
      updated_at = CURRENT_TIMESTAMP
    WHERE product_id = ? AND warehouse_id = ?
  `;

  const values = [
    quantityDelta,
    reservedDelta,
    availableDelta,
    product_id,
    warehouse_id,
  ];

  db.query(sql, values, callback);
};

// exports.findAll = (callback) => {
//   db.query('SELECT * FROM inventories', callback);
// };

exports.findAll = (callback) => {
  const sql = `
    SELECT
      i.inventory_id,
      i.quantity,
      i.created_at,
      i.updated_at,
      i.reserved_stock,
      i.available_stock,
      p.product_id,
      p.product_name,
      p.category_id, -- Lấy category_id từ bảng products
      c.category_name, -- Lấy category_name từ bảng categories
      w.warehouse_id AS warehouse_id,
      w.warehouse_name
    FROM inventories i
    JOIN products p ON i.product_id = p.product_id
    JOIN warehouses w ON i.warehouse_id = w.warehouse_id
    LEFT JOIN categories c ON p.category_id = c.category_id -- Sử dụng LEFT JOIN nếu không phải product nào cũng có category
  `;
  db.query(sql, (err, results) => {
    // Chuyển đổi cấu trúc results để nhóm warehouse và product
    const formattedResults = results.map((row) => ({
      inventory_id: row.inventory_id,
      created_at: row.created_at,
      updated_at: row.updated_at,
      product: {
        product_id: row.product_id,
        product_name: row.product_name,
        quantity: row.quantity,
        reserved_stock: row.reserved_stock,
        available_stock: row.available_stock,
        category: row.category_id
          ? {
              category_id: row.category_id,
              category_name: row.category_name,
            }
          : null,
      },

      warehouse: {
        warehouse_id: row.warehouse_id,
        warehouse_name: row.warehouse_name,
      },
    }));
    callback(err, formattedResults);
  });
};

exports.findById = (inventory_id, callback) => {
  db.query(
    "SELECT * FROM inventories WHERE inventory_id = ?",
    [inventory_id],
    (err, results) => {
      callback(err, results && results.length ? results[0] : null);
    }
  );
};

exports.deleteById = (inventory_id, callback) => {
  db.query(
    "DELETE FROM inventories WHERE inventory_id = ?",
    [inventory_id],
    callback
  );
};

// exports.findByWareHouseId = (warehouse_id, callback) => {
//   db.query('SELECT * FROM inventories WHERE warehouse_id = ?', [warehouse_id], (err, results) => {
//     callback(err, results && results.length ? results[0] : null);
//   });
// };

exports.findByWareHouseId = (warehouse_id, callback) => {
  const sql = `
    SELECT
      i.product_id,
      p.product_name,
      p.product_retail_price,
      SUM(i.quantity) AS total_quantity,
      SUM(i.available_stock) AS available_quantity,
      SUM(i.reserved_stock) AS reserved_quantity
    FROM inventories i
    JOIN products p ON i.product_id = p.product_id
    WHERE i.warehouse_id = ?
    GROUP BY i.product_id, p.product_name
    ORDER BY p.product_name ASC
  `;
  db.query(sql, [warehouse_id], (err, results) => {
    if (err) {
      console.error(
        "[Inventory.findByWareHouseId] Lỗi khi truy vấn:",
        err.message
      );
      return callback(err, null);
    }

    if (!results || results.length === 0) {
      return callback(null, []);
    }

    callback(null, results);
  });
};

exports.updateReservedAndAvailable = (
  product_id,
  warehouse_id,
  reservedDelta,
  availableDelta,
  callback
) => {
  const query = `
    UPDATE inventories
    SET
      reserved_stock = reserved_stock + ?,
      available_stock = available_stock + ?,
      updated_at = CURRENT_TIMESTAMP
    WHERE product_id = ? AND warehouse_id = ?
  `;
  db.query(
    query,
    [reservedDelta, availableDelta, product_id, warehouse_id],
    callback
  );
};

exports.updateQuantity = (
  product_id,
  warehouse_id,
  quantityDelta,
  callback
) => {
  const query = `
    UPDATE inventories
    SET
      quantity = quantity + ?,
      available_stock = available_stock + ?,
      updated_at = CURRENT_TIMESTAMP
    WHERE product_id = ? AND warehouse_id = ?
  `;
  db.query(
    query,
    [quantityDelta, quantityDelta, product_id, warehouse_id],
    callback
  );
};

// Trừ quantity và reserved_stock (xác nhận đơn hàng)

exports.confirmReservation = (product_id, warehouse_id, quantity, callback) => {
  const sql = `
    UPDATE inventories
    SET
      quantity = quantity - ?,
      reserved_stock = reserved_stock - ?,
      available_stock = (quantity - ? - (reserved_stock - ?))
    WHERE product_id = ? AND warehouse_id = ? AND reserved_stock >= ? AND quantity >= ?
  `;

  const values = [
    quantity,
    quantity,
    quantity,
    quantity,
    product_id,
    warehouse_id,
    quantity,
    quantity,
  ];

  db.query(sql, values, (err, result) => {
    if (err) return callback(err);
    if (result.affectedRows === 0)
      return callback(new Error("Không đủ hàng trong kho hoặc hàng tạm giữ"));
    callback(null);
  });
};

exports.updateInventoryFields = (
  product_id,
  warehouse_id,
  { quantityDelta = 0, reservedDelta = 0, availableDelta = 0 },
  callback
) => {
  const sql = `
    UPDATE inventories
    SET
      quantity = quantity + ?,
      reserved_stock = reserved_stock + ?,
      available_stock = available_stock + ?,
      updated_at = CURRENT_TIMESTAMP
    WHERE product_id = ? AND warehouse_id = ?
  `;

  const values = [
    quantityDelta,
    reservedDelta,
    availableDelta,
    product_id,
    warehouse_id,
  ];

  db.query(sql, values, callback);
};
