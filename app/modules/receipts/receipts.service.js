const ReceiptModel = require('./receipts.model');

const ReceiptService = {
    create: (data, callback) => {
        ReceiptModel.create(data, callback);
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
    }
};

module.exports = ReceiptService;