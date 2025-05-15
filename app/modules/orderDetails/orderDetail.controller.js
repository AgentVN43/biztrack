const OrderDetailService = require('./orderDetail.service');

const OrderDetailController = {
    create: (req, res) => {
        OrderDetailService.create(req.body, (error, orderDetail) => {
            if (error) {
                return res.status(500).json({ message: 'Failed to create order detail', error });
            }
            res.status(201).json(orderDetail);
        });
    },

    read: (req, res) => {
        OrderDetailService.read((error, orderDetails) => {
            if (error) {
                return res.status(500).json({ message: 'Failed to read order details', error });
            }
            res.status(200).json(orderDetails);
        });
    },

    readById: (req, res) => {
        const { id } = req.params;
        OrderDetailService.readById(id, (error, orderDetail) => {
            if (error) {
                return res.status(500).json({ message: 'Failed to read order detail', error });
            }
            if (!orderDetail) {
                return res.status(404).json({ message: 'Order detail not found' });
            }
            res.status(200).json(orderDetail);
        });
    },

    update: (req, res) => {
        const { id } = req.params;
        OrderDetailService.update(id, req.body, (error, orderDetail) => {
            if (error) {
                return res.status(500).json({ message: 'Failed to update order detail', error });
            }
            if (!orderDetail) {
                return res.status(404).json({ message: 'Order detail not found' });
            }
            res.status(200).json(orderDetail);
        });
    },

    delete: (req, res) => {
        const { id } = req.params;
        OrderDetailService.delete(id, (error, success) => {
            if (error) {
                return res.status(500).json({ message: 'Failed to delete order detail', error });
            }
            if (!success) {
                return res.status(404).json({ message: 'Order detail not found' });
            }
            res.status(204).send();
        });
    }
};

module.exports = OrderDetailController;