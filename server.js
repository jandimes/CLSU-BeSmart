const http = require( `http` );
const app = require( `./app` );
const configEnvironment = require( `./config/environment` );

const ip = process.env.port || configEnvironment.ip;
const port = process.env.port || configEnvironment.port;
const server = http.createServer( app );

server.listen( port, ip, function() {
    console.log( `Server started on ${ip}:${port}...` );
} );


//
//
