const express = require("express");
const router = express.Router();

const AnalysisController = require("./analysis.controller");

router.get("/invoices", AnalysisController.getInvoicesWithFilters);

module.exports = router;
