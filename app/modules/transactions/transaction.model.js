const db = require('../../config/db.config');
const { v4: uuidv4 } = require('uuid');

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
      source_id
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
        source_id
      ],
      (error, results) => {
        if (error) return callback(error);
        return callback(null, {
          transaction_id,
          ...data
        });
      }
    );
  },

  findAll: (callback) => {
    db.query("SELECT * FROM transactions ORDER BY created_at DESC", (error, rows) => {
      if (error) return callback(error);
      return callback(null, rows);
    });
  },

  findById: (id, callback) => {
    db.query("SELECT * FROM transactions WHERE transaction_id = ?", [id], (error, rows) => {
      if (error) return callback(error);
      return callback(null, rows[0]);
    });
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
      source_id
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
        id
      ],
      (error, results) => {
        if (error) return callback(error);
        return callback(null, { transaction_id: id, ...data });
      }
    );
  },

  deleteById: (id, callback) => {
    db.query("DELETE FROM transactions WHERE transaction_id = ?", [id], (error) => {
      if (error) return callback(error);
      return callback(null, { message: "Xóa thành công" });
    });
  },
};

module.exports = TransactionModel;