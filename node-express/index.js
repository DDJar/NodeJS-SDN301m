const express = require('express');
const http = require('http');
const bodyParser = require('body-parser');

const dishRouter =require('./routes/dishRouter')
//ass1 task 2
const promoRouter = require('./routes/promoRouter');
//ass1 task 3
const leaderRouter = require('./routes/leaderRouter');
const hostname = 'localhost';
const port = 3000;

const app = express();


////ass1 task 1
app.use('/dishes',dishRouter);
//ass1 task 2
app.use('/promotions', promoRouter);
//ass1 task 3
app.use('/leaders', leaderRouter);
const server = http.createServer(app);

server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`)
})