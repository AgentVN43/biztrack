// modules/payments/services/payments.service.js
const PaymentModel = require('./payments.model');

exports.createPayment = async (data) => {
    return new Promise((resolve, reject) => {
        PaymentModel.create(data, (err, payment) => {
            if (err) {
                reject(err);
            } else {
                resolve(payment);
            }
        });
    });
};

exports.updatePayment = async (payment_id, data) => {
    return new Promise((resolve, reject) => {
        PaymentModel.update(payment_id, data, (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result);
            }
        });
    });
};

exports.getPaymentById = async (payment_id) => {
    return new Promise((resolve, reject) => {
        PaymentModel.getById(payment_id, (err, payment) => {
            if (err) {
                reject(err);
            } else {
                resolve(payment);
            }
        });
    });
};

exports.getAllPayments = async () => {
    return new Promise((resolve, reject) => {
        PaymentModel.getAll(err, results => {
            if (err) {
                reject(err);
            } else {
                resolve(results);
            }
        });
    });
};

exports.deletePayment = async (payment_id) => {
    return new Promise((resolve, reject) => {
        PaymentModel.delete(payment_id, (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result);
            }
        });
    });
};

exports.getPaymentsByPO = async (po_id) => {
    return new Promise((resolve, reject) => {
        PaymentModel.findByPurchaseOrderId(po_id, (err, results) => {
            if (err) {
                reject(err);
            } else {
                resolve(results);
            }
        });
    });
};

exports.updatePaymentStatusByPO = async (po_id, status) => {
    return new Promise((resolve, reject) => {
        PaymentModel.updateStatusByPO(po_id, status, (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result);
            }
        });
    });
};

// Các hàm service phục vụ logic nghiệp vụ tự động (đã triển khai ở phiên trước)
exports.createPaymentOnPOCreation = async (po_id, amount) => {
    const paymentData = {
        po_id,
        amount,
        payment_code: `PC-${Date.now()}`,
        status: 'Mới'
    };
    return this.createPayment(paymentData);
};

exports.updatePaymentStatusOnPOCompletion = async (po_id) => {
    return this.updatePaymentStatusByPO(po_id, 'Đã chi');
};