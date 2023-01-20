const express = require('express');
const bodyParser = require('body-parser');
const PORT = 3000;
const server = express();
const user_DAO = require('./DAOs/user_DAO')

server.use(bodyParser.json());

// Test basic server functionality
server.get('/', (req, res) => {
    res.send(`Server activated, listening on port ${PORT}`);
})

server.listen(PORT, () => {
    console.log(`Server on, listening on port ${PORT}.`);
})

// Per MVP: Users (employees or managers) must be able to log in
// With email + password
server.post('/login', async (req, res) => {
    console.log("login screen")
});

// Per MVP: Users (employees or managers) must be able to register a new account
server.post('/register', async (req, res) => {
    console.log("register screen")
    try {
        await user_DAO.addUser(req.body.email, req.body.password, req.body.role);
        res.send({
            "message": "Registered new user!"
        });
    }
    catch (err) {
        res.statusCode = 500;
        res.send({
            "message": err
        })
    }
});