const db = require("../../config/db.config");
const { v4: uuidv4 } = require("uuid");

exports.order = (callback) => {
  db.query("SELECT * FROM orders", (err, results) => {
    if (err) {
      return callback(err, null);
    }
    callback(null, {
      success: true,
      data: results,
    });
  });
};