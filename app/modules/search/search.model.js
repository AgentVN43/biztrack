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
  // findByCustomerId: async (customerId) => {
  //   const sql =
  //     "SELECT * FROM orders WHERE customer_id = ? ORDER BY order_date DESC";
  //   try {
  //     const [rows] = await db.promise().query(sql, [customerId]);
  //     return rows;
  //   } catch (error) {
  //     console.error("Lỗi khi tìm đơn hàng theo customer ID:", error.message);
  //     throw error;
  //   }
  // },
  findByCustomerId: async (customerId) => {
    const sql = `
      SELECT
        orders.*,
        customers.customer_name
      FROM orders
      LEFT JOIN customers ON orders.customer_id = customers.customer_id
      WHERE orders.customer_id = ?
      ORDER BY orders.order_date DESC
    `;
    try {
      const [results] = await db.promise().query(sql, [customerId]);

      // Định dạng lại kết quả để dễ sử dụng ở frontend, giống như OrderModel.read
      const formattedResults = results.map((order) => ({
        order_id: order.order_id,
        order_code: order.order_code,
        order_date: order.order_date,
        order_status: order.order_status,
        shipping_address: order.shipping_address,
        shipping_fee: order.shipping_fee,
        payment_method: order.payment_method,
        note: order.note,
        total_amount: order.total_amount,
        discount_amount: order.discount_amount,
        final_amount: order.final_amount,
        created_at: order.created_at,
        updated_at: order.updated_at,
        warehouse_id: order.warehouse_id,
        customer: {
          customer_id: order.customer_id, // customer_id vẫn nằm trong orders.*
          customer_name: order.customer_name || "Khách lẻ", // Tên mặc định nếu không có
        },
      }));
      return formattedResults;
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
