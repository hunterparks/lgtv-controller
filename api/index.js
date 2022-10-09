const express = require('express');

const tv = require('./tv');

const router = express.Router();

router.get('/', (_req, res) => {
  res.json({
    message: 'API - 👋🌎',
  });
});

router.use('/tv', tv);

module.exports = router;
