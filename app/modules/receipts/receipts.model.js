const db = require("../../config/db.config"); // Giả sử bạn có file này
const { v4: uuidv4 } = require("uuid");

const Receipt = {
  create: (data, callback) => {
    const receipt_id = uuidv4();
    const {
      order_id,
      receipt_code,
      receipt_date,
      amount,
      payment_method,
      note,
    } = data;
    db.query(
      "INSERT INTO receipts (receipt_id, order_id, receipt_code, receipt_date, amount, payment_method, note) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [
        receipt_id,
        order_id,
        receipt_code,
        receipt_date,
        amount,
        payment_method,
        note,
      ],
      (error, results) => {
        if (error) {
          return callback(error, null, receipt_id);
        }
        callback(null, { receipt_id, ...data });
      }
    );
  },

  read: (callback) => {
    db.query("SELECT * FROM receipts", (error, results) => {
      if (error) {
        return callback(error, null);
      }
      callback(null, results);
    });
  },

  readById: (receipt_id, callback) => {
    db.query(
      "SELECT * FROM receipts WHERE receipt_id = ?",
      [receipt_id],
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

  update: (receipt_id, data, callback) => {
    const {
      order_id,
      receipt_code,
      receipt_date,
      amount,
      payment_method,
      note,
    } = data;
    db.query(
      "UPDATE receipts SET order_id = ?, receipt_code = ?, receipt_date = ?, amount = ?, payment_method = ?, note = ?, updated_at = CURRENT_TIMESTAMP WHERE receipt_id = ?",
      [
        order_id,
        receipt_code,
        receipt_date,
        amount,
        payment_method,
        note,
        receipt_id,
      ],
      (error, results) => {
        if (error) {
          return callback(error, null);
        }
        if (results.affectedRows === 0) {
          return callback(null, null);
        }
        callback(null, { receipt_id, ...data });
      }
    );
  },

  delete: (receipt_id, callback) => {
    db.query(
      "DELETE FROM receipts WHERE receipt_id = ?",
      [receipt_id],
      (error, results) => {
        if (error) {
          return callback(error, null);
        }
        callback(null, results.affectedRows > 0);
      }
    );
  },

  markAsCancelled: (order_id, callback) => {
    const sql = `
      UPDATE receipts 
      SET receipt_status = 'Huỷ đơn', note = CONCAT(note, ' [Hủy đơn]'), updated_at = CURRENT_TIMESTAMP 
      WHERE order_id = ?
    `;
    db.query(sql, [order_id], (err, result) => {
      if (err) return callback(err);
      callback(null, result);
    });
  },

  markAsPaid: (order_id, callback) => {
    const sql = `
      UPDATE receipts 
      SET receipt_status = 'Hoàn tất', updated_at = CURRENT_TIMESTAMP 
      WHERE order_id = ?
    `;
    db.query(sql, [order_id], (err, result) => {
      if (err) return callback(err);
      callback(null, result);
    });
  },
};

module.exports = Receipt;
