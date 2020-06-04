const express = require('express');
const router = express.Router();
const { ensureAuthenticated, forwardAuthenticated } = require('../config/auth');

// Login Page
router.get('/', forwardAuthenticated, (req, res) => res.render('login.html'));

// Main Page
router.get('/main', ensureAuthenticated, (req, res) =>
  res.render('main.html', {
    current_user: req.user
  })
);

module.exports = router;