const db = require("../../config/db.config");
const { v4: uuidv4 } = require('uuid');

exports.create = (data, callback) => {
    const payment_id = uuidv4();
    const payment = { payment_id, ...data, payment_date: new Date() };
    db.query('INSERT INTO payments SET ?', payment, (err, result) => {
        if (err) {
            callback(err, null);
        } else {
            callback(null, { payment_id, ...payment });
        }
    });
};

exports.update = (payment_id, data, callback) => {
    db.query('UPDATE payments SET ? WHERE payment_id = ?', [data, payment_id], callback);
};

exports.getById = (payment_id, callback) => {
    db.query('SELECT * FROM payments WHERE payment_id = ?', [payment_id], (err, results) => {
        callback(err, results && results.length > 0 ? results[0] : null);
    });
};

exports.getAll = (callback) => {
    db.query('SELECT * FROM payments', callback);
};

exports.delete = (payment_id, callback) => {
    db.query('DELETE FROM payments WHERE payment_id = ?', [payment_id], callback);
};

exports.findByPurchaseOrderId = (purchase_order_id, callback) => {
    db.query('SELECT * FROM payments WHERE purchase_order_id = ?', [purchase_order_id], callback);
};

exports.updateStatusByPO = (purchase_order_id, status, callback) => {
    db.query('UPDATE payments SET status = ? WHERE purchase_order_id = ?', [status, purchase_order_id], callback);
};