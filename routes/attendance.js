const express = require( `express` );
const async = require( `async` );
const moment = require( `moment` );
const router = express.Router();



// Routes
router.get( `/last-updated`, ( req, res ) => {
    var con = req.con;
    var logger = req.logger;
  
    async.parallel(
        [
            (callback) => {
                con.query( `SELECT MAX(date) as lastUpdated FROM tbl_attendance INNER JOIN tbl_patrons_basic ON tbl_patrons_basic.barcode=tbl_attendance.barcode`, (error, results) => {     
                    results[0].lastUpdated = results[0].lastUpdated.toLocaleString().split(` `)[0];
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

            return res.json( {
                error: false,
                data: results[0][0],
                message: `Last updated: ${results[0][0].lastUpdated}`
            } );
        }
    );
} );



router.get( `/daily`, ( req, res ) => {
    var con = req.con;
    var logger = req.logger;
    
    async.parallel(
        [
            (callback) => {
                con.query( `SELECT CAST( MAX(date) AS CHAR ) as lastUpdated FROM tbl_attendance INNER JOIN tbl_patrons_basic ON tbl_patrons_basic.barcode=tbl_attendance.barcode`, (error, results) => {
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

            return res.json( {
                error: false,
                data: results[0],
                message: `${results[0].length} result(s) found`
            } );
        }
    );
} );



router.get( `/count-per-gender`, ( req, res ) => {
    var con = req.con;
    var logger = req.logger;
  
    async.parallel(
        [
            (callback) => {
                con.query( `SELECT gender, COUNT(*) as totalAttendance FROM tbl_attendance INNER JOIN tbl_patrons_basic ON tbl_patrons_basic.barcode=tbl_attendance.barcode GROUP BY tbl_patrons_basic.gender ASC`, (error, results) => {
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

            return res.json( {
                error: false,
                data: results[0],
                message: `${results[0].length} result(s) found`
            } );
        }
    );
} );



router.get( `/count-per-course`, ( req, res ) => {
    var con = req.con;
    var logger = req.logger;
  
    async.parallel(
        [
            (callback) => {
                con.query( `SELECT course, COUNT(*) as totalAttendance FROM tbl_attendance INNER JOIN tbl_patrons_basic ON tbl_patrons_basic.barcode=tbl_attendance.barcode GROUP BY tbl_patrons_basic.course ASC`, (error, results) => {
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

            return res.json( {
                error: false,
                data: results[0],
                message: `${results[0].length} result(s) found`
            } );
        }
    );
} );



router.get( `/count-per-section`, ( req, res ) => {
    var con = req.con;
    var logger = req.logger;
  
    async.parallel(
        [
            (callback) => {
                con.query( `SELECT section, COUNT(*) as totalAttendance FROM tbl_attendance INNER JOIN tbl_patrons_basic ON tbl_patrons_basic.barcode=tbl_attendance.barcode GROUP BY tbl_attendance.section ASC`, (error, results) => {
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

            return res.json( {
                error: false,
                data: results[0],
                message: `${results[0].length} result(s) found`
            } );
        }
    );
} );



router.get( `/count-per-year`, ( req, res ) => {
    var con = req.con;
    var logger = req.logger;
  
    async.parallel(
        [
            (callback) => {
                con.query( `SELECT substr(date, 1, 4) AS year, COUNT(*) AS totalAttendance FROM tbl_attendance INNER JOIN tbl_patrons_basic ON tbl_patrons_basic.barcode=tbl_attendance.barcode GROUP BY year ASC`, (error, results) => {
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

            return res.json( {
                error: false,
                data: results[0],
                message: `${results[0].length} result(s) found`
            } );
        }
    );
} );

router.get( `/count-per-month`, ( req, res ) => {
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
                var sql = `
                    SELECT
                        substr(date, 6, 2) AS month,
                        substr(date, 1, 4) AS year,
                        COUNT(*) AS totalAttendance
                    FROM
                        tbl_attendance INNER JOIN tbl_patrons_basic ON tbl_patrons_basic.barcode=tbl_attendance.barcode
                    WHERE substr(date, 1, 4)=${year}
                    GROUP BY year, month ASC`;

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

            return res.json( {
                error: false,
                data: results[0],
                message: `${results[0].length} result(s) found`
            } );
        }
    );
} );



// INSERT
router.post( `/`, (req, res) => {
    var con = req.con;
    var logger = req.logger;

    var attendance = {
        barcode: req.body.barcode,
        date: new Date().toLocaleDateString(),
        time: new Date().toTimeString().split(" ")[0],
        section: req.body.section
    };

    var currentTime = attendance.time,                    
        currentTimeObj = {
            hour: currentTime.split(`:`)[0],
            minute: currentTime.split(`:`)[1],
            second: currentTime.split(`:`)[2]
        },                    
        currentTimeValue = Number( currentTimeObj.hour*60*60 ) + Number( currentTimeObj.minute*60 ) + Number( currentTimeObj.second );

    req.checkBody(`barcode`, `Barcode is required`).notEmpty();
    req.checkBody(`section`, `Section is required`).notEmpty();

    let errors = req.validationErrors();
    if(errors){
        return res.status(400).json( {
            error: true,
            data: errors,
            message: errors
        } );
    }
    
    async.waterfall(
        [
            (callback) => {
                con.query( `SELECT MAX(timeIn) AS lastTimeIn, MAX(timeOut) AS lastTimeOut FROM tbl_attendance WHERE barcode=? AND date=?`, [attendance.barcode, attendance.date], (error, results) => {
                    callback(error, results[0]);
                } );
            },
            (results, callback) => {
                if( results.lastTimeIn == null ) {
                    callback(null);
                } else {
                    let lastTimeIn = results.lastTimeIn,                    
                        lastTimeInObj = {
                            hour: lastTimeIn.split(`:`)[0],
                            minute: lastTimeIn.split(`:`)[1],
                            second: lastTimeIn.split(`:`)[2]
                        },                    
                        lastTimeInValue = Number( lastTimeInObj.hour*60*60 ) + Number( lastTimeInObj.minute*60 ) + Number( lastTimeInObj.second );

                    console.log( Number(currentTimeValue) - Number(lastTimeInValue) );

                    if( results.lastTimeOut == null ) {
                        if( ( Number(currentTimeValue) - Number(lastTimeInValue) ) > 10 ) {
                            callback(null);
                        } else {
                            callback( {
                                msg: `There must be a 10-second interval for attendance`
                            } );
                        }
                    } else {
                        let lastTimeOut = results.lastTimeOut,
                            
                            lastTimeOutObj = {
                                hour: lastTimeOut.split(`:`)[0],
                                minute: lastTimeOut.split(`:`)[1],
                                second: lastTimeOut.split(`:`)[2]
                            },
                            
                            lastTimeOutValue = Number( lastTimeOutObj.hour*60*60 ) + Number( lastTimeOutObj.minute*60 ) + Number( lastTimeOutObj.second );

                        console.log( Number(currentTimeValue) - Number(lastTimeOutValue) );

                        if( ( Number(currentTimeValue) - Number(lastTimeInValue) ) > 10 ||
                            ( Number(currentTimeValue) - Number(lastTimeOutValue) ) > 10 ) {
                            callback(null);
                        } else {
                            callback( {
                                msg: `There must be a 10-second interval for attendance`
                            } );
                        }
                    }

                }                                
            },
            (callback) => {
                con.query( `DELETE FROM tbl_attendance WHERE barcode=? AND date!=? AND (timeIn='' OR timeOut='')`, [attendance.barcode, attendance.date], (error) => {
                    callback(error);
                } );
            },
            (callback) => {
                con.query( `SELECT * FROM tbl_patrons_basic WHERE barcode=?`, [attendance.barcode], (error, results) => {
                    callback(error, results[0]);
                } );
            },
            (results, callback) => {
                if( ! results ) {
                    return res.status(400).json( {
                        error: true,
                        data: [ {
                            param: ``,
                            msg: `Patron with barcode of '${attendance.barcode}' does not exist`,
                            value: ``
                        } ],
                        message: `Patron with barcode of '${attendance.barcode}' does not exist`
                    } );
                } else {
                    con.query( `SELECT * FROM tbl_attendance WHERE barcode=? AND section=? AND date=? AND timeOut='' ORDER BY timeIn ASC`, [attendance.barcode, attendance.section, attendance.date], (error, results) => {
                        if( results.length != 0 )
                            callback(error, results);
                        else
                            callback(error, null);
                    } );
                }
            },
            (results, callback) => {
                if( results ) {
                    con.query( `UPDATE tbl_attendance SET timeOut=? WHERE ID=?`, [attendance.time, results[0].ID], (error, results) => {
                        callback(error, results);
                    } );
                } else {
                    con.query( `INSERT INTO tbl_attendance(barcode, date, timeIn, section) VALUES(?,?,?,?)`, [attendance.barcode, attendance.date, attendance.time, attendance.section], (error, results) => {
                        callback(error, results);
                    } );
                }
            }
        ],
        (error, results) => {
            if(error) {
                console.log( error );
                return res.status(500).json( {
                    error: true,
                    data: [ error ],
                    message: `Database error. Please try again later`
                } );
            }
            
            return res.status(200).json( {
                error: false,
                data: results,
                message: `Data inserted`
            } );

        }
    );
} );



// PATRON INDIVIDUAL ATTENDANCE
router.get( '/:barcode', (req, res, next) => {

    var con = req.con;
    var logger = req.logger;

    var barcode = req.params.barcode;
  
    async.parallel(
        [
            (callback) => {
                var sql = `
                    SELECT
                        tbl_attendance.barcode,
                        tbl_attendance.date,
                        tbl_attendance.timeIn,
                        tbl_attendance.timeOut,
                        tbl_attendance.section
                    FROM
                        tbl_attendance
                    WHERE
                        tbl_attendance.barcode=?
                    ORDER BY
                        date, timeIn
                `,
                    sqlParams = [barcode];

                try {
                    con.query( sql, sqlParams, (error, results) => {
                        callback(error, results);  
                    } );
                } catch (error) {
                    logger.error(error);
                    return res.status(500).json( {
                        error: true,
                        data: error,
                        message: error
                    } );                   
                }
            }
        ],
        (error, results) => {
            if(error) {
                logger.error( error );
                return res.status(500).json( {
                    error: true,
                    data: error,
                    message: error
                } );
            }

            return res.json( {
                error: false,
                count: results[0].length,
                data: results[0],
                message: `${results[0].length} record(s) found`
            } );
        }
    );

} );



const getDateNow = () => {
    var date = new Date();

    var dateFormatted = date
        .toISOString()
        .split(`T`)[0]
        .replace(`-`, `/`)
        .replace(`-`, `/`);

    return dateFormatted;
};



module.exports = router;