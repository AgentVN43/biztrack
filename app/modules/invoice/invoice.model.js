const db = require("../../config/db.config"); // Kết nối database của bạn

const getAll = (callback) => {
    const query = "SELECT * FROM invoices";
    db.query(query, (error, results) => {
        if (error) return callback(error);
        callback(null, results);
    });
};

const getById = (id, callback) => {
    const query = "SELECT * FROM invoices WHERE invoice_id = ?";
    db.query(query, [id], (error, results) => {
        if (error) return callback(error);
        callback(null, results[0]);
    });
};

const create = (data, callback) => {
    const {
        invoice_code,
        invoice_type,
        order_id,
        customer_id,
        supplier_id,
        total_amount,
        tax_amount = 0.00,
        discount_amount = 0.00,
        final_amount,
        issued_date,
        due_date,
        status = "pending",
        note
    } = data;

    const invoice_id = require("uuid").v4();

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
        note
    ];

    db.query(query, values, (error, results) => {
        if (error) return callback(error);
        callback(null, {
            invoice_id,
            ...data
        });
    });
};

const update = (id, data, callback) => {
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
        note
    } = data;

    const query = `
        UPDATE invoices SET
            invoice_code = ?,
            invoice_type = ?,
            order_id = ?,
            customer_id = ?,
            supplier_id = ?,
            total_amount = ?,
            tax_amount = ?,
            discount_amount = ?,
            final_amount = ?,
            issued_date = ?,
            due_date = ?,
            status = ?,
            note = ?
        WHERE invoice_id = ?
    `;

    const values = [
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
        id
    ];

    db.query(query, values, (error, results) => {
        if (error) return callback(error);
        callback(null, results.affectedRows > 0);
    });
};

const deleteInvoice = (id, callback) => {
    const query = "DELETE FROM invoices WHERE invoice_id = ?";
    db.query(query, [id], (error, results) => {
        if (error) return callback(error);
        callback(null, results.affectedRows > 0);
    });
};

module.exports = {
    getAll,
    getById,
    create,
    update,
    delete: deleteInvoice
};