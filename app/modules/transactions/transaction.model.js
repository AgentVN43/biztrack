const db = require("../../config/db.config");
const { v4: uuidv4 } = require("uuid");

const TransactionModel = {
  create: (data, callback) => {
    const transaction_id = uuidv4();
    const {
      transaction_code,
      transaction_type,
      amount,
      description,
      category,
      payment_method,
      source_type,
      source_id,
    } = data;

    db.query(
      `INSERT INTO transactions (
        transaction_id, transaction_code, transaction_type, amount, 
        description, category, payment_method, source_type, source_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        transaction_id,
        transaction_code,
        transaction_type,
        amount,
        description,
        category,
        payment_method,
        source_type,
        source_id,
      ],
      (error, results) => {
        if (error) return callback(error);
        return callback(null, {
          transaction_id,
          ...data,
        });
      }
    );
  },

  findAll: (callback) => {
    db.query(
      "SELECT * FROM transactions ORDER BY created_at DESC",
      (error, rows) => {
        if (error) return callback(error);
        return callback(null, rows);
      }
    );
  },

  findById: (id, callback) => {
    db.query(
      "SELECT * FROM transactions WHERE transaction_id = ?",
      [id],
      (error, rows) => {
        if (error) return callback(error);
        return callback(null, rows[0]);
      }
    );
  },

  updateById: (id, data, callback) => {
    const {
      transaction_code,
      transaction_type,
      amount,
      description,
      category,
      payment_method,
      source_type,
      source_id,
    } = data;

    db.query(
      `UPDATE transactions SET
        transaction_code = ?, transaction_type = ?, amount = ?,
        description = ?, category = ?, payment_method = ?,
        source_type = ?, source_id = ?
       WHERE transaction_id = ?`,
      [
        transaction_code,
        transaction_type,
        amount,
        description,
        category,
        payment_method,
        source_type,
        source_id,
        id,
      ],
      (error, results) => {
        if (error) return callback(error);
        return callback(null, { transaction_id: id, ...data });
      }
    );
  },

  deleteById: (id, callback) => {
    db.query(
      "DELETE FROM transactions WHERE transaction_id = ?",
      [id],
      (error) => {
        if (error) return callback(error);
        return callback(null, { message: "Xóa thành công" });
      }
    );
  },

  confirmPayment: (order_id, callback) => {
    const transaction_status = "Hoàn tất"; // hoặc bạn dùng 'Hoàn tất'
    const updated_at = new Date();

    const sql = `
    UPDATE transactions 
    SET transaction_status = ?, updated_at = ? 
    WHERE source_type = 'receipt' AND source_id IN (
      SELECT receipt_id FROM receipts WHERE order_id = ?
    )`;

    db.query(sql, [transaction_status, updated_at, order_id], (error, results) => {
      if (error) return callback(error);

      if (results.affectedRows === 0) {
        return callback(null, null); // Không tìm thấy transaction nào để cập nhật
      }

      callback(null, {
        order_id,
        transaction_status,
        updated_at,
      });
    });
  },

  markAsCancelled: (order_id, callback) => {
    const sql = `
    UPDATE transactions 
    SET transaction_status = 'Huỷ đơn', note = CONCAT(IFNULL(note, ''), ' [Hủy đơn]'), updated_at = CURRENT_TIMESTAMP 
    WHERE source_type = 'receipt' AND source_id IN (
      SELECT receipt_id FROM receipts WHERE order_id = ?
    )`;

    db.query(sql, [order_id], (err, result) => {
      if (err) return callback(err);
      callback(null, result);
    });
  },
};

module.exports = TransactionModel;
