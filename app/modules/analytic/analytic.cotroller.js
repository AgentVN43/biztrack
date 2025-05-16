const AnalyticService = require("./analytic.service");

exports.get = (req, res) => {
  AnalyticService.getOrders((err, result) => {
    if (err) {
      return res.status(500).json({ error: err });
    }
    res
      .status(200)
      .json({ message: "true", data: result });
  });
};
