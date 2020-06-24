const express = require('express');
// importação dos middlewares
const authMiddleware = require('../middlewares/auth');

const router = express.Router();

// usando o middleware
router.use(authMiddleware);

router.get('/', (req, res) => {
  res.send({ ok: true, userId: req.userId });
});

module.exports = app => app.use('/projects', router);