const OrderDetailModel = require("./orderDetail.model");

const OrderDetailService = {
  create: (data, callback) => {
    OrderDetailModel.create(data, callback);
  },

  read: (callback) => {
    OrderDetailModel.read(callback);
  },

  readById: (order_detail_id, callback) => {
    OrderDetailModel.readById(order_detail_id, callback);
  },

  getOrderDetailByOrderId: (order_id, callback) => {
    OrderDetailModel.getOrderDetailByOrderId(order_id, callback);
  },

  update: (order_detail_id, data, callback) => {
    OrderDetailModel.update(order_detail_id, data, callback);
  },

  delete: (order_detail_id, callback) => {
    OrderDetailModel.delete(order_detail_id, callback);
  },

  
};

module.exports = OrderDetailService;
