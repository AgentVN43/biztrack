const OrderModel = require('./order.model');

const OrderService = {
    create: (data, callback) => {
        OrderModel.create(data, callback);
    },

    read: (callback) => {
        OrderModel.read(callback);
    },

    readById: (order_id, callback) => {
        OrderModel.readById(order_id, callback);
    },

    update: (order_id, data, callback) => {
        OrderModel.update(order_id, data, callback);
    },

    delete: (order_id, callback) => {
        OrderModel.delete(order_id, callback);
    }
};

module.exports = OrderService;