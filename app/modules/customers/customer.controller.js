const CustomerService = require("./customer.service");

exports.create = (req, res) => {
  const customerData = req.body;
  CustomerService.createCustomer(customerData, (err, result) => {
    if (err) {
      return res.status(500).json({ error: err });
    }
    res
      .status(201)
      .json({ message: "Customer created successfully", data: result });
  });
};

exports.get = (req, res) => {
  CustomerService.getAllCustomers((err, result) => {
    if (err) {
      console.error("Lỗi khi lấy danh sách khách hàng:", err.message);
      return res.status(500).json({
        success: false,
        error: "Lỗi server",
        data: [],
      });
    }

    return res.status(200).json({ success: true, data: result }); // ✅ Gửi mảng ra trực tiếp
  });
};


exports.getById = (req, res) => {
  const id = req.params.id;
  CustomerService.getCustomerById(id, (err, result) => {
    if (err) {
      return res.status(500).json({ error: err });
    }
    if (!result) {
      return res.status(404).json({ message: "Customer not found" });
    }
    res.status(200).json({
      success: true,
      data: result, // Trả về kết quả customer
    });
  });
};

exports.update = (req, res) => {
  const id = req.params.id;
  const customerData = req.body;
  CustomerService.updateCustomer(id, customerData, (err, result) => {
    if (err) {
      return res.status(500).json({ error: err });
    }
    res.status(200).json({ message: "Customer updated successfully" });
  });
};

exports.updateStatus = (req, res) => {
  const id = req.params.id;
  CustomerService.updateOrdersAndStatus(id, (err, result) => {
    if (err) {
      return res.status(500).json({ error: err });
    }
    res
      .status(200)
      .json({ message: "Customer updated successfully", data: result });
  });
};

exports.delete = (req, res) => {
  const id = req.params.id;
  CustomerService.deleteCustomer(id, (err, result) => {
    if (err) {
      return res.status(500).json({ error: err });
    }
    res.status(200).json({ message: "Customer deleted successfully" });
  });
};
