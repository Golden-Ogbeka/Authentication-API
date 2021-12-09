require('dotenv').config();
const express = require('express');
const jwt = require('jsonwebtoken');
const path = require('path');
const helmet = require('helmet');
const cors = require('cors');
const AuthenticationRoutes = require('./routes/AuthenticationRoutes');
const db = require('./db');

//setup server
const server = express();

// Helmet
server.use(helmet());

// Enable cors
server.use(cors());

// Database Initialization
db();

//For accepting form input
server.use(express.json());
server.use(
  express.urlencoded({
    extended: true,
  })
);

server.use('/', [AuthenticationRoutes]);

// For all routes that aren't implemented
server.all((err, req, res, next) => {
  console.log(err.stack);
  return res.status(501).send({
    status: 'FAILED',
    message: 'Not Implemented',
  });
});

const DEFAULT_SERVER_PORT = 3000;

server.listen(process.env.PORT || DEFAULT_SERVER_PORT, () => {
  console.log(
    `Server listening on port: ${process.env.PORT || DEFAULT_SERVER_PORT}`
  );
});
