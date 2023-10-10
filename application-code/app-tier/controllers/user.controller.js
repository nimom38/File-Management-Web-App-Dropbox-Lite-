const models = require("../models");
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");

function signUp(req, res) {
  console.log("req.body", req.body);
  const user = {
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    username: req.body.username,
    password: req.body.password,
  };

  models.User.create(user)
    .then((res) => {
      res.status(201).json({ message: "User created successfully" });
    })
    .catch((err) => {
      res.status(500).json({ message: "Something went wrong" });
    });
}

module.exports = {
  signUp: signUp,
};
