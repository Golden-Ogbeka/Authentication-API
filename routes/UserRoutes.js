const express = require('express');
const router = express.Router();
const AuthenticationMiddleware = require('../middlewares/authentication');

// Base Route
router.get('/', async (req, res) => {
  try {
    return res.send("Welcome to Golden Ogbeka's API App");
  } catch (error) {
    return res.status(500).json({
      message: "Couldn't get route",
    });
  }
});

// Get all users
router.get('/api/users', AuthenticationMiddleware, async (req, res) => {
  try {
    const Users = await UserModel.find({}, { name: 1, email: 1 });

    return res.json({ Users });
  } catch (error) {
    return res.status(500).json({
      message: "Couldn't get users",
    });
  }
});

module.exports = router;
