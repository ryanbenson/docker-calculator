const keys = require('./keys');
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const redis = require('redis');

// setup our express app
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({
  extended: true
}));

// connect to pg
const pgClient = new Pool({
    user: keys.pgUser,
    host: keys.pgHost,
    database: keys.pgDatabase,
    password: keys.pgPassword,
    port: keys.pgPort
});

pgClient.on('error', () => {
    console.log('Lost PG Connection');
});

// initialize our table if it doesn't exist
pgClient.on('connect', client => {
    client
        .query('CREATE TABLE IF NOT EXISTS values (number INT)')
        .catch(err => console.error(err));
});

// connect to redis
const redisClient = redis.createClient({
    host: keys.redisHost,
    port: keys.redisPort,
    retry_strategy: () => 1000
});

// use a separate connection intentionally
const publisher = redisClient.duplicate();

// setup API routes
app.get('/', (req, res) => {
    res.send('Hi');
});

app.get('/values/all', async (req, res) => {
    // get all values that have been submitted via PG
    const values = await pgClient.query('SELECT * FROM values');
    res.send(values.rows);
});

app.get('/values/current', async (req, res) => {
    // get current values from redis that we've gotten (index and calculated values by the indexes)
    redisClient.hgetall('values', (err, values) => {
        res.send(values);
    });
});

app.post('/values', async (req, res) => {
    const index = parseInt(req.body.index, 10);
    // limit our index value, so we dont get big indexes causing too high of processing
    if (index > 40) {
        return res.status(422).send('Index too high');
    }

    // the final value will be updated by our worker
    redisClient.hset('value', index, 'Nothing yet!');
    // trigger our worker so it will calculate
    publisher.publish('insert', index);
    // update our pg for the new index we got
    await pgClient.query('INSERT INTO values(number) VALUES ($1)', [index]);
    res.send({ working: true });
});

// start our server
app.listen(5000, err => {
    console.log('Listening on port 5000');
})