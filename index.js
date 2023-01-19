const express = require('express');
const bodyParser = require('body-parser');
const PORT = 3000;
const server = express();

server.use(bodyParser.json());

server.get('/', (req, res) => {
    res.send(`Server activated, listening on port ${PORT}`);
})