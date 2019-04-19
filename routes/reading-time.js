const express = require( `express` );
const async = require( `async` );
const moment = require( `moment` );

const router = express.Router();



// Routes
router.get( `/`, (req, res) => {
    return res.render( `pages/reading-time` );
} );



router.get( `/year`, (req, res) => {
    var con = req.con;
    var logger = req.logger;
  
    async.parallel(
        [
            (callback) => {
                var sql = `SELECT
                                tbl_attendance.*,
                                substr(date, 6, 2) AS month,
                                substr(date, 1, 4) AS year,
                                tbl_patrons_basic.course,
                                tbl_patrons_basic.gender
                            FROM
                                tbl_attendance
                            INNER JOIN tbl_patrons_basic ON tbl_patrons_basic.barcode = tbl_attendance.barcode
                            ORDER BY
                                tbl_attendance.date ASC,
                                tbl_attendance.timeIn ASC,
                                tbl_attendance.timeOut ASC`;

                con.query( sql, (error, results) => {
                    callback(error, results);  
                } );
            }
        ],
        (error, results) => {
            if(error) {
                logger.error( error );
                return res.status(500).json( {
                    error: true,
                    data: [ {
                        param: ``,
                        msg: `Database error. Please try again later`,
                        value: ``
                    } ],
                    message: `Database error. Please try again later`
                } );
            }

            var data = [],
                years = [],
                readingTimes = [],
                totalReadingTime = 0;

            // Compute Reading Time
            results[0].forEach( i => {
                try {
                    var timeIn = moment(`2000-01-01 ${i.timeIn.substring(0,5)}`);
                    var timeOut = moment(`2000-01-01 ${i.timeOut.substring(0,5)}`);
                    var readingTime = (timeOut.get(`h`)*60 + timeOut.get(`m`)) - (timeIn.get(`h`)*60 + timeIn.get(`m`));

                    var year = i.year;                    
                    if( ! years.includes(year) ) {
                        years.push( year );
                        readingTimes.push( readingTime );
                    } else {
                        readingTimes[ years.indexOf(year) ] += readingTime;
                    }
                } catch(error) {
                    logger.error(error);
                    return res.status(500).json( {
                        error: true,
                        data: error,
                        message: error
                    } ); 
                }                
            });

            for( var x=0; x<years.length; x++ ){
                data.push( {
                    year: years[x],
                    readingTime: readingTimes[x]
                } );
                totalReadingTime += readingTimes[x];
            }

            return res.json( {
                error: false,
                count: data.length,
                totalReadingTime: totalReadingTime,
                data: data
            } );
        }
    );
} );



router.get( `/month`, (req, res) => {
    var con = req.con;
    var logger = req.logger;

    var year = req.query.year;

    if( ! year )
        return res.status(400).json( {
            error: true,
            data: [ {
                param: ``,
                msg: `Missing required parameter: year`,
                value: ``
            } ],
            message: `Missing required parameter: year`
        } );
  
    async.parallel(
        [
            (callback) => {
                var sql = `SELECT
                                tbl_attendance.*,
                                substr(date, 6, 2) AS month,
                                substr(date, 1, 4) AS year,
                                tbl_patrons_basic.course,
                                tbl_patrons_basic.gender
                            FROM
                                tbl_attendance
                            INNER JOIN tbl_patrons_basic ON tbl_patrons_basic.barcode = tbl_attendance.barcode
                            WHERE substr(tbl_attendance.date, 1, 4)=${year}
                            ORDER BY
                                tbl_attendance.date ASC,
                                tbl_attendance.timeIn ASC,
                                tbl_attendance.timeOut ASC`;

                con.query( sql, (error, results) => {
                    callback(error, results);  
                } );
            }
        ],
        (error, results) => {
            if(error) {
                logger.error( error );
                return res.status(500).json( {
                    error: true,
                    data: [ {
                        param: ``,
                        msg: `Database error. Please try again later`,
                        value: ``
                    } ],
                    message: `Database error. Please try again later`
                } );
            }

            var data = [],
                months = [],
                readingTimes = [],
                totalReadingTime = 0;

            // Compute Reading Time
            results[0].forEach( i => {
                try {
                    var timeIn = moment(`2000-01-01 ${i.timeIn.substring(0,5)}`);
                    var timeOut = moment(`2000-01-01 ${i.timeOut.substring(0,5)}`);
                    var readingTime = (timeOut.get(`h`)*60 + timeOut.get(`m`)) - (timeIn.get(`h`)*60 + timeIn.get(`m`));

                    var month = i.month;
                    if( ! months.includes(month) ) {
                        months.push( month );
                        readingTimes.push( readingTime );
                    } else {
                        readingTimes[ months.indexOf(month) ] += readingTime;
                    }
                } catch(error) {
                    logger.error(error);
                    return res.status(500).json( {
                        error: true,
                        data: error,
                        message: error
                    } ); 
                }                
            });

            for( var x=0; x<months.length; x++ ){
                data.push( {
                    month: months[x],
                    readingTime: readingTimes[x]
                } );
                totalReadingTime += readingTimes[x];
            }

            return res.json( {
                error: false,
                count: data.length,
                totalReadingTime: totalReadingTime,
                data: data
            } );
        }
    );
} );



router.get( `/course`, (req, res) => {
    var con = req.con;
    var logger = req.logger;
  
    async.parallel(
        [
            (callback) => {
                var sql = `SELECT
                                tbl_attendance.*,
                                tbl_patrons_basic.course,
                                tbl_patrons_basic.gender
                            FROM
                                tbl_attendance
                            INNER JOIN tbl_patrons_basic ON tbl_patrons_basic.barcode = tbl_attendance.barcode
                            ORDER BY
                                course ASC`;

                con.query( sql, (error, results) => {
                    callback(error, results);  
                } );
            }
        ],
        (error, results) => {
            if(error) {
                logger.error( error );
                return res.status(500).json( {
                    error: true,
                    data: [ {
                        param: ``,
                        msg: `Database error. Please try again later`,
                        value: ``
                    } ],
                    message: `Database error. Please try again later`
                } );
            }

            var data = [],
                courses = [],
                readingTimes = [],
                totalReadingTime = 0;

            // Compute Reading Time
            results[0].forEach( i => {
                try {
                    var timeIn = moment(`2000-01-01 ${i.timeIn.substring(0,5)}`);
                    var timeOut = moment(`2000-01-01 ${i.timeOut.substring(0,5)}`);
                    var readingTime = (timeOut.get(`h`)*60 + timeOut.get(`m`)) - (timeIn.get(`h`)*60 + timeIn.get(`m`));

                    if( ! courses.includes(i.course) ) {
                        courses.push( i.course );
                        readingTimes.push( readingTime );
                    } else {
                        readingTimes[ courses.indexOf(i.course) ] += readingTime;
                    }
                } catch(error) {
                    logger.error(error);
                    return res.status(500).json( {
                        error: true,
                        data: error,
                        message: error
                    } ); 
                }                
            });

            for( var x=0; x<courses.length; x++ ){
                data.push( {
                    course: courses[x],
                    readingTime: readingTimes[x]
                } );
                totalReadingTime += readingTimes[x];
            }

            return res.json( {
                error: false,
                count: data.length,
                totalReadingTime: totalReadingTime,
                data: data
            } );
        }
    );
} );



router.get( `/section`, (req, res ) => {
    var con = req.con;
    var logger = req.logger;
  
    async.parallel(
        [
            (callback) => {
                var sql = `SELECT
                                tbl_patrons_basic.barcode,
                                tbl_attendance.date,
                                tbl_attendance.timeIn,
                                tbl_attendance.timeOut,
                                tbl_attendance.section,
                                tbl_patrons_basic.course,
                                tbl_patrons_basic.gender
                            FROM
                                tbl_attendance
                            INNER JOIN
                                tbl_patrons_basic ON tbl_patrons_basic.barcode = tbl_attendance.barcode
                            ORDER BY section ASC`;
                con.query( sql, (error, results) => {
                    callback(error, results);  
                } );
            }
        ],
        (error, results) => {
            if(error) {
                logger.error( error );
                return res.status(500).json( {
                    error: true,
                    data: [ {
                        param: ``,
                        msg: `Database error. Please try again later`,
                        value: ``
                    } ],
                    message: `Database error. Please try again later`
                } );
            }

            var data = [],
                sections = [],
                readingTimes = [],
                totalReadingTime = 0;

            // Compute Reading Time
            results[0].forEach( i => {
                try {
                    var timeIn = moment(`2000-01-01 ${i.timeIn.substring(0,5)}`);
                    var timeOut = moment(`2000-01-01 ${i.timeOut.substring(0,5)}`);
                    var readingTime = (timeOut.get(`h`)*60 + timeOut.get(`m`)) - (timeIn.get(`h`)*60 + timeIn.get(`m`));

                    if( ! sections.includes(i.section) ) {
                        sections.push( i.section );
                        readingTimes.push( readingTime );
                    } else {
                        readingTimes[ sections.indexOf(i.section) ] += readingTime;
                    }
                } catch(error) {
                    logger.error(error);
                    return res.status(500).json( {
                        error: true,
                        data: error,
                        message: error
                    } ); 
                }           
            });

            for( var x=0; x<sections.length; x++ ){
                data.push( {
                    section: sections[x],
                    readingTime: readingTimes[x]
                } );
                totalReadingTime += readingTimes[x];
            }

            return res.json( {
                error: false,
                count: data.length,
                totalReadingTime: totalReadingTime,
                data: data
            } );
        }
    );
} );



router.get( `/gender`, (req, res ) => {
    var con = req.con;
    var logger = req.logger;
  
    async.parallel(
        [
            (callback) => {
                var sql = `SELECT
                                tbl_patrons_basic.barcode,
                                tbl_attendance.date,
                                tbl_attendance.timeIn,
                                tbl_attendance.timeOut,
                                tbl_attendance.section,
                                tbl_patrons_basic.course,
                                tbl_patrons_basic.gender
                            FROM
                                tbl_attendance
                            INNER JOIN
                                tbl_patrons_basic ON tbl_patrons_basic.barcode = tbl_attendance.barcode
                            ORDER BY gender ASC`;
                con.query( sql, (error, results) => {
                    callback(error, results);  
                } );
            }
        ],
        (error, results) => {
            if(error) {
                logger.error( error );
                return res.status(500).json( {
                    error: true,
                    data: [ {
                        param: ``,
                        msg: `Database error. Please try again later`,
                        value: ``
                    } ],
                    message: `Database error. Please try again later`
                } );
            }

            var data = [],
                genders = [],
                readingTimes = [],
                totalReadingTime = 0;

            // Compute Reading Time
            results[0].forEach( i => {
                try {
                    var timeIn = moment(`2000-01-01 ${i.timeIn.substring(0,5)}`);
                    var timeOut = moment(`2000-01-01 ${i.timeOut.substring(0,5)}`);
                    var readingTime = (timeOut.get(`h`)*60 + timeOut.get(`m`)) - (timeIn.get(`h`)*60 + timeIn.get(`m`));

                    if( ! genders.includes(i.gender) ) {
                        genders.push( i.gender );
                        readingTimes.push( readingTime );
                    } else {
                        readingTimes[ genders.indexOf(i.gender) ] += readingTime;
                    }
                } catch(error) {
                    logger.error(error);
                    return res.status(500).json( {
                        error: true,
                        data: error,
                        message: error
                    } ); 
                }         
            });

            for( var x=0; x<genders.length; x++ ){
                data.push( {
                    gender: genders[x],
                    readingTime: readingTimes[x]
                } );
                totalReadingTime += readingTimes[x];
            }

            return res.json( {
                error: false,
                count: data.length,
                totalReadingTime: totalReadingTime,
                data: data
            } );
        }
    );
} );

module.exports = router;