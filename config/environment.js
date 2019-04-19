const crypto = require( `crypto` ).randomBytes(256).toString(`hex`);

module.exports = {
    ip: `127.0.0.1`,
    port: 8080,
    secret: crypto
};