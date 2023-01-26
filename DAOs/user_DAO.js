// In order to perform AWS operations, must connect to AWS DynamoDB
const reimbursement = require('./reimbursement_DAO')
const AWS = require('aws-sdk');
AWS.config.update({
    region: 'us-west-2'
});
const docClient = new AWS.DynamoDB.DocumentClient();


// Register a user
function addUser(email, password, role = "employee") {
    const params = {
        TableName: 'reimbursement_users',
        Item: {
            email,
            password,
            role
        }
    }
    return docClient.put(params).promise();
}

// Verify user
function retrieveUserByEmail(email) {
    console.log("do you even make it this far?")
    const params = {
        TableName: 'reimbursement_users',
        Key: {
            "email": email
        }
    }
    console.log("how about here?");
    return docClient.get(params).promise();
}

module.exports = {
    addUser,
    retrieveUserByEmail
}