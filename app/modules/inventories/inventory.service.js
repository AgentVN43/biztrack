const { v4: uuidv4 } = require('uuid');
const Inventory = require('./inventory.model');

exports.createInventory = (data, callback) => {
  const inventory = {
    inventory_id: uuidv4(),
    ...data
  };
  Inventory.create(inventory, callback);
};

exports.getAllInventories = Inventory.findAll;

exports.getInventoryById = Inventory.findById;

exports.updateInventory = (id, data, callback) => {
  const inventory = { inventory_id: id, ...data };
  Inventory.update(inventory, callback);
};

exports.deleteInventory = Inventory.remove;

exports.getInventoriesByWarehouse = (warehouseId, callback) => {
  const query = `
    SELECT i.*, w.warehouse_name 
    FROM inventories i
    JOIN warehouses w ON i.warehouse_id = w.warehouse_id
    WHERE i.warehouse_id = ?
  `;
  db.query(query, [warehouseId], callback);
};

exports.getInventorySummary = (callback) => {
  const query = `
    SELECT product_id, SUM(quantity) AS total_quantity
    FROM inventories
    GROUP BY product_id
  `;
  db.query(query, callback);
};
