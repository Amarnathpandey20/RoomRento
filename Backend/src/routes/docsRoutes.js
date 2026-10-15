const express = require('express');
const router = express.Router();
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('../utils/swagger');

// Serve interactive Swagger UI
router.use('/', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Serve raw JSON spec
router.get('/json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

module.exports = router;
