// In order to perform AWS operations, must connect to AWS DynamoDB

const AWS = require('aws-sdk');
AWS.config.update({
    region: 'us-west-2'
});
