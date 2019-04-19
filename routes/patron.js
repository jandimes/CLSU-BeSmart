const express = require( "express" );
const async = require( "async" );
const passport = require( "passport" );

const router = express.Router();



// Routes
router.get( "/", function( req, res ) {
    var con = req.con;
    var logger = req.logger;
  
    async.parallel(
        [
            (callback) => {
                try {
                    con.query( "SELECT * FROM tbl_patrons_basic INNER JOIN tbl_patrons_library ON tbl_patrons_basic.ID=tbl_patrons_library.ID LIMIT 100", (error, results) => {
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

            return res.json( results[0] );
        }
    );
} );



router.get( "/:barcode", function( req, res ) {
    var con = req.con;
    var logger = req.logger;

    var barcode = req.params.barcode;
  
    async.parallel(
        [
            (callback) => {
                try {
                    con.query( `SELECT * FROM tbl_patrons_basic WHERE barcode=?`, [barcode], (error, results) => {
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
                return res.json( {
                    error: false,
                    warning: true,
                    data: results[0],
                    message: `Patron account with barcode '${barcode}' is not active`
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

router.get( "/all/:barcode", function( req, res ) {
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
                        tbl_patrons_basic LEFT JOIN tbl_patrons_library ON tbl_patrons_basic.ID=tbl_patrons_library.ID
                    WHERE barcode=?
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

            return res.json( {
                error: false,
                count: results[0].length,
                data: [patron],
                message: `${results[0].length} record(s) found`
            } );
        }
    );
} );



module.exports = router;