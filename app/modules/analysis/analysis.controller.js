const AnalysisService = require("./analysis.service");

const AnalysisController = {
  async getInvoicesWithFilters(req, res) {
    try {
      const { fields, filter, sort, page, limit } = req.query;
      const result = await AnalysisService.getInvoicesWithFilters(
        fields,
        filter,
        sort,
        page,
        limit
      );
      res.json(result);
    } catch (error) {
      console.error("Lỗi khi lấy hóa đơn với bộ lọc (Analysis):", error);
      res.status(500).json({ message: "Lỗi khi lấy hóa đơn (Analysis)" });
    }
  },

  // Các hàm phân tích khác sẽ được thêm vào đây
};

module.exports = AnalysisController;
