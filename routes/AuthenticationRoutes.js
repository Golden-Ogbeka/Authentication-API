const express = require('express');
const UserModel = require('../models/User.js');
const bcryptjs = require('bcryptjs');

const router = express.Router();

// Get all users
router.get('/api/users', async (req, res) => {
  try {
    const Users = await UserModel.find({}, { name: 1, email: 1 });

    return res.json({ Users });
  } catch (error) {
    return res.status(500).json({
      message: "Couldn't get users",
    });
  }
});

router.post('/api/login', async (req, res) => {
  try {
    if (!req.body.email || !req.body.password) {
      return res.status(400).json({
        status: 'failed',
        message: 'Incomplete fields',
      });
    }
    let { email, password } = req.body;

    const User = await UserModel.findOne({
      email: req.body.email,
    });

    if (!User) {
      return res.status(404).json({
        status: 'failed',
        message: 'Invalid email or password',
      });
    }

    const match = await bcryptjs.compare(password, User.password);

    if (!match) {
      return res.status(404).json({
        status: 'failed',
        message: 'Invalid email or password',
      });
    }
    return res.json({
      status: 'success',
      message: 'Sign in successful',
      User: { email: User.email, name: User.name },
    });
  } catch (error) {
    return res.status(500).json({
      message: "Couldn't login",
    });
  }
});

router.post('/api/register', async (req, res) => {
  try {
    if (!req.body.email || !req.body.password || !req.body.name) {
      return res.status(400).json({
        status: 'failed',
        message: 'Incomplete fields',
      });
    }
    let { name, email, password } = req.body;

    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return res.json({
        status: 'failed',
        message: 'User already exists',
      });
    }

    const salt = await bcryptjs.genSalt(10);
    const hash = await bcryptjs.hash(password, salt);
    password = hash;

    await bcryptjs.genSalt(10, async (err, salt) => {
      if (err) {
        throw err;
      }
      let User = await UserModel.create({
        name,
        email,
        password,
      });

      return res.json({
        status: 'success',
        message: 'Sign up successful',
        User: { email: User.email, name: User.name },
      });
    });
  } catch (error) {
    return res.status(500).json({
      message: "Couldn't register",
    });
  }
});

// Forgot password routes

module.exports = router;
