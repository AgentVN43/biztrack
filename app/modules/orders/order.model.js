const db = require("../../config/db.config");
const { v4: uuidv4 } = require("uuid");

const generateOrderCode = (callback) => {
  const prefix = "ORD-";
  const timestamp = Date.now();
  let sequenceNumber = 1;

  // Lấy số thứ tự đơn hàng cuối cùng từ bảng orders
  db.query(
    'SELECT IFNULL(MAX(CAST(SUBSTRING_INDEX(order_code, "-", -1) AS UNSIGNED)), 0) AS last_order_sequence FROM orders WHERE order_code LIKE ?',
    [`${prefix}%`],
    (error, rows) => {
      // Thêm callback để xử lý kết quả truy vấn
      if (error) {
        console.error(
          "Lỗi khi lấy số thứ tự đơn hàng cuối cùng từ bảng orders:",
          error
        );
        return callback(error, null); // Gọi callback với lỗi
      }
      if (rows.length > 0 && rows[0].last_order_sequence) {
        sequenceNumber = rows[0].last_order_sequence + 1;
      }

      // Tạo mã đơn hàng
      const orderCode = `${prefix}${timestamp}-${String(
        sequenceNumber
      ).padStart(4, "0")}`;

      // Cập nhật số thứ tự đơn hàng cuối cùng trong bảng orders
      db.query(
        "UPDATE orders SET order_code = ? WHERE order_id = ?",
        [orderCode, uuidv4()], // Bạn cần có một order_id để update
        (updateError) => {
          if (updateError) {
            console.error(
              "Lỗi khi cập nhật order_code trong bảng orders:",
              updateError
            );
            return callback(updateError, null);
          }
          callback(null, orderCode); // Gọi callback với mã đơn hàng
        }
      );
    }
  );
};

const Order = {
  //   create: (data, callback) => {
  //     const order_id = uuidv4();

  //     const {
  //       customer_id,
  //       order_date,
  //       total_amount,
  //       discount_amount,
  //       final_amount,
  //       order_status,
  //       shipping_address,
  //       payment_method,
  //       note,
  //     } = data;
  //     db.query(
  //       "INSERT INTO orders (order_id, customer_id, order_date, order_code, total_amount, discount_amount, final_amount, order_status, shipping_address, payment_method, note) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
  //       [
  //         order_id,
  //         customer_id,
  //         order_date,
  //         order_code,
  //         total_amount || 0,
  //         discount_amount || 0,
  //         final_amount || 0,
  //         order_status,
  //         shipping_address,
  //         payment_method,
  //         note,
  //       ],
  //       (error, results) => {
  //         if (error) {
  //           return callback(error, null, order_id);
  //         }
  //         callback(null, { order_id, ...data });
  //       }
  //     );
  //   },

  create: (data, callback) => {
    const order_id = uuidv4();
    generateOrderCode((error, order_code) => {
      // Gọi hàm tạo mã đơn hàng với callback
      if (error) {
        // Xử lý lỗi nếu không tạo được mã đơn hàng
        return callback(error, null);
      }

      const {
        customer_id,
        order_date,
        total_amount,
        discount_amount,
        final_amount,
        order_status,
        shipping_address,
        payment_method,
        note,
      } = data;
      db.query(
        "INSERT INTO orders (order_id, customer_id, order_date, order_code, total_amount, discount_amount, final_amount, order_status, shipping_address, payment_method, note) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
        [
          order_id,
          customer_id,
          order_date,
          order_code,
          total_amount || 0,
          discount_amount || 0,
          final_amount || 0,
          order_status,
          shipping_address,
          payment_method,
          note,
        ],
        (error, results) => {
          if (error) {
            return callback(error, null, order_id);
          }
          callback(null, { order_id, order_code, ...data }); // Trả về order_code
        }
      );
    });
  },

  read: (callback) => {
    const query = `
    SELECT 
      orders.*,
      customers.customer_name
    FROM orders
    LEFT JOIN customers ON orders.customer_id = customers.customer_id
    ORDER BY 
      COALESCE(orders.updated_at, orders.created_at) DESC
  `;

    db.query(query, (error, results) => {
      if (error) {
        return callback(error, null);
      }

      const formattedResults = results.map((order) => ({
        order_id: order.order_id,
        order_code: order.order_code,
        order_date: order.order_date,
        order_status: order.order_status,
        shipping_address: order.shipping_address,
        payment_method: order.payment_method,
        note: order.note,
        total_amount: order.total_amount,
        discount_amount: order.discount_amount,
        final_amount: order.final_amount,
        created_at: order.created_at,
        updated_at: order.updated_at,
        warehouse_id: order.warehouse_id,

        // 👇 Gom nhóm customer vào object riêng
        customer: {
          customer_id: order.customer_id,
          customer_name: order.customer_name || "Khách lẻ",
        },
      }));

      callback(null, formattedResults);
    });
  },

  // readById: (order_id, callback) => {
  //   const query = `
  //   SELECT
  //     orders.order_id,
  //     orders.order_code,
  //     orders.order_date,
  //     orders.order_status,
  //     orders.total_amount,
  //     orders.final_amount,
  //     customers.customer_name,
  //     customers.email,
  //     customers.phone,
  //     order_details.product_id,
  //     products.product_name,
  //     order_details.quantity,
  //     order_details.price
  //   FROM orders
  //   LEFT JOIN customers ON orders.customer_id = customers.customer_id
  //   LEFT JOIN order_details ON orders.order_id = order_details.order_id
  //   LEFT JOIN products ON order_details.product_id = products.product_id
  //   WHERE orders.order_id = ?
  // `;

  //   db.query(query, [order_id], (error, results) => {
  //     if (error) {
  //       return callback(error, null);
  //     }

  //     if (results.length === 0) {
  //       return callback(null, null);
  //     }

  //     // Nhóm dữ liệu lại thành một object đơn hàng + mảng sản phẩm
  //     const order = {
  //       order_id: results[0].order_id,
  //       order_code: results[0].order_code,
  //       order_date: results[0].order_date,
  //       order_status: results[0].order_status,
  //       total_amount: results[0].total_amount,
  //       final_amount: results[0].final_amount,

  //       customer: {
  //         customer_name: results[0].customer_name,
  //         email: results[0].email,
  //         phone: results[0].phone,
  //       },

  //       products: results
  //         .filter((r) => r.product_id) // chỉ lấy những dòng có sản phẩm
  //         .map((r) => ({
  //           product_id: r.product_id,
  //           product_name: r.product_name,
  //           quantity: r.quantity,
  //           price: r.price,
  //         })),
  //     };

  //     callback(null, order);
  //   });
  // },

  readById: (order_id, callback) => {
    db.query(
      "SELECT * FROM orders WHERE order_id = ?",
      [order_id],
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

  update: (order_id, data, callback) => {
    const {
      customer_id,
      order_date,
      order_code,
      total_amount,
      discount_amount,
      final_amount,
      order_status,
      shipping_address,
      payment_method,
      note,
    } = data;
    db.query(
      "UPDATE orders SET customer_id = ?, order_date = ?, order_code = ?, total_amount = ?, discount_amount = ?, final_amount = ?, order_status = ?, shipping_address = ?, payment_method = ?, note = ?, updated_at = CURRENT_TIMESTAMP WHERE order_id = ?",
      [
        customer_id,
        order_date,
        order_code,
        total_amount,
        discount_amount,
        final_amount,
        order_status,
        shipping_address,
        payment_method,
        note,
        order_id,
      ],
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
    db.query(
      "DELETE FROM orders WHERE order_id = ?",
      [order_id],
      (error, results) => {
        if (error) {
          return callback(error, null);
        }
        callback(null, results.affectedRows > 0);
      }
    );
  },
};

module.exports = Order;
