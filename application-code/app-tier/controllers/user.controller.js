require("dotenv").config();

const models = require("../models");
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");

const secret = process.env.secret;

function signUp(req, res) {
  //Sign up
  models.User.findOne({ where: { username: req.body.username } })
    .then((result) => {
      if (result) {
        res.status(409).json({
          message: "username already exists!",
        });
      } else {
        bcryptjs.genSalt(10, function (err, salt) {
          bcryptjs.hash(req.body.password, salt, function (err, hash) {
            const user = {
              firstName: req.body.firstName,
              lastName: req.body.lastName,
              username: req.body.username,
              password: hash,
            };

            models.User.create(user)
              .then((result) => {
                const token = jwt.sign(
                  {
                    username: result.username,
                    userId: result.id,
                  },
                  secret,
                  { expiresIn: "1h" },
                  function (err, token) {
                    const userData = {
                      ...result.dataValues,
                      token: token,
                    };
                    delete userData.password;
                    res.status(201).json({
                      message: "User created successfully!",
                      user: userData,
                    });
                  }
                );
              })
              .catch((error) => {
                res.status(500).json({
                  message: "Something went wrong!",
                  error,
                });
              });
          });
        });
      }
    })
    .catch((error) => {
      res.status(500).json({
        message: "Something went wrong!",
        error,
      });
    });
}

function login(req, res) {
  models.User.findOne({ where: { username: req.body.username } })
    .then((user) => {
      if (user === null) {
        res.status(401).json({
          message: "Invalid credentials!",
        });
      } else {
        bcryptjs.compare(
          req.body.password,
          user.password,
          function (err, result) {
            if (result) {
              const token = jwt.sign(
                {
                  username: user.username,
                  userId: user.id,
                },
                secret,
                { expiresIn: "1h" },
                function (err, token) {
                  const userData = {
                    ...user.dataValues,
                    token: token,
                  };
                  delete userData.password;
                  res.status(200).json({
                    message: "Authentication successful!",
                    user: userData,
                  });
                }
              );
            } else {
              res.status(401).json({
                message: "Invalid credentials!",
              });
            }
          }
        );
      }
    })
    .catch((error) => {
      res.status(500).json({
        message: "Something went wrong!",
        error,
      });
    });
}

module.exports = {
  signUp: signUp,
  login: login,
};
