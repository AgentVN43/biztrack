const db = require('../config/db.config');

exports.getAllCategories = (req, res, next) => {
  db.query('SELECT category_id, category_name FROM categories', (err, results) => {
    if (err) return next(err);
    res.json({ success: true, data: results });
  });
};

exports.getCategoryById = (req, res, next) => {
  const id = req.params.id;
  db.query('SELECT category_id, category_name FROM categories WHERE category_id = ?', [id], (err, results) => {
    if (err) return next(err);
    if (results.length === 0) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }
    res.json({ success: true, data: results[0] });
  });
};

exports.createCategory = (req, res, next) => {
  const { category_name } = req.body;
  db.query(
    'INSERT INTO categories (category_id, category_name) VALUES (UUID(), ?)',
    [category_name],
    (err, result) => {
      if (err) return next(err);
      res.status(201).json({ success: true, message: 'Category created', data: { category_name } });
    }
  );
};

exports.updateCategory = (req, res, next) => {
  const id = req.params.id;
  const { category_name } = req.body;
  db.query(
    'UPDATE categories SET category_name = ? WHERE category_id = ?',
    [category_name, id],
    (err) => {
      if (err) return next(err);
      res.json({ success: true, message: 'Category updated' });
    }
  );
};

exports.deleteCategory = (req, res, next) => {
  const id = req.params.id;
  db.query('DELETE FROM categories WHERE category_id = ?', [id], (err) => {
    if (err) return next(err);
    res.json({ success: true, message: 'Category deleted' });
  });
};
