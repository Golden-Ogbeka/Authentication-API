const express = require('express');
const UserModel = require('../models/User.js');
const bcryptjs = require('bcryptjs');
const EmailTransporter = require('../utils/nodemailer/index.js');
const uuid = require('uuid'); //to get JWT_SECRET
const JWT = require('jsonwebtoken');
const {
  getGoogleAuthURL,
  getGoogleUser,
} = require('../utils/authentication/google');
const {
  getFacebookLoginUrl,
  getFacebookUserData,
} = require('../utils/authentication/facebook');
const router = express.Router();

// Google Login
router.get('/api/login/google', async (req, res) => {
  try {
    const URL = await getGoogleAuthURL();
    return res.json({
      status: 'success',
      URL,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Couldn't login through Google",
    });
  }
});

//Google Login callback
router.get('/auth/google/callback', async (req, res) => {
  try {
    const user = await getGoogleUser(req.query);

    if (!user) {
      return res.status(500).json({
        message: 'Login unsuccessful',
      });
    }

    const { email } = user;
    const existingUser = await UserModel.findOne({ email });
    if (!existingUser) {
      // Create the user and login
      const newUser = await UserModel.create({
        email: user.email,
        password: user.email,
        isVerified: true,
        name: user.name,
      });
      const { email } = newUser;
      const userToken = JWT.sign(
        {
          email,
        },
        process.env.JWT_SECRET,
        {
          expiresIn: '7d',
          issuer: 'Golden Ogbeka',
        }
      );
      return res.json({
        status: 'success',
        message: 'Sign in successful',
        User: {
          email: newUser.email,
          name: newUser.name,
          token: userToken,
          isVerified: true,
        },
      });
    }
    //    If user already exists
    const userToken = JWT.sign(
      {
        email,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: '7d',
        issuer: 'Golden Ogbeka',
      }
    );
    return res.json({
      status: 'success',
      message: 'Sign in successful',
      User: {
        email: existingUser.email,
        name: existingUser.name,
        token: userToken,
        isVerified: true,
      },
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Couldn't login through Google",
    });
  }
});

// Facebook Login
router.get('/api/login/facebook', async (req, res) => {
  try {
    const URL = await getFacebookLoginUrl();
    return res.json({
      status: 'success',
      URL,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Couldn't login through Facebook",
    });
  }
});

// Facebook login callback
router.get('/auth/facebook/callback', async (req, res) => {
  try {
    if (!req.query.code) {
      return res.status(400).json({
        status: 'failed',
        message: 'Callback code is required',
      });
    }
    const user = await getFacebookUserData(req.query.code);

    if (!user) {
      return res.status(500).json({
        message: 'Login unsuccessful',
      });
    }

    const { email } = user;
    const existingUser = await UserModel.findOne({ email });
    if (!existingUser) {
      // Create the user and login
      const newUser = await UserModel.create({
        email: user.email,
        password: user.email,
        isVerified: true,
        name: user.name,
      });
      const { email } = newUser;
      const userToken = JWT.sign(
        {
          email,
        },
        process.env.JWT_SECRET,
        {
          expiresIn: '7d',
          issuer: 'Golden Ogbeka',
        }
      );
      return res.json({
        status: 'success',
        message: 'Sign in successful',
        User: {
          email: newUser.email,
          name: newUser.name,
          token: userToken,
          isVerified: true,
        },
      });
    }
    //    If user already exists
    const userToken = JWT.sign(
      {
        email,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: '7d',
        issuer: 'Golden Ogbeka',
      }
    );
    return res.json({
      status: 'success',
      message: 'Sign in successful',
      User: {
        email: existingUser.email,
        name: existingUser.name,
        token: userToken,
        isVerified: true,
      },
    });
  } catch (error) {
    console.log(error);
    console.log(error);
    return res.status(500).json({
      message: "Couldn't login through Facebook",
    });
  }
});

// Local Login
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
      email: email,
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
    const userToken = JWT.sign(
      {
        email,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: '7d',
        issuer: 'Golden Ogbeka',
      }
    );
    return res.json({
      status: 'success',
      message: 'Sign in successful',
      User: {
        email: User.email,
        name: User.name,
        token: userToken,
        isVerified: true,
      },
    });
  } catch (error) {
    console.log(error);
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
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Couldn't register",
    });
  }
});

// Forgot password routes
router.post('/api/forgot-password', async (req, res) => {
  try {
    if (!req.body.email) {
      return res.status(400).json({
        status: 'failed',
        message: 'Incomplete fields',
      });
    }
    let { email } = req.body;

    const existingUser = await UserModel.findOne({ email });
    if (!existingUser) {
      return res.json({
        status: 'failed',
        message: "You aren't a registered user",
      });
    }

    const token = uuid.v4().substr(0, 5);

    existingUser.verificationCode = token;
    await existingUser.save();

    // Send email
    await EmailTransporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Forgot Password',
      text: `Your verification token to login is: ${token}`,
    });

    return res.json({
      status: 'success',
      message: 'Reset token sent',
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Couldn't reset password",
    });
  }
});

// Reset Password
router.post('/api/reset-password', async (req, res) => {
  try {
    if (!req.body.email || !req.body.password || !req.body.token) {
      return res.status(400).json({
        status: 'failed',
        message: 'Incomplete fields',
      });
    }
    let { email, password, token } = req.body;

    const existingUser = await UserModel.findOne({ email });
    if (!existingUser) {
      return res.json({
        status: 'failed',
        message: "You aren't a registered user",
      });
    }

    if (existingUser.verificationCode !== token) {
      return res.json({
        status: 'failed',
        message: 'Invalid token',
      });
    }

    const salt = await bcryptjs.genSalt(10);
    const hash = await bcryptjs.hash(password, salt);
    password = hash;

    existingUser.password = password;
    await existingUser.save();

    // Send email
    await EmailTransporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Password Reset',
      text: `This is to notify you that your password has been changed`,
    });

    return res.json({
      status: 'success',
      message: 'Password reset successful',
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Couldn't reset password",
    });
  }
});

module.exports = router;
