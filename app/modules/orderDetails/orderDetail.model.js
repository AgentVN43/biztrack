const db = require("../../config/db.config");
const { v4: uuidv4 } = require("uuid");

const OrderDetail = {
  create: (data, callback) => {
    const order_detail_id = uuidv4();
    const { order_id, product_id, quantity, price, discount } = data;
    db.query(
      "INSERT INTO order_details (order_detail_id, order_id, product_id, quantity, price, discount) VALUES (?, ?, ?, ?, ?, ?)",
      [order_detail_id, order_id, product_id, quantity, price, discount || 0],
      (error, results) => {
        if (error) {
          return callback(error, null, order_detail_id);
        }
        callback(null, { order_detail_id, ...data });
      }
    );
  },

  read: (callback) => {
    db.query("SELECT * FROM order_details", (error, results) => {
      if (error) {
        return callback(error, null);
      }
      callback(null, results);
    });
  },

  readById: (order_detail_id, callback) => {
    db.query(
      "SELECT * FROM order_details WHERE order_detail_id = ?",
      [order_detail_id],
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

  getOrderDetailByOrderId: (order_id, callback) => {
    const query = `
    SELECT
      orders.order_id,
      orders.order_code,
      orders.order_date,
      orders.order_status,
      orders.total_amount,
      orders.final_amount,
      orders.order_amount,
      orders.shipping_fee,
      orders.shipping_address,
      orders.payment_method,
      orders.note,
      customers.customer_name,
      customers.email,
      customers.phone,
      order_details.product_id,
      products.product_name,
      order_details.quantity,
      order_details.price,
      order_details.discount 
    FROM orders
    LEFT JOIN customers ON orders.customer_id = customers.customer_id
    LEFT JOIN order_details ON orders.order_id = order_details.order_id
    LEFT JOIN products ON order_details.product_id = products.product_id
    WHERE orders.order_id = ?
  `;

    db.query(query, [order_id], (error, results) => {
      if (error) {
        return callback(error, null);
      }

      if (results.length === 0) {
        return callback(null, null);
      }

      // Nhóm dữ liệu lại thành một object đơn hàng + mảng sản phẩm
      const order = {
        order_id: results[0].order_id,
        order_code: results[0].order_code,
        order_date: results[0].order_date,
        order_status: results[0].order_status,
        total_amount: results[0].total_amount,
        final_amount: results[0].final_amount,
        order_amount: results[0].order_amount,
        shipping_fee: results[0].shipping_fee,
        shipping_address: results[0].shipping_address,
        payment_method: results[0].payment_method,
        note: results[0].note,

        customer: {
          customer_name: results[0].customer_name,
          email: results[0].email,
          phone: results[0].phone,
        },

        products: results
          .filter((r) => r.product_id) // chỉ lấy những dòng có sản phẩm
          .map((r) => ({
            product_id: r.product_id,
            product_name: r.product_name,
            quantity: r.quantity,
            price: parseFloat(r.price),
            discount: parseFloat(r.discount) || 0
          })),
      };
      console.log("🚀 ~ db.query ~ order:", order)

      callback(null, order);
    });
  },

  update: (order_detail_id, data, callback) => {
    const { order_id, product_id, quantity, price, discount } = data;
    db.query(
      "UPDATE order_details SET order_id = ?, product_id = ?, quantity = ?, price = ?, discount = ?, updated_at = CURRENT_TIMESTAMP WHERE order_detail_id = ?",
      [order_id, product_id, quantity, price, discount, order_detail_id],
      (error, results) => {
        if (error) {
          return callback(error, null);
        }
        if (results.affectedRows === 0) {
          return callback(null, null);
        }
        callback(null, { order_detail_id, ...data });
      }
    );
  },

  delete: (order_detail_id, callback) => {
    db.query(
      "DELETE FROM order_details WHERE order_detail_id = ?",
      [order_detail_id],
      (error, results) => {
        if (error) {
          return callback(error, null);
        }
        callback(null, results.affectedRows > 0);
      }
    );
  },
};

module.exports = OrderDetail;
