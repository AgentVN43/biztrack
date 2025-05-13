// modules/payments/controllers/payments.controller.js
const paymentService = require('./payments.service');

exports.createPayment = async (req, res) => {
    try {
        const payment = await paymentService.createPayment(req.body);
        res.status(201).json({ success: true, data: payment });
    } catch (error) {
        console.error('Error creating payment:', error);
        res.status(500).json({ success: false, message: 'Failed to create payment.' });
    }
};

exports.updatePayment = async (req, res) => {
    const { id } = req.params;
    try {
        const updatedPayment = await paymentService.updatePayment(id, req.body);
        if (!updatedPayment) {
            return res.status(404).json({ success: false, message: 'Payment not found.' });
        }
        res.json({ success: true, data: updatedPayment });
    } catch (error) {
        console.error('Error updating payment:', error);
        res.status(500).json({ success: false, message: 'Failed to update payment.' });
    }
};

exports.getPaymentById = async (req, res) => {
    const { id } = req.params;
    try {
        const payment = await paymentService.getPaymentById(id);
        if (!payment) {
            return res.status(404).json({ success: false, message: 'Payment not found.' });
        }
        res.json({ success: true, data: payment });
    } catch (error) {
        console.error('Error fetching payment:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch payment.' });
    }
};

exports.getAllPayments = async (req, res) => {
    try {
        const payments = await paymentService.getAllPayments();
        res.json({ success: true, data: payments });
    } catch (error) {
        console.error('Error fetching all payments:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch payments.' });
    }
};

exports.deletePayment = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await paymentService.deletePayment(id);
        if (!result) {
            return res.status(404).json({ success: false, message: 'Payment not found.' });
        }
        res.json({ success: true, message: 'Payment deleted successfully.' });
    } catch (error) {
        console.error('Error deleting payment:', error);
        res.status(500).json({ success: false, message: 'Failed to delete payment.' });
    }
};

exports.getPaymentsByPO = async (req, res) => {
    const { purchase_order_id } = req.params;
    try {
        const payments = await paymentService.getPaymentsByPO(purchase_order_id);
        res.json({ success: true, data: payments });
    } catch (error) {
        console.error('Error fetching payments by PO:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch payments by PO.' });
    }
};

// Các hàm controller để trigger logic tự động (nếu cần endpoint riêng)
// Nhưng thường logic tự động sẽ được gọi từ module Purchase Orders