const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require("jsonwebtoken");


// User Model
const User = require('../../models/User');

// @route   POST api/users
// @desc    Register new user
// @access  Public
router.post('/', (req, res) => {
  const { name, email, phone, password } = req.body;

  // Simple validation
  if(!name || !phone || !password) {
    return res.status(400).json({ msg: 'Please enter all fields' });
  }

  // Check for existing user
  User.findOne({ phone })
    .then(user => {
      if(user) return res.status(400).json({ msg: 'User already exists' });

      const newUser = new User({
        name,
        email,
        phone,
        password
      });

      // Create salt & hash
      bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(newUser.password, salt, (err, hash) => {
          if(err) throw err;
          newUser.password = hash;
          newUser.save()
            .then(user => {
              jwt.sign(
                { id: user.id },
                process.env.JWT_SECRET,
                { expiresIn: 3600 },
                (err, token) => {
                  if(err) throw err;
                  res.json({
                    token,
                    user: {
                      id: user.id,
                      name: user.name,
                      email: user.email,
                      phone: user.phone
                    }
                  });
                }
              )
            });
        })
      })
    })
});

module.exports = router;