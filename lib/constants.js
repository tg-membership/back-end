const env = require("dotenv").config();

exports.constants = {
    VALIDATION_ERROR : 400,
    UN_AUTHORISED : 401,
    FORBIDDEN : 403,
    NOT_FOUND : 404,
    SERVER_ERROR : 500
};

 exports.ACCESS_TOKEN_SECRET =  process.env.ACCESS_TOKEN_SECRET
 exports.EMAIL_HOST =  process.env.EMAIL_HOST
 exports.EMAIL_PORT =  process.env.EMAIL_PORT
 exports.EMAIL_USER =  process.env.EMAIL_USER
 exports.EMAIL_PASS =  process.env.EMAIL_PASS
 exports.EMAIL_FROM =  process.env.EMAIL_FROM
exports.APTOS_MAINNET  = "https://api.mainnet.aptoslabs.com/v1/"
exports.APTOS_TESTNET  = "https://api.testnet.aptoslabs.com/v1/"
exports.APTOS_DEVNET  = "https://api.devnet.aptoslabs.com/v1/"
