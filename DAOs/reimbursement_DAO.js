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

function processReimbursement(new_status, id) {
    const params = {
        TableName: 'reimbursements',
        UpdateExpression: "set #s = :s",
        ExpressionAttributeNames: {
            "#s": "status"
        },
        ExpressionAttributeValues: {
            ":s": new_status
        },
        Key: {
            reimbursement_id: id
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
    return docClient.query(params).promise();
}

function viewReimbursementByID(reimbursement_id) {
    const params = {
        TableName: 'reimbursements',
        Key: {
            reimbursement_id: reimbursement_id
        }
    }
    return docClient.get(params).promise();
}

function viewReimbursementByStatus(status) {
    const params = {
        TableName: 'reimbursements',
        Key: {
            status: status
        }
    }
    return docClient.query(params).promise();
}

function viewAllReimbursements() {
    const params = {
        TableName: 'reimbursements'
    }
    return docClient.scan(params).promise()
}

module.exports = {
    addReimbursement,
    processReimbursement,
    viewReimbursementsByEmail,
    viewReimbursementByID,
    viewReimbursementByStatus,
    viewAllReimbursements
}