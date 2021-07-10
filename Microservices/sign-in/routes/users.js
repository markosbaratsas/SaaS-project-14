const express = require('express');
const router = express.Router();
const bcrypt = require("bcrypt");
require("dotenv").config();

const { pool } = require("../config/database");

const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

const jwt = require('jsonwebtoken');
const JWTStrategy = require('passport-jwt').Strategy;
const ExtractJWT = require('passport-jwt').ExtractJwt;

const REDIS_PORT = process.env.REDIS_PORT;
const REDIS_HOST = process.env.REDIS_HOST;
const redis_pool = require('redis-connection-pool')('myRedisPool', {
        host: REDIS_HOST,
        port: REDIS_PORT,
    }
);

redis_pool.hget('subscribers', 'sign-up', async(err, data) => {
    let currentSubscribers = JSON.parse(data);
    let alreadySubscribed = false;

    let myAddress = process.env.MY_ADDRESS;
    for(let i = 0; i < currentSubscribers.length; i++) {
        if (currentSubscribers[i] === myAddress)
            alreadySubscribed = true;
    }
        if(alreadySubscribed === false){
            currentSubscribers.push(myAddress);
            redis_pool.hset('subscribers', 'sign-up', JSON.stringify(currentSubscribers), () => {})
            console.log("Subscribed");
        }
        else
            console.log("Already subscribed")
});

passport.use('signIn', new LocalStrategy(function(email, password, done) {
    pool.query(
        `SELECT * FROM "User" WHERE email = $1`,
        [email],
        (err, results) => {
            if (err) {
                console.log("Error: " + err);
                return done(null, false, { message: "Something went wrong, please try again." });
            } else {
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
        }
    );
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

router.post('/bus', (req, res) => {
    let event = req.body.event;
    pool.query(
        `INSERT INTO "User" (id, email, password)
                                VALUES ($1, $2, $3)
                                RETURNING id, password`,
        [event['id'], event['email'], event['password']],
        async (err, results) => {
            if (err) {
                console.log(err);
                res.status(500);
                res.json({ error: "Something went wrong..." });
            }
            else {
                console.log("Successfully added new user to database!");
                res.json({ success: "Successfully added new user to database!" });
            }
        }
    );
})

module.exports = router;
