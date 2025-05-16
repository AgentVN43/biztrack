const TransactionModel = require("../transactions/transaction.model");
const Payment = require("./payments.model");

exports.createPayment = (data, callback) => {
  Payment.create(data, (err, payment) => {
    if (err) return callback(err);
    // Có thể cũng cần tạo transaction ở đây nếu createPayment được dùng độc lập
    const transactionData = {
      transaction_code: `TX-P-${data.payment_code || Date.now()}`,
      transaction_type: "expense",
      amount: data.amount,
      description:
        data.description ||
        `Chi cho đơn mua hàng ${data.po_id || "không xác định"}`,
      category: "purchase_payment",
      payment_method: data.payment_method || "unknown",
      source_type: "payment",
      source_id: payment.payment_id,
    };

    TransactionModel.create(transactionData, (err) => {
      if (err)
        console.error("Lỗi khi tạo transaction từ createPayment:", err.message);
    });

    callback(null, payment);
  });
};

exports.updatePayment = (payment_id, data, callback) => {
  Payment.update(payment_id, data, (err, result) => {
    if (err) {
      callback(err);
    } else {
      callback(null, result);
    }
  });
};

exports.getPaymentById = (payment_id, callback) => {
  Payment.getById(payment_id, (err, payment) => {
    if (err) {
      callback(err);
    } else {
      callback(null, payment);
    }
  });
};

exports.getAllPayments = (callback) => {
  console.log("Service: Calling Payment.getAll...");
  Payment.getAll((err, results) => {
    console.log("Service: Payment.getAll callback called."); // Để debug
    if (err) {
      callback(err);
    } else {
      callback(null, results);
    }
  });
};

exports.deletePayment = (payment_id, callback) => {
  Payment.delete(payment_id, (err, result) => {
    if (err) {
      callback(err);
    } else {
      callback(null, result);
    }
  });
};

exports.getPaymentsByPO = (po_id, callback) => {
  Payment.findByPurchaseOrderId(po_id, (err, results) => {
    if (err) {
      callback(err);
    } else {
      callback(null, results);
    }
  });
};

exports.updatePaymentStatusByPO = (po_id, status, callback) => {
  Payment.updateStatusByPO(po_id, status, (err, result) => {
    if (err) {
      callback(err);
    } else {
      callback(null, result);
    }
  });
};

// Các hàm service phục vụ logic nghiệp vụ tự động (đã triển khai ở phiên trước)
exports.createPaymentOnPOCreation = (po_id, amount, callback) => {
  // Thêm callback
  const paymentData = {
    po_id,
    amount,
    payment_code: `PC-${Date.now()}`,
    status: "Mới",
  };
  this.createPayment(paymentData, (error, payment) => {
    if (error) return callback(error);

    // Đồng thời tạo bản ghi trong transactions
    const transactionData = {
      transaction_code: `TX-P-${paymentData.payment_code}`,
      transaction_type: "expense",
      amount: paymentData.amount,
      description: `Chi cho đơn mua hàng ${po_id}`,
      category: "purchase_payment",
      payment_method: paymentData.payment_method,
      source_type: "payment",
      source_id: payment.payment_id,
    };

    TransactionModel.create(transactionData, (err) => {
      if (err)
        console.error("Lỗi khi tạo transaction từ payment:", err.message);
    });

    callback(null, payment);
  });
};

exports.updatePaymentStatusOnPOCompletion = (po_id, callback) => {
  // Thêm callback
  this.updatePaymentStatusByPO(po_id, "Đã chi", callback); // Sử dụng callback
};
