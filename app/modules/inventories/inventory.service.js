const { v4: uuidv4 } = require('uuid');
const Inventory = require('./inventory.model');

exports.createInventory = (data, callback) => {
  const inventory = {
    inventory_id: uuidv4(),
    ...data
  };

  Inventory.findByProductAndWarehouse(data.product_id, data.warehouse_id, (err, existing) => {
    if (err) return callback(err);
    if (existing) return callback(new Error('Inventory already exists for this product in the warehouse'));

    Inventory.create(inventory, callback);
  });
};

exports.increaseQuantity = (product_id, warehouse_id, quantity, callback) => {
  Inventory.updateQuantity(product_id, warehouse_id, quantity, callback);
};

exports.getAllInventories = (callback) => {
  Inventory.findAll(callback);
};

exports.getInventoryById = (id, callback) => {
  Inventory.findById(id, callback);
};

exports.deleteInventory = (id, callback) => {
  Inventory.deleteById(id, callback);
};

exports.updateInventory = (inventory_id, data, callback) => {
  Inventory.update(inventory_id, data, callback);
};

exports.getByWareHouseId = (id, callback) => {
  Inventory.findByWareHouseId(id, callback);
};
