const db = require('../../config/db.config');

exports.create = ({ inventory_id, product_id, warehouse_id, quantity }, callback) => {
  const sql = 'INSERT INTO inventories (inventory_id, product_id, warehouse_id, quantity) VALUES (?, ?, ?, ?)';
  db.query(sql, [inventory_id, product_id, warehouse_id, quantity], callback);
};

exports.findAll = (callback) => {
  db.query('SELECT * FROM inventories', callback);
};

exports.findById = (id, callback) => {
  db.query('SELECT * FROM inventories WHERE inventory_id = ?', [id], callback);
};

exports.update = ({ inventory_id, product_id, warehouse_id, quantity }, callback) => {
  const sql = 'UPDATE inventories SET product_id = ?, warehouse_id = ?, quantity = ? WHERE inventory_id = ?';
  db.query(sql, [product_id, warehouse_id, quantity, inventory_id], callback);
};

exports.remove = (id, callback) => {
  db.query('DELETE FROM inventories WHERE inventory_id = ?', [id], callback);
};
