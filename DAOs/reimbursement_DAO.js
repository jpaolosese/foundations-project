const user = require('./user_DAO');
const AWS = require('aws-sdk');
AWS.config.update({
    region: 'us-west-2'
});
const docClient = new AWS.DynamoDB.DocumentClient();

/**
 * functions to add:
 * addReimbursement(email, amount, description)
 * processReimbursement() <- approve/deny
 * viewReimbursements()
 * viewReimbursementsByEmail(email)
 * viewReimbursementsByStatus()
 *  ^ can split that into:
 *      viewPendingReimbursements
 *      viewApprovedReimbursements
 *      viewDeniedReimbursements
 */

function addReimbursement(user_email, amount, description, reimbursement_id = Date.now()) {
    const params = {
        TableName: 'reimbursements',
        Item: {
            reimbursement_id: String(reimbursement_id),
            user_email,
            amount,
            description,
            status: "pending"
        }
    }
    return docClient.put(params).promise();
}

function processReimbursement(status) {
    const params = {
        TableName: 'reimbursements',
        Item: {
            status
        }
    }
    return docClient.update(params).promise();
    // more to add
}

function viewReimbursementsByEmail(email) {
    const params = {
        TableName: 'reimbursements',
        Item: {
            user_email: email
        }
    }
    return docClient.query(params).promise;
}

module.exports = {
    addReimbursement
    processReimbursement,
    viewReimbursementsByEmail
}