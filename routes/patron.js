const express = require( `express` );
const async = require( `async` );
const passport = require( `passport` );
const internetAvailable = require( `internet-available` );
const fetch = require( `node-fetch` );
const router = express.Router();



// Routes
router.get( `/`, function( req, res ) {
    var con = req.con;
    var logger = req.logger;
  
    async.parallel(
        [
            (callback) => {
                try {
                    con.query( `SELECT * FROM tbl_patrons_basic INNER JOIN tbl_patrons_library ON tbl_patrons_basic.ID=tbl_patrons_library.ID LIMIT 100`, (error, results) => {
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

            return res.status(200).json( {
                error: false,
                count: results[0].length,
                data: results[0],
                message: `${results[0].length} record(s) found`
            } );}
    );
} );

router.get( `/getNotified`, function( req, res ) {
    var con = req.con;
    var logger = req.logger;
  
    async.parallel(
        [
            (callback) => {
                try {
                    con.query( `SELECT * FROM tbl_patrons_library where isNotified = 0`, (error, results) => {
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
            return res.status(200).json( {
                error: false,
                count: results[0].length,
                data: results[0],
                message: `${results[0].length} record(s) found`
            } );
        }
    );
} );

router.post( `/sendMessage`, function( req, res) {
    var cellphoneNumber = req.body.cellphoneNumber;
    var message = req.body.message;
    var apiCode = req.body.apiCode;

    fetch( `https://www.itexmo.com/php_api/api.php`, {
        method: `POST`,
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "Access-Control-Allow-Origin": "*"
        },
        body: `1=${cellphoneNumber}&2=${message}&3=${apiCode}`
    } )
    .then( (response) => {
        return res.status(200).json( {
            error: false,
            message: `${response}`
        } );
    } )
    .catch( (response) => {
        return res.status(500).json( {
            error: true,
            message: `${response}`
        } );
    } )
});

router.get( `/checkOnline`, function( req, res) {
    internetAvailable()
    .then( () => {
        return res.status(200).json( {
            error: false
        } );
    } )
    .catch( () => {
        return res.status(500).json( {
            error: true,
            data: [ {
                param: ``,
                msg: `You are not connected to the Internet. SMS Notifications won't work`,
                value: ``
            } ],
            message: `You are not connected to the Internet. SMS Notifications won't work`
        } );
    } );
} );

router.get( `/getPatron/:id`, function( req, res ) {
    var con = req.con;
    var logger = req.logger;
    var id = req.params.id;
  
    async.parallel(
        [
            (callback) => {
                try {
                    con.query( `SELECT * FROM tbl_patrons_basic where ID = ?`, [id], (error, results) => {
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

router.put( `/notified`, (req, res) => {
    var con = req.con;
    var logger = req.logger;

    let id = req.body.id;

    if( !id ) {
        return res.status(400).json( {
            error: true,
            data: [ {
                param: ``,
                msg: `No ID provided`,
                value: ``
            } ]
        } );
    }   

    async.parallel( [
        (callback) => {
            con.query( `UPDATE tbl_patrons_library SET isNotified = 1 WHERE ID = ?`, [id], (error, results) => {
                callback( error, results );
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

        if( results[0].affectedRows === 0 ) {
            return res.status(404).json( {
                error: true,
                data: [ {
                    params: ``,
                    msg: `No user found`,
                    value: ``
                } ],
                message: `No user found`
            } );
        } else {
            return res.status(200).json( {
                error: false,
                data: results[0],
                message: `Updated successfully`
            } );
        }
    } );
});



router.get( `/delinquents`, function( req, res ) {
    var con = req.con;
    var logger = req.logger;
  
    async.parallel(
        [
            (callback) => {
                try {
                    var sql = `
                        SELECT
                            tbl_patrons_basic.*
                        FROM
                            tbl_patrons_library
                        INNER JOIN
                            tbl_patrons_basic ON tbl_patrons_basic.ID = tbl_patrons_library.ID
                        WHERE
                            tbl_patrons_library.isDelinquent = TRUE`,
                        sqlParams = [];
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

            return res.status(200).json( {
                error: false,
                count: results[0].length,
                data: results[0],
                message: `${results[0].length} record(s) found`
            } );
        }
    );
} );



router.get( `/:barcode`, function( req, res ) {
    var con = req.con;
    var logger = req.logger;

    var barcode = req.params.barcode;
  
    async.parallel(
        [
            (callback) => {
                try {
                    con.query( `SELECT * FROM tbl_patrons_basic WHERE barcode = ?`, [barcode], (error, results) => {
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

            if( results[0].length == 1 && results[0][0].status == `Inactive` ) {
                return res.status(400).json( {
                    error: false,
                    warning: true,
                    data: results[0],
                    message: `Patron account with barcode '${barcode}' is not active`
                } );
            } else if( results[0].length < 1 ) {
                return res.status(400).json( {
                    error: false,
                    warning: true,
                    data: results[0],
                    message: `Patron account with barcode '${barcode}' does not exist`
                } );
            }

            return res.status(200).json( {
                error: false,
                count: results[0].length,
                data: results[0],
                message: `${results[0].length} record(s) found`
            } );
        }
    );
} );

router.get( `/all/:barcode`, function( req, res ) {
    var con = req.con;
    var logger = req.logger;

    var barcode = req.params.barcode;
  
    async.parallel(
        [
            (callback) => {
                var sql = `
                    SELECT
                        tbl_patrons_basic.ID,
                        tbl_patrons_basic.barcode,
                        tbl_patrons_basic.status,
                        tbl_patrons_basic.lastName,
                        tbl_patrons_basic.firstName,
                        tbl_patrons_basic.middleName,
                        tbl_patrons_basic.gender,
                        tbl_patrons_basic.course,
                        tbl_patrons_library.accessLevel,
                        tbl_patrons_library.assetItemsOut,
                        tbl_patrons_library.assetItemsOverdue,
                        tbl_patrons_library.textbookItemsOut,
                        tbl_patrons_library.textbookItemsOverdue,
                        tbl_patrons_library.libraryItemsOut,
                        tbl_patrons_library.libraryItemsOverdue,
                        tbl_patrons_library.mediaItemsOut,
                        tbl_patrons_library.mediaItemsOverdue,
                        tbl_patrons_library.libraryHolds,
                        tbl_patrons_library.mediaBookings,
                        tbl_patrons_library.libraryFines,
                        tbl_patrons_library.textbookFines,
                        tbl_patrons_library.otherFines
                    FROM
                        tbl_patrons_basic LEFT JOIN tbl_patrons_library ON tbl_patrons_basic.ID = tbl_patrons_library.ID
                    WHERE barcode = ?
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

            var patron = null;
            
            if( results[0].length > 0 ) {
                patron = {
                    basic: {
                        ID: results[0][0].ID,
                        barcode: results[0][0].barcode,
                        status: results[0][0].status,
                        lastName: results[0][0].lastName,
                        firstName: results[0][0].firstName,
                        middleName: results[0][0].middleName,
                        gender: (results[0][0].gender=='M'||results[0][0].gender=='F') ? results[0][0].gender: null,
                        course: results[0][0].course,
                    },
                    library: {
                        accessLevel: results[0][0].accessLevel,
                        assetItems: {
                            out: results[0][0].assetItemsOut,
                            overdue: results[0][0].assetItemsOverdue
                        },
                        textbookItems: {
                            out: results[0][0].textbookItemsOut,
                            overdue: results[0][0].textbookItemsOverdue
                        },
                        libraryItems: {
                            out: results[0][0].libraryItemsOut,
                            overdue: results[0][0].libraryItemsOverdue
                        },
                        mediaItems: {
                            out: results[0][0].mediaItemsOut,
                            overdue: results[0][0].mediaItemsOverdue
                        },
                        libraryHolds: results[0][0].libraryHolds,
                        mediaBookings: results[0][0].mediaBookings,
                        fines: {
                            library: results[0][0].libraryFines,
                            textbook: results[0][0].textbookFines,
                            other: results[0][0].otherFines
                        }
                    }
                };
            }            

            if( results[0].length == 1 && results[0][0].status == `Inactive` ) {
                return res.json( {
                    error: false,
                    warning: true,
                    data: [patron],
                    message: `Patron account with barcode '${barcode}' is not active`
                } );
            }

            return res.status(200).json( {
                error: false,
                count: results[0].length,
                data: [patron],
                message: `${results[0].length} record(s) found`
            } );
        }
    );
} );



module.exports = router;