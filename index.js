// Foundations Project
// Two DBs: One for users, one for tickets

const express = require('express');
const bodyParser = require('body-parser');
const PORT = 3000;
const server = express();
const user_DAO = require('./DAOs/user_DAO');
const reimbursement_DAO = require('./DAOs/reimbursement_DAO');
const jwtUtil = require('./utils/jwt-util');

server.use(bodyParser.json());


/**
 * Important: When using manager-only functionalities
 * Use "Bearer token" when testing in Postman
 */

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
    const data = await user_DAO.retrieveUserByEmail(email);
    const dataItem = data.Item

    try {
        if (dataItem) { // Check if user exists
            if (dataItem.password === password) { // verify password
                res.send({
                    "message": "Successfully logged in",
                    "token": jwtUtil.createJWT(dataItem.email, dataItem.role)
                })
            } else { // if password is wrong
                res.statusCode = 400;
                res.send({
                    "message": "Invalid password"
                });
            }
        } else { // if user doesn't exist
            res.statusCode = 400;
            res.send({
                "message": "Invalid email"
            });
        }
    } catch (err) { // if anything else goes wrong
        res.statusCode = 400;
        res.send({
            "message": err
        })
    }

    // try {
    //     const user = await user_DAO.retrieveUserByEmail(email);
    //     if (user) { // Check if user exists
    //         if (user.Item.password === password) { // verify password
    //             res.send({
    //                 "message": "Successfully logged in."
    //             })
    //         } else { // if password is wrong
    //             res.statusCode = 400;
    //             res.send({
    //                 "message": "Invalid password"
    //             })

    //         }
    //     } else { // if user doesn't exist
    //         res.statusCode = 400; 
    //         res.send({
    //             "message": "Invalid username"
    //         })
    //     }
    // } catch (err) {
    //     res.statusCode = 400;
    //     res.send({
    //         "message": err
    //     })
    // }
    // // send JWT
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

// Per MVP: Employees and only Employees must be able to submit a reimbursement ticket
server.post('/reimbursements', async (req, res) => {
    console.log("submit reimbursement")
    try { 
        const authHeader = req.headers.authorization;
        const token = authHeader.split(" ")[1];
        const tokenPayload = await jwtUtil.verifyTokenAndReturnPayload(token);

        if (tokenPayload.role === "manager") { // check if user submitting reimbursement ticket role === "employee"
            res.statusCode = 401;
            res.send({
                "message": "You are not authorized to submit a reimbursement"
            })
        } else {
            await reimbursement_DAO.addReimbursement(tokenPayload.email, req.body.amount, req.body.description);
            res.statusCode = 201;
            res.send({
                "message": "Reimbursement submitted"
            });
        }
    } catch (err) {
        if (err.name === "JsonWebTokenError") {
            res.statusCode = 400;
            res.send({
                "message": "Invalid JWT"
            });
        } else if (err.name === "TypeError") {
            res.statusCode = 400;
            res.send({
                "message": "No auth header provided"
            })
        }
    }
})

// Per MVP: Managers must be able to approve/deny reimbursement tickets
// Check if role === "manager", "employee" must not be able to process tickets
// Do not allow changes in final status
// i.e. approved -> denied or approved -> pending, denied -> approved or denied -> pending
server.patch('/reimbursements/:reimbursement_id/status', async (req, res) => {
    console.log("process reimbursement");
    const status = req.body.status;
    const id = req.body.reimbursement_id;
    console.log("do you make it this far?");

    try {
        const authHeader = req.headers.authorization;
        const token = authHeader.split(" ")[1];
        const tokenPayload = jwtUtil.verifyTokenAndReturnPayload(token);
        console.log(tokenPayload);
        const role = tokenPayload.role;
        console.log(role)

        const data = await reimbursement_DAO.viewReimbursementByID(req.body.reimbursement_id);
        const reimbursement = data.Item;

        if (reimbursement.status === "pending") {
            if (role === "manager") {
                await reimbursement_DAO.processReimbursement(req.body.status, req.body.reimbursement_id);
                res.send({
                    "message": `Reimbursement ${req.body.status}`
                })
            } else {
                res.statusCode = 400;
                res.send({
                    "message": "You are not authorized to process reimbursements"
                })
            }
        } else {
            res.statusCode = 400;
            res.send({
                "message": "This reimbursement cannot be reprocessed"
            })
        }
    } catch (err) {
        res.statusCode = 400;
        res.send({
            "message": err
        })
    }
    
})
    //     if (tokenPayload.role === "manager") {
    //         console.log("make it this far?")
    //         const data = await reimbursement_DAO.viewReimbursementByID(id);
    //         console.log("this far?")
    //         const reimbursement = data.Item;
    //         if (reimbursement.status === "pending") {
    //             await reimbursement_DAO.processReimbursement(status, id);
    //             res.send({
    //                 "message": `Reimbursement ${status}`
    //             })
    //         } else {
    //             res.statusCode = 400;
    //             res.send({
    //                 "message": "Cannot update processed reimbursement"
    //             })
    //         }
    //     } else {
    //         res.statusCode = 400;
    //         res.send({
    //             "message": "you are not authorized to process reimbursements"
    //         })
    //     }
    // } catch (err) {
    //     res.statusCode = 400;
    //     res.send({
    //         "message": err
    //     })
    // }

    // try {
    //     const authHeader = req.header.authorization;
    //     console.log("how about this far?")
    //     const token = authHeader.split(" ")[1];
    //     console.log("here?")
    //     const tokenPayload = jwtUtil.verifyTokenAndReturnPayload(token);
    //     console.log("how about here?")

    //     if (tokenPayload.role === "manager") {
    //         console("this far?")
    //         const data = (await reimbursement_DAO.viewReimbursementByID(id)).Item;
    //         console.log("do you make it this far?");
    //         if (data.status === "pending") {
    //             await reimbursement_DAO.processReimbursement(status);
    //             res.statusCode = 200;
    //             res.send({
    //                 "message": `Reimbursement ${data.id} processed`
    //             });
    //         } else {
    //             res.statusCode = 400;
    //             res.send({
    //                 "message": "Cannot change already processed reimbursement"
    //             });
    //         }
    //     } else {
    //         res.statusCode = 400;
    //         res.send({
    //             "message": "You are not authorized to process reimbursements"
    //         });
    //     }
    // } catch (err) {
    //     res.statusCode = 400;
    //     res.send({
    //         "message": err
    //     })
    // }

