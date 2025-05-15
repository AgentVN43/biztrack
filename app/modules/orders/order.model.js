const db = require('../../config/db.config'); // Giả sử bạn có file này để quản lý kết nối DB
const { v4: uuidv4 } = require('uuid');

const Order = {
    create: (data, callback) => {
        const order_id = uuidv4();
        const { customer_id, order_date, order_code, total_amount, discount_amount, final_amount, order_status, shipping_address, payment_method, note } = data;
        db.query(
            'INSERT INTO orders (order_id, customer_id, order_date, order_code, total_amount, discount_amount, final_amount, order_status, shipping_address, payment_method, note) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [order_id, customer_id, order_date, order_code, total_amount || 0, discount_amount || 0, final_amount || 0, order_status, shipping_address, payment_method, note],
            (error, results) => {
                if (error) {
                    return callback(error, null, order_id);
                }
                callback(null, { order_id, ...data });
            }
        );
    },

    read: (callback) => {
        db.query('SELECT * FROM orders', (error, results) => {
            if (error) {
                return callback(error, null);
            }
            callback(null, results);
        });
    },

    readById: (order_id, callback) => {
        db.query('SELECT * FROM orders WHERE order_id = ?', [order_id], (error, results) => {
            if (error) {
                return callback(error, null);
            }
            if (results.length === 0) {
                return callback(null, null);
            }
            callback(null, results[0]);
        });
    },

    update: (order_id, data, callback) => {
        const { customer_id, order_date, order_code, total_amount, discount_amount, final_amount, order_status, shipping_address, payment_method, note } = data;
        db.query(
            'UPDATE orders SET customer_id = ?, order_date = ?, order_code = ?, total_amount = ?, discount_amount = ?, final_amount = ?, order_status = ?, shipping_address = ?, payment_method = ?, note = ?, updated_at = CURRENT_TIMESTAMP WHERE order_id = ?',
            [customer_id, order_date, order_code, total_amount, discount_amount, final_amount, order_status, shipping_address, payment_method, note, order_id],
            (error, results) => {
                if (error) {
                    return callback(error, null);
                }
                if (results.affectedRows === 0) {
                    return callback(null, null);
                }
                callback(null, { order_id, ...data });
            }
        );
    },

    delete: (order_id, callback) => {
        db.query('DELETE FROM orders WHERE order_id = ?', [order_id], (error, results) => {
            if (error) {
                return callback(error, null);
            }
            callback(null, results.affectedRows > 0);
        });
    }
};

module.exports = Order;