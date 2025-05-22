const InvoiceService = require("./invoice.service");

const getAllInvoices = async (req, res) => {
  try {
    const invoices = await InvoiceService.getAll();
    return res.status(200).json(invoices);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const getInvoiceById = async (req, res) => {
  const { id } = req.params;

  try {
    const invoice = await InvoiceService.getById(id);
    if (!invoice)
      return res.status(404).json({ message: "Không tìm thấy hóa đơn" });

    return res.status(200).json(invoice);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const createInvoice = async (req, res) => {
  const data = req.body;

  try {
    const newInvoice = await InvoiceService.create(data);
    return res.status(201).json(newInvoice);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const updateInvoice = async (req, res) => {
  const { id } = req.params;
  const data = req.body;

  try {
    const updated = await InvoiceService.update(id, data);
    if (!updated)
      return res.status(404).json({ message: "Không tìm thấy hóa đơn" });

    return res.status(200).json(updated);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const deleteInvoice = async (req, res) => {
  const { id } = req.params;

  try {
    const deleted = await InvoiceService.delete(id);
    if (!deleted)
      return res.status(404).json({ message: "Không tìm thấy hóa đơn" });

    return res.status(200).json({ message: "Xóa hóa đơn thành công" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAllInvoices,
  getInvoiceById,
  createInvoice,
  updateInvoice,
  deleteInvoice,
};
