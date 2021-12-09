const JWT = require('jsonwebtoken');

//Authentication middleware
const verifyAdmin = async (req, res, next) => {
  //Verify User's token
  try {
    let token = req.headers.authorization;

    if (!token) {
      return res.status(401).json({
        status: 'failed',
        message: 'Access Denied. Login to continue',
      });
    }
    token = token.split(' ')[1]; //to remove the Bearer

    await JWT.verify(token, process.env.JWT_SECRET);

    next();
  } catch (error) {
    console.log(error);
    return res
      .status(401)
      .json({ status: 'failed', message: 'Access Denied. Login to continue' });
  }
};

module.exports = verifyAdmin;
