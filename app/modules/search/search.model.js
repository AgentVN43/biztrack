const db = require("../../config/db.config");

const CustomerModel = {
  findByPhone: async (phone) => {
    const query = `
      SELECT
        customer_id,
        customer_name,
        phone
      FROM customers
      WHERE phone LIKE ?
    `;
    const searchTerm = `${phone}%`;

    try {
      const [results] = await db.promise().query(query, [searchTerm]);
      return results.map((row) => ({ customer_id: row.customer_id }));
    } catch (error) {
      console.error(
        "Lỗi khi tìm khách hàng theo số điện thoại gần đúng:",
        error.message
      );
      throw error;
    }
  },
};

const OrderModel = {
  findByCustomerId: async (customerId) => {
    const sql =
      "SELECT * FROM orders WHERE customer_id = ? ORDER BY order_date DESC";
    try {
      const [rows] = await db.promise().query(sql, [customerId]);
      return rows;
    } catch (error) {
      console.error("Lỗi khi tìm đơn hàng theo customer ID:", error.message);
      throw error;
    }
  },
};

const ProductModel = {
  findByName: async (productName) => {
    const sql = "SELECT * FROM products WHERE product_name LIKE ?";
    const searchValue = `%${productName}%`;
    try {
      const [rows] = await db.promise().query(sql, [searchValue]);
      return rows;
    } catch (error) {
      console.error("Lỗi khi tìm sản phẩm theo tên:", error.message);
      throw error;
    }
  },
};

module.exports = {
  CustomerModel,
  OrderModel,
  ProductModel,
};