const models = require("../models");
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");

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
                  "secret",
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
                });
              });
          });
        });
      }
    })
    .catch((error) => {
      res.status(500).json({
        message: "Something went wrong!",
      });
    });
}

module.exports = {
  signUp: signUp,
};
