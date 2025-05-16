const ReceiptService = require("./receipts.service");

const ReceiptController = {
  create: (req, res) => {
    ReceiptService.create(req.body, (error, receipt) => {
      if (error) {
        return res
          .status(500)
          .json({ message: "Failed to create receipt", error });
      }
      res.status(201).json(receipt);
    });
  },

  read: (req, res) => {
    ReceiptService.read((error, receipts) => {
      if (error) {
        return res
          .status(500)
          .json({ message: "Failed to read receipts", error });
      }
      res.status(200).json({ success: true, data: receipts });
    });
  },

  readById: (req, res) => {
    const { id } = req.params;
    ReceiptService.readById(id, (error, receipts) => {
      if (error) {
        return res
          .status(500)
          .json({ message: "Failed to read receipt", error });
      }
      if (!receipts) {
        return res.status(404).json({ message: "Receipt not found" });
      }
      res.status(200).json({ success: true, data: receipts });
    });
  },

  update: (req, res) => {
    const { id } = req.params;
    ReceiptService.update(id, req.body, (error, receipts) => {
      if (error) {
        return res
          .status(500)
          .json({ message: "Failed to update receipt", error });
      }
      if (!receipts) {
        return res.status(404).json({ message: "Receipt not found" });
      }
      res.status(200).json({ success: true, data: receipts });
    });
  },

  delete: (req, res) => {
    const { id } = req.params;
    ReceiptService.delete(id, (error, success) => {
      if (error) {
        return res
          .status(500)
          .json({ message: "Failed to delete receipt", error });
      }
      if (!success) {
        return res.status(404).json({ message: "Receipt not found" });
      }
      res.status(204).send();
    });
  },
};

module.exports = ReceiptController;
