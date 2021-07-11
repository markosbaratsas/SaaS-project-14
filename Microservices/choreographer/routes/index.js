var express = require('express');
var router = express.Router();
const axios = require('axios');

const pool = require('redis-connection-pool')('myRedisPool', {
      url: process.env.REDIS_URL,
      maxclients: 19
    }
);

pool.hset('bus', 'messages', JSON.stringify([]), () => {});

// insert all channels here
pool.hset('subscribers', 'sign-up', JSON.stringify([]), () => {});
pool.hset('subscribers', 'create-question', JSON.stringify([]), () => {});
pool.hset('subscribers', 'answer-question', JSON.stringify([]), () => {});

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
                console.log("subscribers");
                console.log(subscribers);

                for(let i = 0; i < subscribers.length; i++) {
                    console.log("Informing: " + subscribers[i]);
                    axios.post(subscribers[i], newMessage)
                        .then(resp => {
                            console.log(subscribers[i], resp['data']);
                            if (i === subscribers.length -1) res.send({ "status": "ok"})
                        })
                        .catch(e => {
                            console.log(subscribers[i], { "status": "Lost connection"});
                            res.status(400);
                        })
                }
            })
        })
    })

})

module.exports = router;
