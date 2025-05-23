const AnalysisModel = require("./analysis.model");

const AnalysisService = {
  async getInvoicesWithFilters(fields, filter, sort, page, limit) {
    try {
      const invoices = await AnalysisModel.findInvoicesWithFilters(
        fields,
        filter,
        sort,
        page,
        limit
      );
      const total = await AnalysisModel.countInvoicesWithFilters(filter);
      return {
        data: invoices,
        total: total,
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 10,
      };
    } catch (error) {
      console.error(
        "Lỗi ở Service khi lấy hóa đơn với bộ lọc (Analysis):",
        error
      );
      throw error;
    }
  },

  // Các hàm phân tích khác sẽ được thêm vào đây
};

module.exports = AnalysisService;
