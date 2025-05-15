const db = require("../../config/db.config");
const { v4: uuidv4 } = require("uuid");

const OrderDetail = {
  create: (data, callback) => {
    const order_detail_id = uuidv4();
    const { order_id, product_id, quantity, price, discount } = data;
    db.query(
      "INSERT INTO order_details (order_detail_id, order_id, product_id, quantity, price, discount) VALUES (?, ?, ?, ?, ?, ?)",
      [order_detail_id, order_id, product_id, quantity, price, discount || 0],
      (error, results) => {
        if (error) {
          return callback(error, null, order_detail_id);
        }
        callback(null, { order_detail_id, ...data });
      }
    );
  },

  read: (callback) => {
    db.query("SELECT * FROM order_details", (error, results) => {
      if (error) {
        return callback(error, null);
      }
      callback(null, results);
    });
  },

  readById: (order_detail_id, callback) => {
    db.query(
      "SELECT * FROM order_details WHERE order_detail_id = ?",
      [order_detail_id],
      (error, results) => {
        if (error) {
          return callback(error, null);
        }
        if (results.length === 0) {
          return callback(null, null);
        }
        callback(null, results[0]);
      }
    );
  },

  update: (order_detail_id, data, callback) => {
    const { order_id, product_id, quantity, price, discount } = data;
    db.query(
      "UPDATE order_details SET order_id = ?, product_id = ?, quantity = ?, price = ?, discount = ?, updated_at = CURRENT_TIMESTAMP WHERE order_detail_id = ?",
      [order_id, product_id, quantity, price, discount, order_detail_id],
      (error, results) => {
        if (error) {
          return callback(error, null);
        }
        if (results.affectedRows === 0) {
          return callback(null, null);
        }
        callback(null, { order_detail_id, ...data });
      }
    );
  },

  delete: (order_detail_id, callback) => {
    db.query(
      "DELETE FROM order_details WHERE order_detail_id = ?",
      [order_detail_id],
      (error, results) => {
        if (error) {
          return callback(error, null);
        }
        callback(null, results.affectedRows > 0);
      }
    );
  },
};

module.exports = OrderDetail;
