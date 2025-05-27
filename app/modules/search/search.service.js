const { CustomerModel, OrderModel, ProductModel } = require("./search.model");

exports.getCustomerByPhone = async (phone) => {
  try {
    const customers = await CustomerModel.findByPhone(phone);
    if (!customers || customers.length === 0) {
      throw new Error("Không tìm thấy khách hàng");
    }
    // findByPhone hiện tại trả về mảng, nếu bạn mong đợi một khách hàng duy nhất, bạn có thể trả về phần tử đầu tiên
    return customers;
  } catch (error) {
    console.error(
      "Lỗi trong Search Service (getCustomerByPhone):",
      error.message
    );
    throw error;
  }
};

// exports.getOrdersByCustomerPhone = async (partialPhone) => {
//   try {
//     const customers = await CustomerModel.findByPhone(partialPhone);

//     if (!customers || customers.length === 0) {
//       return [];
//     }

//     const allOrders = [];
//     for (const customer of customers) {
//       const orders = await OrderModel.findByCustomerId(customer.customer_id);
//       allOrders.push(...orders);
//     }
//     console.log("This is allOrders:", allOrders);
//     return allOrders;
//   } catch (error) {
//     console.error(
//       "Lỗi trong Search Service (getOrdersByCustomerPhone):",
//       error.message
//     );
//     throw error;
//   }
// };
exports.getOrdersByCustomerPhone = async (partialPhone, skip, limit) => {
  try {
    const customers = await CustomerModel.findByPhone(partialPhone);

    if (!customers || customers.length === 0) {
      return { orders: [], total: 0 };
    }

    let allOrders = [];
    let totalOrders = 0;

    for (const customer of customers) {
      const result = await OrderModel.findByCustomerId(
        customer.customer_id,
        skip,
        limit // Chúng ta sẽ phân trang *tất cả* đơn hàng tìm thấy, không theo từng khách hàng
      );
      allOrders = [...allOrders, ...result.orders];
      totalOrders += result.total; // Cộng dồn tổng số đơn hàng (có thể không chính xác lắm theo logic này)
      // Lưu ý: Logic tính tổng số đơn hàng ở đây có thể cần điều chỉnh
      // tùy thuộc vào yêu cầu cụ thể của bạn về việc phân trang kết quả.
    }

    console.log("This is allOrders:", allOrders);
    return { orders: allOrders, total: totalOrders };
  } catch (error) {
    console.error(
      "Lỗi trong Search Service (getOrdersByCustomerPhone):",
      error.message
    );
    throw error;
  }
};

exports.getProductsByName = async (name, limit, skip) => {
  try {
    const { products, total } = await ProductModel.findByName(
      name,
      limit,
      skip
    );
    return { products, total };
  } catch (error) {
    console.error(
      "Lỗi trong Search Service (getProductsByName):",
      error.message
    );
    throw error;
  }
};
