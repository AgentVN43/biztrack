const TransactionModel = require("./transaction.model");

const createTransaction = (data, callback) => {
  TransactionModel.create(data, (error, result) => {
    if (error) return callback(error);
    return callback(null, result);
  });
};

const getAllTransactions = (callback) => {
  TransactionModel.findAll((error, results) => {
    if (error) return callback(error);
    return callback(null, results);
  });
};

const getTransactionById = (id, callback) => {
  TransactionModel.findById(id, (error, result) => {
    if (error) return callback(error);
    if (!result)
      return callback(new Error(`Không tìm thấy giao dịch ID=${id}`));
    return callback(null, result);
  });
};

const updateTransactionById = (id, data, callback) => {
  TransactionModel.updateById(id, data, (error, result) => {
    if (error) return callback(error);
    return callback(null, result);
  });
};

const deleteTransactionById = (id, callback) => {
  TransactionModel.deleteById(id, (error) => {
    if (error) return callback(error);
    return callback(null, { success: true });
  });
};

module.exports = {
  createTransaction,
  getAllTransactions,
  getTransactionById,
  updateTransactionById,
  deleteTransactionById,
};
