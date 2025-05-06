const express = require('express');
const app = express();
const port = process.env.PORT || 3008;
require('dotenv').config({ path: '.env.local' });

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
require('./app/routes')(app);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

// Start server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

module.exports = app; // For testing purposes