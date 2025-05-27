const createResponse = require("../../utils/response");
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

  async getRevenueByTimePeriod(req, res) {
    try {
      const { period, startDate, endDate } = req.query;
      const revenueData = await AnalysisService.getRevenueByTimePeriod(
        period,
        startDate,
        endDate
      );
      res.json(revenueData);
    } catch (error) {
      console.error("Lỗi khi lấy thống kê doanh thu:", error);
      res.status(500).json({ message: "Lỗi khi lấy thống kê doanh thu" });
    }
  },

  async getOutstandingDebt(req, res) {
    try {
      const outstandingAmount = await AnalysisService.getOutstandingDebt();
      res.json({ total_money: outstandingAmount });
    } catch (error) {
      console.error("Lỗi khi lấy thống kê công nợ:", error);
      res.status(500).json({ message: "Lỗi khi lấy thống kê công nợ" });
    }
  },

  // async getReceivableOrders(req, res) {
  //   try {
  //     const receivableOrders = await AnalysisService.getReceivableOrders();
  //     res.status(200).json({ success: true, data: receivableOrders || [] });
  //   } catch (error) {
  //     console.error("Lỗi khi lấy danh sách order phải thu:", error);
  //     res.status(500).json({ success: false, error: error.message });
  //   }
  // },

  async getReceivableOrders(req, res, next) {
    try {
      const orders = await AnalysisService.getReceivableOrders();
      return createResponse(res, 200, true, orders);
    } catch (error) {
      console.error("Lỗi ở Controller...", error);
      return createResponse(res, 500, false, null, error.message);
    }
  },

  async getPayablePurchaseOrders(req, res) {
    try {
      const payablePOs = await AnalysisService.getPayablePurchaseOrders();
      res.json(payablePOs);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách purchase order phải trả:", error);
      res
        .status(500)
        .json({ message: "Lỗi khi lấy danh sách purchase order phải trả" });
    }
  },
};

module.exports = AnalysisController;
