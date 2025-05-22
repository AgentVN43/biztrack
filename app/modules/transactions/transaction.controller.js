// const {
//   createTransaction,
//   getAllTransactions,
//   getTransactionById,
//   updateTransactionById,
//   deleteTransactionById
// } = require('./transaction.service');

// // Tạo mới
// const create = (req, res) => {
//   const data = req.body;
//   createTransaction(data, (error, result) => {
//     if (error) {
//       return res.status(500).json({ success: false, error: error.message });
//     }
//     return res.status(201).json({ success: true, data: result });
//   });
// };

// // Lấy tất cả
// const getAll = (req, res) => {
//   getAllTransactions((error, results) => {
//     if (error) {
//       return res.status(500).json({ success: false, error: error.message });
//     }
//     return res.json({ success: true, data: results });
//   });
// };

// // Lấy theo ID
// const getById = (req, res) => {
//   const id = req.params.id;
//   getTransactionById(id, (error, result) => {
//     if (error) {
//       return res.status(404).json({ success: false, error: error.message });
//     }
//     return res.json({ success: true, data: result });
//   });
// };

// // Cập nhật theo ID
// const updateById = (req, res) => {
//   const id = req.params.id;
//   const data = req.body;
//   updateTransactionById(id, data, (error, result) => {
//     if (error) {
//       return res.status(500).json({ success: false, error: error.message });
//     }
//     return res.json({ success: true, data: result });
//   });
// };

// // Xóa theo ID
// const deleteById = (req, res) => {
//   const id = req.params.id;
//   deleteTransactionById(id, (error) => {
//     if (error) {
//       return res.status(500).json({ success: false, error: error.message });
//     }
//     return res.json({ success: true });
//   });
// };

// module.exports = {
//   create,
//   getAll,
//   getById,
//   updateById,
//   deleteById
// };

// transaction.controller.js
const TransactionService = require("./transaction.service");

const TransactionController = {
  createTransaction: (req, res) => {
    TransactionService.createTransaction(req.body, (err, transaction) => {
      if (err) {
        return res
          .status(500)
          .json({ message: "Failed to create transaction", error: err });
      }
      return res
        .status(201)
        .json({
          message: "Transaction created successfully",
          data: transaction,
        });
    });
  },

  // Các controller khác có thể được thêm vào (ví dụ: getTransactionById)
};

module.exports = TransactionController;
