const express = require( `express` );
const async = require( `async` );

const router = express.Router();



// Routes
router.get( `/attendance`, (req, res) => {
    var con = req.con;
    var logger = req.logger;

    var frequency = req.query.frequency;
    if( ! frequency ) {
        frequency = 100;
    }

    const insertRandomAttendance = () => {
        async.waterfall(
            [
                (callback) => {
                    var sql = `SELECT
                                    barcode
                                FROM
                                    tbl_patrons_basic
                                WHERE
                                    tbl_patrons_basic.status = "Active"`;

                    con.query( sql, (error, results) => {
                        var randomBarcode = results[ parseInt( Math.random()*(results.length-1) ) ].barcode;
                        var randomDate = `${parseInt( Math.random()*2+2017 )}-${parseInt( Math.random()*12+1 ).toString().padStart(2, `0`)}-${parseInt( Math.random()*28+1 ).toString().padStart(2, `0`)}`;
                        var randomTimeIn = `${parseInt( Math.random()*4+8 ).toString().padStart(2, `0`)}:${parseInt( Math.random()*59 ).toString().padStart(2, `0`)}:${parseInt( Math.random()*59 ).toString().padStart(2, `0`)}`;  // 8AM-12PM
                        var randomTimeOut = `${parseInt( Math.random()*4+13 ).toString().padStart(2, `0`)}:${parseInt( Math.random()*59 ).toString().padStart(2, `0`)}:${parseInt( Math.random()*59 ).toString().padStart(2, `0`)}`;  // 1PM-5PM
                        var randomSection = parseInt( Math.random()*6+1 );

                        var randomAttributes = {
                            barcode: randomBarcode,
                            date: randomDate,
                            timeIn: randomTimeIn,
                            timeOut: randomTimeOut,
                            section: randomSection,
                        }
                        callback(error, randomAttributes);  
                    } );
                },
                (results, callback) => {
                    var sql = `INSERT INTO
                                tbl_attendance (barcode, date, timeIn, timeOut, section)
                                VALUES ( ?, ?, ?, ?, ? )`,
                        sqlParams = [ results.barcode, results.date, results.timeIn, results.timeOut, results.section ];
                    con.query( sql, sqlParams, (error) => {
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

                // return res.status(200).json( {
                //     error: false,
                //     data: results,
                //     message: `Data inserted`
                // } );
            }
        );
    };

    for( var i=0; i<frequency; i++ )
        insertRandomAttendance();

    return res.status(200).json( {
        error: false,
        message: `Data inserted`
    } );

} );



module.exports = router;