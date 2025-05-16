const SearchService = require("./search.service");

exports.searchCustomerByPhone = (req, res) => {
  const { phone } = req.query;

  if (!phone) {
    return res.status(400).json({
      success: false,
      error: "Số điện thoại là bắt buộc",
    });
  }

  SearchService.getCustomerByPhone(phone, (error, customer) => {
    if (error) {
      return res.status(404).json({
        success: false,
        error: error.message,
      });
    }

    return res.json({
      success: true,
      data: customer,
    });
  });
};

exports.searchOrdersByPhone = (req, res) => {
  const { phone } = req.query;

  if (!phone) {
    return res
      .status(400)
      .json({ success: false, error: "Số điện thoại là bắt buộc" });
  }

  SearchService.getOrdersByCustomerPhone(phone, (error, orders) => {
    if (error) {
      return res.status(404).json({ success: false, error: error.message });
    }
    return res.json({ success: true, data: orders });
  });
};

exports.searchProductsByName = (req, res) => {
  const { name } = req.query;

  if (!name) {
    return res.status(400).json({
      success: false,
      error: "Tên sản phẩm là bắt buộc",
    });
  }

  SearchService.getProductsByName(name, (error, products) => {
    if (error) {
      return res.status(500).json({
        success: false,
        error: error.message,
      });
    }

    return res.json({
      success: true,
      data: products,
    });
  });
};
