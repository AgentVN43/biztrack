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
    "INSERT INTO inventories (inventory_id, product_id, warehouse_id, quantity) VALUES (?, ?, ?, ?)";
  db.query(sql, [inventory_id, product_id, warehouse_id, quantity], callback);
};

exports.update = (product_id, warehouse_id, quantity, callback) => {
  const sql =
    "UPDATE inventories SET quantity = quantity + ? WHERE product_id = ? AND warehouse_id = ?";
  console.log("[Inventory.update] SQL:", sql);
  console.log("[Inventory.update] Params:", quantity, product_id, warehouse_id);

  db.query(sql, [quantity, product_id, warehouse_id], (err, result) => {
    console.log("[Inventory.update] Callback Called");
    if (err) console.error("[Inventory.update] Error:", err);
    else console.log("[Inventory.update] Success:", result);
    callback(err, result);
  });
};

exports.updateQuantity = (product_id, warehouse_id, quantity, callback) => {
  const sql =
    "UPDATE inventories SET quantity = quantity + ? WHERE product_id = ? AND warehouse_id = ?";
  db.query(sql, [quantity, product_id, warehouse_id], callback);
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
      SUM(i.quantity) AS total_quantity,
      p.product_name
    FROM inventories i
    JOIN products p ON i.product_id = p.product_id
    WHERE i.warehouse_id = ?
    GROUP BY i.product_id, p.product_name
  `;
  db.query(sql, [warehouse_id], (err, results) => {
    callback(err, results);
  });
};
