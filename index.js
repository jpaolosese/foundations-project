// Foundations Project
// Two DBs: One for users, one for tickets

const express = require('express');
const bodyParser = require('body-parser');
const PORT = 3000;
const server = express();
const user_DAO = require('./DAOs/user_DAO');
const reimbursement_DAO = require('./DAOs/reimbursement_DAO');

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
    const email = req.body.email;
    const password = req.body.password;

    const user = await user_DAO.retrieveUserByEmail(email)
    const userData = user.Item;
    if (userData) { // Check if user exists
        if (userData.password === password) { // verify password
            res.send({
                "message": "Successfully logged in."
            })
        } else { // if password is wrong
            res.statusCode = 400;
            res.send({
                "message": "Invalid password"
            })

        }
    } else { // if user doesn't exist
        res.statusCode = 400; 
        res.send({
            "message": "Invalid username"
        })
    }
    // send JWT
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

server.post('/reimbursements', async (req, res) => {
    console.log("submit reimbursement")
    try {
        // maybe add functionality to check if that email exists in reimbursement_users table?
        await reimbursement_DAO.addReimbursement(req.body.email, req.body.amount, req.body.description);
        res.send({
            "message": "reimbursement submitted!"
        })
    } catch (err) {
        res.statusCode = 500;
        res.send({
            "message": err
        })
    }
})

