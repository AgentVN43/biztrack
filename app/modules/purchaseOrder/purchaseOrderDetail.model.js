const db = require('../../config/db.config');

exports.create = ({ po_detail_id, po_id, product_id, quantity, price }, callback) => {
  const sql = 'INSERT INTO purchase_order_details (po_detail_id, po_id, product_id, quantity, price) VALUES (?, ?, ?, ?, ?)';
  db.query(sql, [po_detail_id, po_id, product_id, quantity, price], callback);
};

exports.findByPOId = (po_id, callback) => {
  const sql = 'SELECT * FROM purchase_order_details WHERE po_id = ?';
  db.query(sql, [po_id], (err, results) => {
    if (err) return callback(err);
    callback(null, results); // Đã trả về mảng các object
  });
};

exports.update = (po_detail_id, data, callback) => {
  const { product_id, quantity, price } = data;
  const sql = `
    UPDATE purchase_order_details
    SET product_id = ?, quantity = ?, price = ?
    WHERE po_detail_id = ?
  `;
  db.query(sql, [product_id, quantity, price, po_detail_id], callback);
};

exports.delete = (po_detail_id, callback) => {
  const sql = 'DELETE FROM purchase_order_details WHERE po_detail_id = ?';
  db.query(sql, [po_detail_id], callback);
};