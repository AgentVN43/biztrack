const db = require('../../config/db.config');

exports.findByProductAndWarehouse = (product_id, warehouse_id, callback) => {
  const sql = 'SELECT * FROM inventories WHERE product_id = ? AND warehouse_id = ?';
  db.query(sql, [product_id, warehouse_id], (err, results) => {
    callback(err, results && results.length ? results[0] : null);
  });
};

exports.create = ({ inventory_id, product_id, warehouse_id, quantity }, callback) => {
  const sql = 'INSERT INTO inventories (inventory_id, product_id, warehouse_id, quantity) VALUES (?, ?, ?, ?)';
  db.query(sql, [inventory_id, product_id, warehouse_id, quantity], callback);
};

exports.update = (product_id, warehouse_id, quantity, callback) => {
  const sql = 'UPDATE inventories SET quantity = quantity + ? WHERE product_id = ? AND warehouse_id = ?';
  console.log('[Inventory.update] SQL:', sql);
  console.log('[Inventory.update] Params:', quantity, product_id, warehouse_id);

  db.query(sql, [quantity, product_id, warehouse_id], (err, result) => {
    console.log('[Inventory.update] Callback Called');
    if (err) console.error('[Inventory.update] Error:', err);
    else console.log('[Inventory.update] Success:', result);
    callback(err, result);
  });
};


exports.updateQuantity = (product_id, warehouse_id, quantity, callback) => {
  const sql = 'UPDATE inventories SET quantity = quantity + ? WHERE product_id = ? AND warehouse_id = ?';
  db.query(sql, [quantity, product_id, warehouse_id], callback);
};

exports.findAll = (callback) => {
  db.query('SELECT * FROM inventories', callback);
};

exports.findById = (inventory_id, callback) => {
  db.query('SELECT * FROM inventories WHERE inventory_id = ?', [inventory_id], (err, results) => {
    callback(err, results && results.length ? results[0] : null);
  });
};

exports.deleteById = (inventory_id, callback) => {
  db.query('DELETE FROM inventories WHERE inventory_id = ?', [inventory_id], callback);
};

exports.findByWareHouseId = (warehouse_id, callback) => {
  db.query('SELECT * FROM inventories WHERE warehouse_id = ?', [warehouse_id], (err, results) => {
    callback(err, results && results.length ? results[0] : null);
  });
};