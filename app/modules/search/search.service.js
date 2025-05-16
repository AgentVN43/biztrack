const { CustomerModel, OrderModel, ProductModel } = require("./search.model");

exports.getCustomerByPhone = (phone, callback) => {
  CustomerModel.findByPhone(phone, (error, customer) => {
    if (error) return callback(error);
    if (!customer) return callback(new Error("Không tìm thấy khách hàng"));

    return callback(null, customer);
  });
};

exports.getOrdersByCustomerPhone = (phone, callback) => {
  CustomerModel.findByPhone(phone, (error, customer) => {
    if (error) return callback(error);

    if (!customer) {
      return callback(
        new Error("Không tìm thấy khách hàng với số điện thoại này")
      );
    }

    OrderModel.findByCustomerId(customer.customer_id, (error, orders) => {
      if (error) return callback(error);
      return callback(null, orders);
    });
  });
};

exports.getProductsByName = (productName, callback) => {
  ProductModel.findByName(productName, (error, products) => {
    if (error) return callback(error);
    return callback(null, products);
  });
};
