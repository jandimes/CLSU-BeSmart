const createError = require( `http-errors` );
const express = require( `express` );
const path = require( `path` );
const cookieParser = require( `cookie-parser` );
const morgan = require( `morgan` );
const bodyParser = require( `body-parser` );
const compression = require( `compression` );
const mysql = require( `mysql2` );
const session = require( `express-session` );
const expressValidator = require( `express-validator` );
const expressMessages = require( `express-messages` );
const passport = require( `passport` );
const flash = require( `connect-flash` );
const cors = require( `cors` );

const configDatabase = require( `./config/database` );
const configApp = require( `./config/app` );
const configEnvironment = require( `./config/environment` );
const configPassport = require( `./config/passport` );



// Mysql Connection
const con = mysql.createConnection( 
  configDatabase
);

// Winston Logger
const { createLogger, format, transports } = require( `winston` );
const { combine, timestamp, label, printf } = format;
const loggerFormat = printf( info => {
  return `${info.timestamp} ${info.level}: ${info.message}`;
} );
const logger = createLogger( {
  format: combine(
    timestamp(),
    loggerFormat
  ),
  transports: [
    // new transports.File({ filename: `combined.log` }),
    new transports.File( { filename: `error.log`, level: `error` } ),
    new transports.Console()
  ]
} );



const app = express();



// view engine setup
app.set( `views`, path.join(__dirname, `views`) );
app.set( `view engine`, `ejs` );

app.use( morgan( `dev` ) );
app.use( bodyParser.json() );
app.use( bodyParser.urlencoded( { extended: false } ) );
app.use( cors() );
app.use( compression() );



app.use( express.static( path.join(__dirname, `public`) ) );
app.use( `/css`, express.static( path.join(__dirname, `node_modules/light-bootstrap-dashboard-master`) ) );
app.use( `/css`, express.static( path.join(__dirname, `public/css`) ) );
app.use( `/js`, express.static( path.join(__dirname, `node_modules/light-bootstrap-dashboard-master/assets/js`) ) );
app.use( `/js`, express.static( path.join(__dirname, `public/js`) ) );
app.use( `/images`, express.static( path.join(__dirname, `public/images`) ) );
app.use( `/vendor`, express.static( path.join(__dirname, `public/vendor`) ) );
app.use( `/node_modules`, express.static( path.join(__dirname, `node_modules`) ) );



// Express-Session
app.use( cookieParser( configEnvironment.secret ) );
app.use( session( {
  secret: configEnvironment.secret,
  resave: false,
  saveUninitialized: true
} ) );
// Express-Messages
app.use( flash() );
app.use( function (req, res, next) {
  res.locals.messages = expressMessages(req, res);
  next();
} );
// Express-Validator
app.use( expressValidator( {
  errorFormatter: ( param, msg, value ) => {
      var namespace = param.split(`.`),
          root = namespace.shift(),
          formParam = root;

      while( namespace.length ) {
          formParam += `[${namespace.shift()}]`;
      }
      return {
          param: formParam,
          msg: msg,
          value: value
      }
  }
} ) );
// Passport Config
configPassport(passport);
app.use( passport.initialize() );
app.use( passport.session() );

// GLOBALS
app.get( `*`, ( req, res, next ) => {
  res.locals.user = req.user || null;
  res.locals.configApp = configApp;
  next();
} );


// Make db and logger accessible to our router
app.use( ( req, res, next ) => {
  req.con = con;
  req.logger = logger;
  next();
} );



// ROUTES
var userRouter = require( `./routes/user` );
var userSettingsRouter = require( `./routes/user-settings` );
var attendanceRouter = require( `./routes/attendance` );
var readingTimeRouter = require( `./routes/reading-time` );
var patronRouter = require( `./routes/patron` );
var restoreRouter = require( `./routes/restore` );

app.use( `/users`, userRouter );
app.use( `/user-settings`, userSettingsRouter );
app.use( `/attendance`, attendanceRouter );
app.use( `/reading-time`, readingTimeRouter );
app.use( `/patrons`, patronRouter );
app.use( `/restore`, restoreRouter );

var fakerRouter = require( `./routes/faker` );
app.use( `/faker`, fakerRouter );

// PAGES
app.get( `/`, (req, res, next) => {
  return res.render( `pages/index` );
} );
app.get( `/dashboard`, (req, res, next) => {
  return res.render( `pages/dashboard` );
} );
app.get( `/patron`, (req, res, next) => {
  return res.render( `pages/patron` );
} );
app.get( `/account`, (req, res, next) => {
  return res.render( `pages/account` );
} );

// RANDOM INSERT ATTENDANCE
app.get( `/attendance/random`, (req, res, next) => {
  
  var faker = require( `faker` );
  var timeIn = faker.date.past();
  var timeInHour = (timeIn.getHours()<8||timeIn.getHours()>17) ? `08`:timeIn.getHours();

  var attendance = {
    barcode: `20${faker.random.number(10)+10}-${faker.random.number(8999)+1000}`,
    date: `${timeIn.toISOString().split(`T`)[0]}`,
    timeIn: (timeIn.getHours()<8||timeIn.getHours()>17) ? `08:${timeIn.getMinutes()}:${timeIn.getSeconds()}`:timeIn.toLocaleString().split(` `)[1],
    timeOut: `${( Math.random()*(17-Number(timeInHour))+Number(timeInHour) ).toFixed(0)}:${timeIn.getMinutes()}:${timeIn.getSeconds()}`,
    section: `${Number(Math.random()*5+1).toFixed(0)}`
  };

  var sql = `INSERT INTO tbl_attendance (barcode, date, timeIn, timeOut, section) VALUES (?, ?, ?, ?, ?)`,
      sqlParams = [ attendance.barcode, attendance.date, attendance.timeIn, attendance.timeOut, attendance.section ];

  con.query( sql, sqlParams, (error, results) => {
    if(error) throw error;
    return res.json( results );
  } );
} );



// catch 404 and forward to error handler
app.use( (req, res, next) => {
  next( createError(404) );
} );

// error handler
app.use( (err, req, res, next) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get(`env`) === `development` ? err : {};

  // render the error page
  res.status( err.status || 500 );
  return res.render( `pages/error` );
} );



module.exports = app;