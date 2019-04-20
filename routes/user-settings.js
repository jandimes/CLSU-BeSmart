const express = require( `express` );
const async = require( `async` );
const passport = require( `passport` );
const router = express.Router();



// Routes
router.get( `/`, (req, res) => {
    var con = req.con;
    var logger = req.logger;

    let userID = req.query.userID;

    if( ! userID )
        return res.status(400).json( {
            error: true,
            data: [ {
                param: ``,
                msg: `Missing required parameter: userID`,
                value: ``
            } ],
            message: `Missing required parameter: userID`
        } );

    async.parallel( [
        (callback) => {
            con.query( `SELECT tbl_user_settings.* FROM tbl_user INNER JOIN tbl_user_settings ON tbl_user.ID=tbl_user_settings.userID WHERE tbl_user.ID=?`, [userID], (error, results) => {
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

        if( ! results[0] || results[0].length === 0 ) {
            return res.status(404).json( {
                error: true,
                data: [ {
                    params: ``, msg: `No user found`, value: ``
                } ],
                message: `No user found`
            } );
        } else {
            return res.status(200).json( {
                error: false,
                data: results[0][0],
                message: `${results[0].length} result(s) found`
            } );
        }
    } );
} );



router.put( `/section`, (req, res) => {
    var con = req.con;
    var logger = req.logger;

    let userID = req.body.userID;
    let section = req.body.section;
    
    if( ! userID )
        return res.status(400).json( {
            error: true,
            data: [ {
                param: ``,
                msg: `Missing required parameter: userID`,
                value: ``
            } ],
            message: `Missing required parameter: userID`
        } );
    else if( ! section )
        return res.status(400).json( {
            error: true,
            data: [ {
                param: ``,
                msg: `Missing required parameter: section`,
                value: ``
            } ],
            message: `Missing required parameter: section`
        } );
    else if( section < 1 || section > 6 )
        return res.status(400).json( {
            error: true,
            data: [ {
                param: ``,
                msg: `Invalid parameter: section`,
                value: ``
            } ],
            message: `Invalid parameter: section`
        } );

    async.waterfall( [
        (callback) => {
            var sql = `SELECT
                            tbl_user_settings.*
                        FROM
                            tbl_user
                        INNER JOIN
                            tbl_user_settings ON tbl_user.ID = tbl_user_settings.userID
                        WHERE
                            tbl_user.ID = ?`,
                sqlParams = [userID];
            con.query( sql, sqlParams, (error, results) => {
                callback( error, results );
            } );
        },
        (results, callback) => {
            if( ! results[0] || results[0].length === 0 ) {
                return res.status(404).json( {
                    error: true,
                    data: [ {
                        params: ``, msg: `No user found`, value: ``
                    } ],
                    message: `No user found`
                } );
            } else {
                var sql = `UPDATE
                            tbl_user_settings
                        SET
                            tbl_user_settings.section = ?
                        WHERE
                            tbl_user_settings.userID = ?`,
                    sqlParams = [section, userID];
                con.query( sql, sqlParams, (error, results) => {
                    callback( error, results );
                } );
            }
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

        return res.status(200).json( {
            error: false,
            data: `Default Section updated successfully`,
            message: `${results.affectedRows} row(s) affected`
        } );
    } );
} );



module.exports = router;