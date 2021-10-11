const keys = require('./keys');
const redis = require('redis');

const redisClient = redis.createClient({
    host: keys.redisHost,
    port: keys.redisPort,
    // try to reconnect every 1s
    retry_strategy: () => 1000
});

// subscribe to the redis updates
const sub = redisClient.duplicate();

const fib = (index) => {
    if (index < 2) return 1;
    return fib(index - 1) + fib(index - 2);
};

// when we get a new value, run our calc
sub.on('message', (channel, message) => {
    redisClient.hset('values', message, fib(parseInt(message, 10)));
    // { 7: 31, etc....}
});
// whenever a new record is inserted, run the things
sub.subscribe('insert');