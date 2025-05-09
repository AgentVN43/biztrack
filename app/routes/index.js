const pingRoutes = require("./ping.routes");
const authRoutes = require("./auth.routes");
const userRoutes = require("./user.routes");
const warehouseRoutes = require('../modules/warehouse/warehouse.route');

module.exports = (app) => {
  // Register all routes
  app.use("/api/v1/ping", pingRoutes);
  app.use("/api/v1/auth", authRoutes);
  app.use("/api/v1/users", userRoutes);
  app.use("/api/v1/warehouses", warehouseRoutes);

  // Default route for non-existent endpoints
  app.use("*", (req, res) => {
    res.status(404).json({
      success: false,
      message: "Endpoint not found",
    });
  });
};
