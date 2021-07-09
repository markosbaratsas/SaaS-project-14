var express = require('express');
var router = express.Router();
const axios = require('axios');

const REDIS_PORT = 6379;
const REDIS_HOST = "localhost";
const pool = require('redis-connection-pool')('myRedisPool', {
      host: REDIS_HOST,
      port: REDIS_PORT,
    }
);

pool.hset('bus', 'messages', JSON.stringify([]), () => {});

// insert all channels here
pool.hset('subscribers', 'sign-up', JSON.stringify([]), () => {});

router.post('/bus', async(req, res) => {
    const event = req.body.event;
    const channel = req.body.channel;

    let currentMessages;
    let newMessage = {};

    pool.hget('bus', 'messages', async (err, data) => {
        currentMessages = JSON.parse(data);
        newMessage = {
            'id': currentMessages.length + 1,
            'event': event,
            'channel': channel,
            'timestamp': Date.now()
        }
        currentMessages.push(newMessage);
        pool.hset('bus', 'messages', JSON.stringify(currentMessages), () => {
            pool.hget('subscribers', channel, (err, data) => {
                let subscribers = JSON.parse(data);

                for(let i = 0; i < subscribers.length; i++) {
                    axios.post(subscribers[i], newMessage)
                        .then(resp => {
                            console.log(subscribers[i], resp['data']);
                        })
                        .catch(e => {
                            console.log(subscribers[i], { "status": "Lost connection"});
                            res.status(400);
                        })
                }
                res.send({ "status": "ok"})
            })
        })
    })

})

module.exports = router;
