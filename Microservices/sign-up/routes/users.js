const express = require('express');
const router = express.Router();
const bcrypt = require("bcrypt");
require("dotenv").config();

const { pool } = require("../config/database");

const passport = require('passport');
const JWTStrategy = require('passport-jwt').Strategy;
const ExtractJWT = require('passport-jwt').ExtractJwt;

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


passport.use('token', new JWTStrategy(
    {
      secretOrKey: process.env.JWT_SECRET,
      jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken()
    },
    function(token, done) {
      return done(null, { email: token.email, id: token.id });
    }
));

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
    pool.query(
        `SELECT * FROM "User" WHERE email = $1`,
        [email],
        (err, results) => {
          if (err) {
              console.log("HEY")
            console.log(err);
          }
          // check if user with that email already exists
          else if (results.rows.length > 0) {
            return res.json({ message: "Email already registered"});
          } else {
            pool.query(
                `INSERT INTO "User" (email, password)
                        VALUES ($1, $2)
                        RETURNING id, password`,
                [email, hashedPassword],
                (err, results) => {
                  if (err) {
                    console.log(err);
                    res.json({ error: "Something went wrong..." });
                  }
                  else {
                    console.log(results.rows);
                    res.json({ success: "Successfully registered!" });
                  }
                }
            );
          }
        }
    );
  }
});

module.exports = router;
