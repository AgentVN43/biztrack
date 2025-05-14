const pingRoutes = require("./ping.routes");
const authRoutes = require("./auth.routes");
const userRoutes = require("./user.routes");
const categoryRoutes = require("./category.routes")
const productRoutes = require("./product.routes")
const warehouseRoutes = require('../modules/warehouse/warehouse.route');
const purchaseOrderRoutes = require('../modules/purchaseOrder/purchaseOrder.routes')
const inventoriesRoutes = require('../modules/inventories/inventory.routes')
const paymentRoutes = require('../modules/payments/payments.routes')

module.exports = (app) => {
  // Register all routes
  app.use("/api/v1/ping", pingRoutes);
  app.use("/api/v1/auth", authRoutes);
  app.use("/api/v1/users", userRoutes);
  app.use("/api/v1/categories", categoryRoutes);
  app.use("/api/v1/products", productRoutes);
  app.use("/api/v1/warehouses", warehouseRoutes);
  app.use("/api/v1/purchase-orders", purchaseOrderRoutes);
  app.use("/api/v1/inventories", inventoriesRoutes);
  app.use("/api/v1/payments", paymentRoutes);

  // Default route for non-existent endpoints
  app.use("*", (req, res) => {
    res.status(404).json({
      success: false,
      message: "Endpoint not found",
    });
  });
};
