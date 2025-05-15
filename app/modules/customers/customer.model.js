const db = require("../../config/db.config"); // Giả sử bạn có thiết lập kết nối database ở file database.js
const { v4: uuidv4 } = require("uuid");

exports.create = (data, callback) => {
  const customer_id = uuidv4();
  const { customer_name, email, phone } = data;
  db.query(
    "INSERT INTO customers (customer_id, customer_name, email, phone) VALUES (?, ?, ?, ?)",
    [customer_id, customer_name, email, phone],
    (err, result) => {
      if (err) {
        return callback(err, null);
      }
      callback(null, { customer_id, ...data });
    }
  );
};

exports.getAll = (callback) => {
  db.query("SELECT * FROM customers", (err, results) => {
    if (err) {
      return callback(err, null);
    }
    callback(null, {
      success: true,
      data: results,
    });
  });
};

exports.getById = (customer_id, callback) => {
  db.query(
    "SELECT * FROM customers WHERE customer_id = ?",
    [customer_id],
    (err, results) => {
      if (err) {
        return callback(err, null);
      }
      if (results.length === 0) {
        return callback(null, null); // Không tìm thấy customer
      }
      callback(null, results[0]);
    }
  );
};

exports.update = (customer_id, data, callback) => {
  const {
    customer_name,
    email,
    phone,
    total_expenditure,
    status,
    total_orders,
  } = data;
  db.query(
    "UPDATE customers SET customer_name = ?, email = ?, phone = ?, total_expenditure = ?, status = ?, total_orders = ?, updated_at = CURRENT_TIMESTAMP WHERE customer_id = ?",
    [
      customer_name,
      email,
      phone,
      total_expenditure,
      status,
      total_orders,
      customer_id,
    ],
    (err, result) => {
      if (err) {
        return callback(err, null);
      }
      if (result.affectedRows === 0) {
        return callback(null, null); // Không tìm thấy customer
      }
      callback(null, { customer_id, ...data });
    }
  );
};

exports.countCompletedOrders = (customerId, callback) => {
  const countQuery = `
    SELECT COUNT(*) AS completedOrders
    FROM Orders
    WHERE customer_id = ? AND order_status = 'Hoàn tất'
  `;
  db.query(countQuery, [customerId], (err, result) => {
    if (err) {
      return callback(err);
    }
    callback(null, result[0].completedOrders);
  });
};

exports.delete = (customer_id, callback) => {
  db.query(
    "DELETE FROM customers WHERE customer_id = ?",
    [customer_id],
    (err, result) => {
      if (err) {
        return callback(err, null);
      }
      if (result.affectedRows === 0) {
        return callback(null, null); // Không tìm thấy customer
      }
      callback(null, { message: "Customer deleted successfully" });
    }
  );
};
