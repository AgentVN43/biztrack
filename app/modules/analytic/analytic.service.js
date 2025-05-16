const AnalyticModel = require("./analytic.model");

exports.getOrders = (callback) => {
  AnalyticModel.order(callback);
};