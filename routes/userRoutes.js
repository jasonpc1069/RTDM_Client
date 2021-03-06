const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');

// User Model
const User = require ('../models/userModel');

router.get('/register',  (req, res) => res.render('register.html'));

router.post('/register', (req, res) => {
    const { username, password, password2 } = req.body;
    let errors = [];
  
    if (!username || !password || !password2) {
      errors.push({ msg: 'Please enter all fields' });
    }
  
    if (password != password2) {
      errors.push({ msg: 'Passwords do not match' });
    }
  
    if (password.length < 6) {
      errors.push({ msg: 'Password must be at least 6 characters' });
    }
  
    if (errors.length > 0) {
      res.render('register.html', {
        errors,
        username,
        password,
        password2
      });
    } else {
      User.findOne({ username: username }).then(user => {
        if (user) {
          errors.push({ msg: 'Username already exists' });
          res.render('register.html', {
            errors,
            username,
            password,
            password2
          });
        } else {
          const newUser = new User({
            username,
            password
          });
  
          bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(newUser.password, salt, (err, hash) => {
              if (err) throw err;
              newUser.password = hash;
              newUser
                .save()
                .then(user => {
                  req.flash(
                    'success_msg',
                    'You are successfully registered and now can log in'
                  );
                  res.redirect('/');
                })
                .catch(err => console.log(err));
            });
          });
        }
      });
    }
  });

  // Login
router.post('/login', (req, res, next) => {
    passport.authenticate('local', {
      successRedirect: '/main',
      failureRedirect: '/',
      failureFlash: true
    })(req, res, next);
  });
  
  // Logout
  router.get('/logout', (req, res) => {
    req.logout();
    req.flash('success_msg', 'You are logged out');
    res.redirect('/');
  });


 module.exports = router;