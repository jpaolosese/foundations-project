// Create JWTs
const jwt = require('jsonwebtoken');
const Promise = require('bluebird');

function createJWT(email, role) {
    return jwt.sign({
        email,
        role
    }, 'try_decoding_this', { 
        expiresIn: '1d'
    })
}

function verifyTokenAndReturnPayload(token) {
    jwt.verify = Promise.promisify(jwt.verify);
    return jwt.verify(token, 'try_decoding_this'); // return a promise with the payload
}

module.exports = {
    createJWT,
    verifyTokenAndReturnPayload
}