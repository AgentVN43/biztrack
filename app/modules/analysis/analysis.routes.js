const express = require("express");
const router = express.Router();

const AnalysisController = require("./analysis.controller");

router.get("/invoices", AnalysisController.getInvoicesWithFilters);
router.get('/finance/revenue', AnalysisController.getRevenueByTimePeriod);
router.get('/finance/debt', AnalysisController.getOutstandingDebt);
router.get('/finance/receivable_orders', AnalysisController.getReceivableOrders); 
router.get('/finance/payable_purchase_orders', AnalysisController.getPayablePurchaseOrders);



module.exports = router;
