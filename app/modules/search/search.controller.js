const SearchService = require("./search.service");

exports.searchCustomerByPhone = async (req, res) => {
  const { phone } = req.query;

  if (!phone) {
    return res.status(400).json({
      success: false,
      error: "Số điện thoại là bắt buộc",
    });
  }

  try {
    const customer = await SearchService.getCustomerByPhone(phone);
    return res.json({
      success: true,
      data: customer,
    });
  } catch (error) {
    return res.status(404).json({
      success: false,
      error: error.message,
    });
  }
};

exports.searchOrdersByPhone = async (req, res) => {
  const { phone } = req.query;

  if (!phone) {
    return res
      .status(400)
      .json({ success: false, error: "Số điện thoại là bắt buộc" });
  }

  try {
    const orders = await SearchService.getOrdersByCustomerPhone(phone);
    return res.json({ success: true, data: orders });
  } catch (error) {
    return res.status(404).json({ success: false, error: error.message });
  }
};

exports.searchProductsByName = async (req, res) => {
  const { name } = req.query;

  if (!name) {
    return res.status(400).json({
      success: false,
      error: "Tên sản phẩm là bắt buộc",
    });
  }

  try {
    const products = await SearchService.getProductsByName(name);
    return res.json({
      success: true,
      data: products,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};
