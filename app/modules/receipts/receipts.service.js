const TransactionModel = require("../transactions/transaction.model");
const ReceiptModel = require("./receipts.model");

const ReceiptService = {
  create: (data, callback) => {
    ReceiptModel.create(data, (error, result) => {
      if (error) return callback(error);

      // Đồng thời tạo bản ghi trong transactions
      const transactionData = {
        transaction_code: `TX-R-${data.receipt_code}`,
        transaction_type: "income",
        amount: data.amount,
        description: data.note || `Thu từ đơn hàng ${data.order_id}`,
        category: "order_receipt",
        payment_method: data.payment_method,
        source_type: "receipt",
        source_id: result.receipt_id,
      };

      TransactionModel.create(transactionData, (err) => {
        if (err)
          console.error("Lỗi khi tạo transaction từ receipt:", err.message);
      });

      callback(null, result);
    });
  },

  read: (callback) => {
    ReceiptModel.read(callback);
  },

  readById: (receipt_id, callback) => {
    ReceiptModel.readById(receipt_id, callback);
  },

  update: (receipt_id, data, callback) => {
    ReceiptModel.update(receipt_id, data, callback);
  },

  delete: (receipt_id, callback) => {
    ReceiptModel.delete(receipt_id, callback);
  },
};

module.exports = ReceiptService;
