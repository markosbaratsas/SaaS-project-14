const express = require('express');
const router = express.Router();

const { pool } = require("../config/database");

router.post('/sign-in/',
    function(req, res, next) {
        let email = req.body['email'];
        pool.query(
            `SELECT * FROM "User" WHERE email = $1`,
            [email],
            (err, results) => {
                if(err) {
                    return res.json({ error: JSON.parse(err) })
                }
                else{
                    return res.json({ results: results })
                }
            }
        )
    })

router.post('/sign-up/',
    function(req, res, next) {
        let email = req.body['email'];
        let password = req.body['password'];
        pool.query(
            `SELECT * FROM "User" WHERE email = $1`,
            [email],
            (err, results) => {
                if (err) {
                    return res.json({ error: JSON.parse(err) })
                }
                else if (results.rows.length > 0) {
                    return res.json({ results: "Email already registered" });
                } else {
                    pool.query(
                        `INSERT INTO "User" (email, password)
                        VALUES ($1, $2)
                        RETURNING id, password`,
                        [email, password],
                        (err, results) => {
                            if (err) {
                                console.log(err);
                                res.json({ error: "Something went wrong..." });
                            }
                            else {
                                console.log(results.rows);
                                res.json({ results: "Successfully registered!" });
                            }
                        }
                    );
                }
            }
        )
    })

module.exports = router;
