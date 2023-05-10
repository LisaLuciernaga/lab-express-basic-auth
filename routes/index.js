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

router.post("/login", (req, res, next) => {
  let {username, password} = req.body;
  console.log("login credentials: " + username, password)

  if(username == "" || password == "") {
    res.render("login", {errorMessage: "Please enter a valid username and password"});
    return;
  }

  User.find({username})
  .then(users => {
    if(users.length == 0) {
      res.render("login", {errorMessage: "The entered credentials don't match any account"});
      console.log("user doesn't exist", username)
      return;
    }
    let newUser = users[0];
    if(bcrypt.compareSync(password, newUser.password)) {
      req.session.currentUser = username; 
      //User is now logged in
      console.log("User successfully logged in" + req.session.surrentUser);
      res.redirect("/profile")
    } else {
      res.render("login", {errorMessage: "The entered credentials don't match any account"});
      return;
    }
  })
});

//Get profile page
router.get('/profile', (req, res, next) => {
  res.render('profile')
})


module.exports = router;
