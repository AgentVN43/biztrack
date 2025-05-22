// invoice.model.js
const db = require("../../config/db.config");
const { v4: uuidv4 } = require("uuid");

const Invoice = {
  create: async (data) => {
    const invoice_id = uuidv4();
    const {
      invoice_code,
      invoice_type,
      order_id,
      customer_id,
      supplier_id,
      total_amount,
      tax_amount,
      discount_amount,
      final_amount,
      issued_date,
      due_date,
      status,
      note,
    } = data;

    const query = `
            INSERT INTO invoices (
                invoice_id, invoice_code, invoice_type, order_id,
                customer_id, supplier_id, total_amount, tax_amount,
                discount_amount, final_amount, issued_date, due_date,
                status, note
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

    const values = [
      invoice_id,
      invoice_code,
      invoice_type,
      order_id,
      customer_id,
      supplier_id,
      total_amount,
      tax_amount,
      discount_amount,
      final_amount,
      issued_date,
      due_date,
      status,
      note,
    ];

    try {
      console.log("🚀 ~ invoice.model.js: create - SQL Query:", query);
      console.log("🚀 ~ invoice.model.js: create - SQL Values:", values);
      const [results] = await db.promise().query(query, values);
      const invoiceResult = { invoice_id, ...data };
      console.log(
        "🚀 ~ invoice.model.js: create - Invoice created successfully:",
        invoiceResult
      );
      return invoiceResult;
    } catch (error) {
      console.error(
        "🚀 ~ invoice.model.js: create - Error creating invoice:",
        error
      );
      throw error;
    }
  },

  // Các hàm model khác (nếu có) cũng có thể được chuyển đổi sang async/await
};

module.exports = Invoice;
