const InvoiceModel = require("./invoice.model");

const getAll = () => {
    return new Promise((resolve, reject) => {
        InvoiceModel.getAll((err, results) => {
            if (err) return reject(err);
            resolve(results);
        });
    });
};

const getById = (id) => {
    return new Promise((resolve, reject) => {
        InvoiceModel.getById(id, (err, result) => {
            if (err) return reject(err);
            resolve(result);
        });
    });
};

const create = (data) => {
    return new Promise((resolve, reject) => {
        InvoiceModel.create(data, (err, result) => {
            if (err) return reject(err);
            resolve(result);
        });
    });
};

const update = (id, data) => {
    return new Promise((resolve, reject) => {
        InvoiceModel.update(id, data, (err, result) => {
            if (err) return reject(err);
            resolve(result);
        });
    });
};

const deleteInvoice = (id) => {
    return new Promise((resolve, reject) => {
        InvoiceModel.delete(id, (err, result) => {
            if (err) return reject(err);
            resolve(result);
        });
    });
};

module.exports = {
    getAll,
    getById,
    create,
    update,
    delete: deleteInvoice
};