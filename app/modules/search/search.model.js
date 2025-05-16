const db = require("../../config/db.config");

const CustomerModel = {
  findByPhone: (phone, callback) => {
    const sql = "SELECT * FROM customers WHERE phone = ?";
    db.query(sql, [phone], (error, rows) => {
      if (error) return callback(error, null);
      return callback(null, rows[0]); // trả về khách hàng nếu có
    });
  },
};

const OrderModel = {
  findByCustomerId: (customerId, callback) => {
    const sql = "SELECT * FROM orders WHERE customer_id = ? ORDER BY order_date DESC";
    db.query(sql, [customerId], (error, rows) => {
      if (error) return callback(error, null);
      return callback(null, rows); // trả về danh sách đơn hàng
    });
  },
};

const ProductModel = {
  findByName: (productName, callback) => {
    const sql = "SELECT * FROM products WHERE product_name LIKE ?";
    const searchValue = `%${productName}%`;
    db.query(sql, [searchValue], (error, rows) => {
      if (error) return callback(error, null);
      return callback(null, rows);
    });
  },
};

module.exports = {
  CustomerModel,
  OrderModel,
  ProductModel,
};