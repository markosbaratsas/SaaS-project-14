const express = require('express');
const router = express.Router();
const bcrypt = require("bcrypt");
const axios = require("axios");
require("dotenv").config();

const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

const jwt = require('jsonwebtoken');
const JWTStrategy = require('passport-jwt').Strategy;
const ExtractJWT = require('passport-jwt').ExtractJwt;

async function apiCall(method, url, data) {
    return await axios({
        method: method,
        url: url,
        data: data
    })
        .then((results) => {
            if(results.data.results) return results.data.results
            else return results.data.error
        })
        .catch((err) => {
            console.log(err)
        })
}

function validEmail(email) {
  const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
}

function checkErrors(email, password, password2) {
  let errors = [];

  if (!email || !password || !password2) {
    errors.push({ message: "Please enter all fields" });
  }

  if (password && password.length < 6) {
    errors.push({ message: "Password must be a least 6 characters long" });
  }


  if (password && password2 && password !== password2) {
    errors.push({ message: "Passwords do not match" });
  }

  if (email && !validEmail(email)) {
    errors.push({ message: "Please enter a valid email" });
  }

  return errors;

}

passport.use('signIn', new LocalStrategy(
    async function(email, password, done) {
        let results = await apiCall('post', 'http://localhost:3001/sign-in', {
            email: email
        })
        if(results.rows) {
            if (results.rows.length > 0) {
                const user = results.rows[0];

                bcrypt.compare(password, user.password, (err, isMatch) => {
                    if (err) {
                        console.log(err);
                        return done(null, false, { message: "Something went wrong, please try again." });
                    }
                    if (isMatch) {
                        return done(null, { email: user.email, id: user.id  });
                    } else {
                        //password is incorrect
                        return done(null, false, { message: "Password is incorrect" });
                    }
                });
            } else {
                // No user
                return done(null, false, { message: "No user with that email address" });
            }
        }
        else {
            console.log("Error: " + results);
            return done(null, false, { message: "Something went wrong, please try again." });
        }
}));

passport.use('token', new JWTStrategy(
    {
      secretOrKey: process.env.JWT_SECRET,
      jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken()
    },
    function(token, done) {
      return done(null, { email: token.email, id: token.id });
    }
));

router.post('/sign-in',
    passport.authenticate('signIn', {session: false}),
    function(req, res, next) {
      res.json({
        email: req.user['email'], token: jwt.sign(req.user, process.env.JWT_SECRET, { expiresIn: 360000})
      });
    }
);

router.post('/sign-up',async function(req, res, next) {
  let email = req.body['email'];
  let password = req.body['password'];
  let password2 = req.body['password2'];

  let errors = checkErrors(email, password, password2);

  if (errors.length > 0) {
    res.json({
      errors: errors,
      email: email,
      password: password,
      password2: password2
    });
  }
  else {
    let hashedPassword = await bcrypt.hash(password, 10);
    let results = await apiCall('post', 'http://localhost:3001/sign-up', {
        email: email,
        password: hashedPassword
    })
      if(results === "Email already registered") return res.json({ message: "Email already registered"});
      else if(results === "Successfully registered!") res.json({ success: "Successfully registered!" });
        else res.json({ error: "Something went wrong..." });

  }
});

router.get('/authenticate',
    passport.authenticate('token', { session: false }),
    function(req, res, next) {
      return res.json({ email: req.user.email, id: req.user.id });
    }
);

module.exports = router;
