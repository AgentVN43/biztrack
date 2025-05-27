const express = require("express");
const router = express.Router();

const AnalysisController = require("./analysis.controller");

router.get("/invoices", AnalysisController.getInvoicesWithFilters);
router.get("/dashboard/money", AnalysisController.getOutstandingDebt);
// router.get("/finance/receivable_orders",  AnalysisController.getReceivableOrders);
// router.get("/finance/payable_purchase_orders",  AnalysisController.getPayablePurchaseOrders);

// Thống kê Doanh thu & Lợi nhuận
router.get("/finance/revenue" /* controller function */); // Tổng doanh thu (có thể theo thời gian)
// app.get('/api/v1/analysis/finance/revenue/details', /* controller function */); // Báo cáo doanh thu chi tiết
// app.get('/api/v1/analysis/finance/profit/by-product', /* controller function */); // Báo cáo lợi nhuận theo sản phẩm

// Thống kê Mua hàng & Chi phí
router.get("/purchase/summary" /* controller function */); // Thống kê mua hàng
// app.get('/api/v1/analysis/purchase/details', /* controller function */); // Báo cáo mua hàng chi tiết
// app.get('/api/v1/analysis/expenses/by-type', /* controller function */); // Báo cáo chi phí theo loại

// Báo cáo Tồn kho
router.get("/inventory/current" /* controller function */); // Báo cáo tồn kho hiện tại
// app.get('/api/v1/analysis/inventory/history', /* controller function */); // Báo cáo lịch sử nhập/xuất kho
// app.get('/api/v1/analysis/inventory/thresholds', /* controller function */); // Thống kê tồn kho tối thiểu/tối đa
// app.get('/api/v1/analysis/inventory/slow-moving', /* controller function */); // Báo cáo hàng tồn kho chậm luân chuyển

// Báo cáo Công nợ
router.get("/receivables", AnalysisController.getReceivableOrders); // Báo cáo công nợ phải thu
router.get("/payables/purchase", AnalysisController.getPayablePurchaseOrders); // Báo cáo công nợ phải trả (mua hàng)
// app.get('/api/v1/analysis/receivables/overdue', /* controller function */); // Báo cáo công nợ phải thu quá hạn
// app.get('/api/v1/analysis/payables/overdue', /* controller function */); // Báo cáo công nợ phải trả quá hạn

// Báo cáo Khách hàng & Nhà cung cấp
// app.get('/api/v1/analysis/customers', /* controller function */); // Báo cáo khách hàng
// app.get('/api/v1/analysis/suppliers', /* controller function */); // Báo cáo nhà cung cấp

module.exports = router;
