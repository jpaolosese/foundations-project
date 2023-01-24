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

function addReimbursement(email, amount, description) {
    const params = {
        TableName: 'reimbursements',
        Item: {
            email,
            amount,
            description
        }
    }
    docClient.put(params).promise();
}

function processReimbursement(status) {
    const params = {
        TableName: 'reimbursements',
        Item: {
            status
        }
    }
    // more to add
}

module.exports = {
    addReimbursement
}