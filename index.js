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

    try {
        console.log("how about this far?")
        const user = await user_DAO.retrieveUserByEmail(email);
        
        //const userData = user.Items;
        console.log("even here?")
        if (user) { // Check if user exists
            if (user.Item.password === password) { // verify password
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
    } catch (err) {
        res.statusCode = 400;
        res.send({
            "message": err
        })
    }
    // send JWT
});

// Per MVP: Users (employees or managers) must be able to register a new account
server.post('/register', async (req, res) => {
    console.log("register screen")
    const email = req.body.email;
    const password = req.body.password;
    try {
        const user = await user_DAO.retrieveUserByEmail(email);
        const userData = user.Item;
        if (userData) { // if user already exists
            res.send({
                "message": "User already exists under that email!"
            })
        } else {
            user_DAO.addUser(email, password);
            res.send({
                "message": "Successfully registered!"
            })
        }
    } catch (err) {
        res.statusCode = 400;
        res.send({
            "message": err
        })
    }
})

// Per MVP: Users must be able to submit a reimbursement ticket
server.post('/reimbursements', async (req, res) => {
    console.log("submit reimbursement")
    try {
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

// Per MVP: Managers must be able to approve/deny reimbursement tickets
// Check if role === "manager", "employee" must not be able to process tickets
// Do not allow changes in final status
// i.e. approved -> denied or approved -> pending, denied -> approved or denied -> pending
server.patch('/reimbursements', async (req, res) => {
    console.log("process reimbursement");
    const email = req.body.email;
    const status = req.body.status;
    const user = await user_DAO.retrieveUserByEmail(email);
    const userData = user.Item;
    const reimbursement = reimbursement_DAO.viewReimbursementsBy(email)
    const reimbursementData = reimbursement.Item;

    if (userData) { // Check if user exists
        if (userData.role === "manager") { // Allow only managers to process reimbursements
            // Now check if status is pending
            
            if (reimbursementData && reimbursementData.status === "pending") {
                await reimbursement_DAO.processReimbursement(status);
                res.send({
                    "message": "Processed reimbursement!"
                })
            } else {    // If not then status cannot be changed
                res.send({
                    "message": "Reimbursement has already been processed."
                })
            }
            
        } else { // Otherwise they cannot process reimbursements
            res.statusCode = 403;
            res.send({
                "message": "You are not authorized to approve/deny reimbursements!"
            })
        }
    } else { // Error if user does not exist
        res.statusCode = 400;
        res.send({
            "message": "User does not exist!"
        });
    }


})
