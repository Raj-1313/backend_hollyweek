const Auth_Sign = require("../model/Authantication_Model");
const express = require("express");
const jwt = require("jsonwebtoken");
const App = express.Router();
const bcrypt = require('bcrypt');

App.post("/signup", async (req, res) => {
  const { email, password, name, country, mobile, gender } = req.body;
  const regExp = /[a-zA-Z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{3,8}/g;
  const userEmail = await Auth_Sign.findOne({ email });

  try {
    if (userEmail) {
      return res.send("User already exists");
    } else if (regExp.test(email)) {
      const hash = await bcrypt.hash(password, 5);

      const User = await Auth_Sign.create({
        email,
        password: hash,
        name,
        country,
        mobile,
        gender,
      });

      return res.status(201).send({ message: "Successfull" });
    } else {
      return res.status(403).send({ message: "Passowrd need to be stronger" });
    }
  } catch (e) {
    return res.send({ message: "404 error Url is not working" });
  }
});



App.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    let user = await Auth_Sign.findOne({ email });
    if (!user) {
      res.status(400).send({ message: "Register First" });
    } else {
      const match = await bcrypt.compare(password, user.password);
      if (match) {
        let token = jwt.sign(
          {
            email,
            userID: user._id,
          },
          process.env.key,
          {
            expiresIn: "10 day",
          }
        );
        req.body.userID=user._id;
        res.status(201).send({ message: "Login Success", token, category:user.category,name:user.name,email:user.email });
      } else {
        res.status(400).send({ message: "Wrong Credential" });
      }
    }
  } catch (err) {
    res
      .status(401)
      .send({ error: err.message, message: "Somthing Went Wrong While Login" });
  }
});

module.exports = App;