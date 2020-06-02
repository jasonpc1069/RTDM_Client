const express = require('express');
const router = express.Router();
const { ensureAuthenticated, forwardAuthenticated } = require('../config/auth');

// Welcome Page
router.get('/', forwardAuthenticated, (req, res) => res.render('login.html'));

// Dashboard
router.get('/main', ensureAuthenticated, (req, res) =>
  res.render('main.html', {
    user: req.user
  })
);

module.exports = router;