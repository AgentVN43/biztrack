const db = require("../../config/db.config");

exports.create = (
  { po_id, supplier_name, warehouse_id, note, status, total_amount },
  callback
) => {
  const sql =
    "INSERT INTO purchase_orders (po_id, supplier_name, warehouse_id, note, status, total_amount) VALUES (?, ?, ?, ?, ?, ?)";
  db.query(
    sql,
    [po_id, supplier_name, warehouse_id, note, status, total_amount],
    callback
  );
};

exports.update = (po_id, data, callback) => {
  const fields = [];
  const values = [];

  if (data.supplier_name !== undefined) {
    fields.push("supplier_name = ?");
    values.push(data.supplier_name);
  }
  if (data.warehouse_id !== undefined) {
    fields.push("warehouse_id = ?");
    values.push(data.warehouse_id);
  }
  if (data.note !== undefined) {
    fields.push("note = ?");
    values.push(data.note);
  }
  if (data.status !== undefined) {
    fields.push("status = ?");
    values.push(data.status);
  }
  // Thêm điều kiện để cập nhật total_amount
  if (data.total_amount !== undefined) {
    fields.push("total_amount = ?");
    values.push(data.total_amount);
  }

  if (fields.length === 0) {
    return callback(new Error("No valid fields to update."));
  }

  values.push(po_id);
  const sql = `UPDATE purchase_orders SET ${fields.join(", ")} WHERE po_id = ?`;

  db.query(sql, values, (err, result) => {
    if (err) return callback(err);
    if (result.affectedRows === 0) return callback(null, null);
    callback(null, { po_id, ...data });
  });
};

exports.findById = (po_id, callback) => {
  console.log("PO models:", po_id);
  const sql = "SELECT * FROM purchase_orders WHERE po_id = ?";
  db.query(sql, [po_id], (err, order) => {
    callback(err, order ? order[0] : null);
    console.log("FidById:", order);
  });
};

exports.findAll = (callback) => {
  db.query("SELECT * FROM purchase_orders ORDER BY created_at DESC", callback);
};

exports.updateStatus = (po_id, status, posted_at, callback) => {
  const sql =
    "UPDATE purchase_orders SET status = ?, posted_at = ? WHERE po_id = ?";
  db.query(sql, [status, posted_at, po_id], callback);
};

exports.remove = (po_id, callback) => {
  const sql = "DELETE FROM purchase_orders WHERE po_id = ?";
  db.query(sql, [po_id], callback);
};

exports.findWithDetailsById = (po_id, callback) => {
  const sql = `
    SELECT 
    po.po_id, po.supplier_name, po.warehouse_id, po.note, po.status,
    pod.po_detail_id, pod.product_id, pod.quantity, pod.price,
    p.product_name AS product_name, p.sku
    FROM purchase_orders po
    JOIN purchase_order_details pod ON po.po_id = pod.po_id
    JOIN products p ON pod.product_id = p.product_id
    WHERE po.po_id = ?;
  `;
  db.query(sql, [po_id], callback);
};
