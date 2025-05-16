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

    const sql = `
      INSERT INTO transactions (
        transaction_id, transaction_code, transaction_type, amount, 
        description, category, payment_method, source_type, source_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(
      sql,
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
};

module.exports = TransactionModel;
