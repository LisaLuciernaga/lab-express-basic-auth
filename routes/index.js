const router = require("express").Router();
const bcrypt = require('bcryptjs');
const saltRounds = 10;
const User = require("../models/User.model");

/* GET home page */
router.get("/", (req, res, next) => {
  res.render("index");
});

//Get signup page
router.get("/signup", (req, res, next) => {
  res.render("signup");
});

router.post("/signup", (req, res, next) => {
  let { userName, password, passwordRepeat } = req.body;

  //Check, if all input fields have input & if passwords match
  if (userName == "" || password == "" || passwordRepeat == "") {
    let data = {
      errorMessage: "Please fill in all required fields",
      user: {
        userName,
        password,
        passwordRepeat,
      },
    };
    res.render("signup", data);
    return;
  } else if (password != passwordRepeat) {
    let data = {
      errorMessage: "The entered passwords don't match",
      user: {
        userName,
        password,
        passwordRepeat,
      },
    };
    res.render("signup", data);
    return;
  }

  //Check, if username already exists in DB
  User.find({ username: userName }).then((users) => {
    if (users.length != 0) {
      let data = {
        errorMessage: "This username already exists",
        user: {
          userName,
          password,
          passwordRepeat,
        },
      };
      res.render("signup", data);
      return;
    }
  });

  const salt = bcrypt.genSaltSync(saltRounds);
  const passwordEncrypted = bcrypt.hashSync(password, salt);

  User.create({ username: userName, password: passwordEncrypted })
    .then((result) => {
      res.redirect("/login");
    })
    .catch((err) => next(err));
});

//Get login page
router.get("/login", (req, res, next) => {
  res.render("login");
});

router.post("/login", (req, res, next) => {});

module.exports = router;
