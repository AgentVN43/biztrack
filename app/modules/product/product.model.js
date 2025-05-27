const db = require("../../config/db.config");
const { v4: uuidv4 } = require("uuid");

const ProductModel = {
  /**
   * Lấy tất cả sản phẩm.
   * @returns {Promise<Array<Object>>} Promise giải quyết với danh sách sản phẩm.
   */

   getAllProducts: () => {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT 
          p.product_id, p.product_name, p.product_desc, p.product_image, 
          p.product_retail_price, p.product_note, p.product_barcode, 
          p.sku, p.is_active, p.category_id, c.category_name
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.category_id
      `;
      db.query(sql, (err, results) => {
        if (err) {
          console.error("🚀 ~ product.model.js: getAllProducts - Error:", err);
          return reject(err);
        }
        resolve(results);
      });
    });
  },

  /**
   * Lấy sản phẩm theo ID.
   * @param {string} id - ID sản phẩm.
   * @returns {Promise<Object|null>} Promise giải quyết với đối tượng sản phẩm hoặc null nếu không tìm thấy.
   */
  getProductById: (id) => {
    return new Promise((resolve, reject) => {
      const sql = "SELECT * FROM products WHERE product_id = ?";
      db.query(sql, [id], (err, results) => {
        if (err) {
          console.error("🚀 ~ product.model.js: getProductById - Error:", err);
          return reject(err);
        }
        resolve(results.length ? results[0] : null);
      });
    });
  },

  /**
   * Tạo sản phẩm mới.
   * @param {Object} productData - Dữ liệu sản phẩm.
   * @returns {Promise<Object>} Promise giải quyết với kết quả tạo sản phẩm (bao gồm product_id).
   */
  createProduct: (productData) => {
    return new Promise(async (resolve, reject) => {
      const {
        product_name,
        product_desc,
        product_image,
        product_retail_price,
        product_note,
        product_barcode,
        sku,
        is_active,
        category_id,
      } = productData;

      try {
        // Kiểm tra category_id có tồn tại không
        const [categoryResults] = await db
          .promise()
          .query("SELECT category_id FROM categories WHERE category_id = ?", [
            category_id,
          ]);
        if (categoryResults.length === 0) {
          return reject(
            new Error("Invalid category_id: Category does not exist")
          );
        }

        const product_id = uuidv4(); // Tạo UUID cho product_id

        const sql = `
          INSERT INTO products (
            product_id, product_name, product_desc, product_image,
            product_retail_price, product_note, product_barcode,
            sku, is_active, category_id
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const values = [
          product_id,
          product_name,
          product_desc,
          product_image,
          product_retail_price,
          product_note,
          product_barcode,
          sku,
          is_active,
          category_id,
        ];

        const [results] = await db.promise().query(sql, values);
        resolve({ product_id, affectedRows: results.affectedRows });
      } catch (err) {
        console.error("🚀 ~ product.model.js: createProduct - Error:", err);
        reject(err);
      }
    });
  },

  /**
   * Cập nhật sản phẩm.
   * @param {string} id - ID sản phẩm.
   * @param {Object} productData - Dữ liệu cập nhật sản phẩm.
   * @returns {Promise<Object>} Promise giải quyết với kết quả cập nhật.
   */
  updateProduct: (id, productData) => {
    return new Promise(async (resolve, reject) => {
      const {
        product_name,
        product_desc,
        product_image,
        product_retail_price,
        product_note,
        product_barcode,
        sku,
        is_active,
        category_id,
      } = productData;

      try {
        // Kiểm tra category_id có tồn tại không
        const [categoryResults] = await db
          .promise()
          .query("SELECT category_id FROM categories WHERE category_id = ?", [
            category_id,
          ]);
        if (categoryResults.length === 0) {
          return reject(
            new Error("Invalid category_id: Category does not exist")
          );
        }

        const sql = `
          UPDATE products SET 
            product_name = ?, product_desc = ?, product_image = ?,
            product_retail_price = ?, product_note = ?, product_barcode = ?,
            sku = ?, is_active = ?, category_id = ?
          WHERE product_id = ?
        `;
        const values = [
          product_name,
          product_desc,
          product_image,
          product_retail_price,
          product_note,
          product_barcode,
          sku,
          is_active,
          category_id,
          id,
        ];

        const [results] = await db.promise().query(sql, values);
        resolve(results);
      } catch (err) {
        console.error("🚀 ~ product.model.js: updateProduct - Error:", err);
        reject(err);
      }
    });
  },

  /**
   * Xóa sản phẩm.
   * @param {string} id - ID sản phẩm.
   * @returns {Promise<Object>} Promise giải quyết với kết quả xóa.
   */
  deleteProduct: (id) => {
    return new Promise((resolve, reject) => {
      const sql = "DELETE FROM products WHERE product_id = ?";
      db.query(sql, [id], (err, results) => {
        if (err) {
          console.error("🚀 ~ product.model.js: deleteProduct - Error:", err);
          return reject(err);
        }
        resolve(results);
      });
    });
  },

  /**
   * Cập nhật các trường tồn kho của sản phẩm.
   * @param {string} product_id - ID sản phẩm.
   * @param {number} stockChange - Thay đổi tổng số lượng tồn kho.
   * @param {number} reservedChange - Thay đổi tồn kho đặt trước.
   * @param {number} availableChange - Thay đổi tồn kho khả dụng.
   * @returns {Promise<Object>} Promise giải quyết với kết quả cập nhật.
   */
  updateStockFields: (
    product_id,
    stockChange,
    reservedChange,
    availableChange
  ) => {
    return new Promise((resolve, reject) => {
      const sql = `
        UPDATE products
        SET 
          stock = stock + ?,
          reserved_stock = reserved_stock + ?,
          available_stock = available_stock + ?
        WHERE product_id = ?
      `;
      db.query(
        sql,
        [stockChange, reservedChange, availableChange, product_id],
        (err, result) => {
          if (err) {
            console.error(
              "🚀 ~ product.model.js: updateStockFields - Error:",
              err
            );
            return reject(err);
          }
          resolve(result);
        }
      );
    });
  },
};

module.exports = ProductModel;
