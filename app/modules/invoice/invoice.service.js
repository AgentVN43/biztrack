// const InvoiceModel = require("./invoice.model");

// const getAll = () => {
//     return new Promise((resolve, reject) => {
//         InvoiceModel.getAll((err, results) => {
//             if (err) return reject(err);
//             resolve(results);
//         });
//     });
// };

// const getById = (id) => {
//     return new Promise((resolve, reject) => {
//         InvoiceModel.getById(id, (err, result) => {
//             if (err) return reject(err);
//             resolve(result);
//         });
//     });
// };

// const create = (data) => {
//     return new Promise((resolve, reject) => {
//         InvoiceModel.create(data, (err, result) => {
//             if (err) return reject(err);
//             resolve(result);
//         });
//     });
// };

// const update = (id, data) => {
//     return new Promise((resolve, reject) => {
//         InvoiceModel.update(id, data, (err, result) => {
//             if (err) return reject(err);
//             resolve(result);
//         });
//     });
// };

// const deleteInvoice = (id) => {
//     return new Promise((resolve, reject) => {
//         InvoiceModel.delete(id, (err, result) => {
//             if (err) return reject(err);
//             resolve(result);
//         });
//     });
// };

// module.exports = {
//     getAll,
//     getById,
//     create,
//     update,
//     delete: deleteInvoice
// };
// invoice.service.js
const InvoiceModel = require("./invoice.model"); // Đảm bảo đường dẫn đúng tới invoice.model

const InvoiceService = {
  // Đổi tên từ 'const create' sang 'const InvoiceService'
  /**
   * Tạo một hóa đơn mới.
   * @param {Object} data - Dữ liệu hóa đơn.
   * @returns {Promise<Object>} Promise giải quyết với đối tượng hóa đơn đã tạo.
   */
  create: async (data) => {
    // Hàm này giờ là async
    try {
      // Gọi InvoiceModel.create và await kết quả của Promise
      const invoice = await InvoiceModel.create(data);
      return invoice;
    } catch (error) {
      console.error(
        "🚀 ~ invoice.service.js: create - Error creating invoice:",
        error
      );
      throw error; // Ném lỗi để được bắt bởi tầng gọi (order.service.js)
    }
  },

  // Các hàm service khác của InvoiceService (ví dụ: read, update, delete)
  // Bạn cần thêm các hàm này vào đây và refactor chúng sang async/await nếu chúng gọi model.
};

module.exports = InvoiceService; // Đảm bảo bạn xuất InvoiceService
