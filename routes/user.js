const express = require( `express` );
const async = require( `async` );
const passport = require( `passport` );
const router = express.Router();



// PAGES
router.get( `/register`, (req, res) => {
    res.render( `pages/index` );
} );
router.get( `/login`, (req, res) => {
    res.render( `pages/index` );
} );

// Routes
router.get( `/`, ( req, res ) => {
    var con = req.con;
    var logger = req.logger;
  
    async.parallel(
        [
            (callback) => {
                con.query( `SELECT * FROM tbl_user WHERE isActive=true ORDER BY ID ASC`, (error, results) => {
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



router.get( `/logout`, (req, res) => {
  req.logout();
  res.redirect( `/` );
});

router.put( `/deactivate/:id`, (req, res) => {
    var con = req.con;
    var logger = req.logger;

    let id = req.params.id;

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
            con.query( `UPDATE tbl_user SET isActive=false WHERE id = ?`, id, (error, results) => {
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
                    params: ``, msg: `No user found`, value: ``
                } ],
                message: `No user found`
            } );
        } else {
            return res.status(200).json( {
                error: false,
                data: results[0],
                message: `User deactivated successfully`
            } );
        }
    } );
} );

router.put( `/promote`, (req, res) => {
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
            con.query( `UPDATE tbl_user SET accessLevel = 'administrator' WHERE id = ?`, [id], (error, results) => {
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
                    params: ``, msg: `No user found`, value: ``
                } ],
                message: `No user found`
            } );
        } else {
            if( results[0].changedRows === 0 ) {
                return res.status(404).json( {
                    error: true,
                    data: [ {
                        params: ``, msg: `Promotion failed. User already has administrator access`, value: ``
                    } ],
                    message: `Promotion failed. User already has administrator access`
                } );
            }
            return res.status(200).json( {
                error: false,
                data: results[0],
                message: `User promoted successfully`
            } );
        }
    } );
});

router.put( `/demote`, (req, res) => {
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
            con.query( `UPDATE tbl_user SET accessLevel = 'user' WHERE id = ?`, [id], (error, results) => {
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
                    params: ``, msg: `No user found`, value: ``
                } ],
                message: `No user found`
            } );
        } else {
            if( results[0].changedRows === 0 ) {
                return res.status(404).json( {
                    error: true,
                    data: [ {
                        params: ``, msg: `Demotion failed. User already has user access`, value: ``
                    } ],
                    message: `Demotion failed. User already has user access`
                } );
            }
            return res.status(200).json( {
                error: false,
                data: results[0],
                message: `User demoted successfully`
            } );
        }
    } );    
});

router.get( `/:id/settings`, (req, res) => {
    var con = req.con;
    var logger = req.logger;

    let id = req.params.id;

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
            con.query( `SELECT tbl_user_settings.* FROM tbl_user INNER JOIN tbl_user_settings ON tbl_user.ID=tbl_user_settings.userID WHERE tbl_user.ID=?`, [id], (error, results) => {
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



// LOGIN PROCESS
router.post( `/login`, (req, res, next) => {
    var con = req.con;
    var logger = req.logger;

    var user = {
        username: req.body.username,
        password: req.body.password
    }

    req.checkBody( `username`, `Username is required` ).notEmpty();
    req.checkBody( `password`, `Password is required` ).notEmpty();

    let errors = req.validationErrors();    
    if( errors ){
        return res.status(400).json( {
            error: true,
            data: errors,
            message: errors
        } );
    }
  
    async.parallel(
        [
            (callback) => {
                con.query( `SELECT ID, username, password, accessLevel FROM tbl_user WHERE username=? AND isActive=true`, [user.username], (error, results) => {
                    callback(error, results[0]);
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
                return res.status(400).json( {
                    error: true,
                    data: [ {
                        param: ``,
                        msg: `User with username of '${user.username}' does not exist`,
                        value: ``
                    } ],
                    message: `User with username of '${user.username}' does not exist`
                } );
            } else if( user.password != results[0].password ) {
                return res.status(400).json( {
                    error: true,
                    data: [ {
                        param: ``,
                        msg: `Wrong password`,
                        value: ``
                    } ],
                    message: `Wrong password`
                } );
            } else if( results[0].accessLevel != `administrator` ) {
                return res.status(400).json( {
                    error: true,
                    data: [ {
                        param: ``,
                        msg: `User is not an admin account`,
                        value: ``
                    } ],
                    message: `User is not an admin account`
                } );
            } else {
                passport.authenticate( `local`, (error, user) => {
                    if (error) {
                        logger.error( error );
                        return res.status(500).json( {
                            error: true,
                            data: [ {
                                param: ``,
                                msg: `Authentication error. Please try again later`,
                                value: ``
                            } ],
                            message: `Authentication error. Please try again later`
                        } );
                    }
                    
                    if ( ! user ) {
                        return res.redirect(`/`);
                    }

                    req.logIn( user, (error) => {
                        if (error) {
                            logger.error( error );
                            return res.status(500).json( {
                                error: true,
                                data: [ {
                                    param: ``,
                                    msg: `Authentication error. Please try again later`,
                                    value: ``
                                } ],
                                message: `Authentication error. Please try again later`
                            } );
                        }
                        return res.json( {
                            error: false,
                            data: {
                                ID: user.ID,
                                username: user.username,
                                accessLevel: user.accessLevel,
                                email: user.email
                            },
                            message: `Welcome, ${user.username}!`
                        } );
                    });                 
                })(req, res, next);                
            }

        }
    );
} );



// REGISTER PROCESS
router.post( `/register`, (req, res, next) => {
    var con = req.con;
    var logger = req.logger;

    var user = {
        username: req.body.username,
        password: req.body.password,
        password2: req.body.password2,
        email: req.body.email
    }

    req.checkBody( `email`, `Email is required` ).notEmpty();
    req.checkBody( `email`, `Email is not valid` ).isEmail();
    req.checkBody( `username`, `Username is required` ).notEmpty();
    req.checkBody( `password`, `Password is required` ).notEmpty();
    req.checkBody( `password2`, `Password is required` ).notEmpty();
    req.checkBody( `password2`, `Passwords do not match` ).equals( req.body.password );

    let errors = req.validationErrors();
    if( errors ){
        return res.status(400).json( {
            error: true,
            data: errors,
            message: errors
        } );
    }
  
    async.parallel(
        [
            (callback) => {
                con.query( `SELECT ID, username, password, accessLevel FROM tbl_user WHERE username=?`, [user.username], (error, results) => {
                    callback(error, results[0]);
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

            if( results[0] ) {
                return res.status(400).json( {
                    error: true,
                    data: [ {
                        param: ``,
                        msg: `Username is already taken`,
                        value: ``
                    } ],
                    message: `Username is already taken`
                } );
            } else {
                var sql = `INSERT INTO tbl_user(username, password, email, accessLevel) VALUES (?, ?, ?, 'user')`,
                    sqlParams = [user.username, user.password, user.email];
                con.query( sql, sqlParams, (error, results) => {
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
                    else {
                        var sql = `INSERT INTO tbl_user_settings(userID, section) VALUES ( ?, 1 )`,
                            sqlParams = [results.insertId];

                        con.query( sql, sqlParams, (error, results) => {
                            passport.authenticate( `local`, (error, user) => {
                                if (error) {
                                    logger.error( error );
                                    return res.status(500).json( {
                                        error: true,
                                        data: [ {
                                            param: ``,
                                            msg: `Authentication error. Please try again later`,
                                            value: ``
                                        } ],
                                        message: `Authentication error. Please try again later`
                                    } );
                                }

                                if ( ! user ) {
                                    return res.redirect(`/`);
                                }
                                
                                req.logIn( user, (error) => {
                                    if (error) {
                                        logger.error( error );
                                        return res.status(500).json( {
                                            error: true,
                                            data: [ {
                                                param: ``,
                                                msg: `Authentication error. Please try again later`,
                                                value: ``
                                            } ],
                                            message: `Authentication error. Please try again later`
                                        } );
                                    }

                                    return res.json( {
                                        error: false,
                                        data: {
                                            ID: user.ID,
                                            username: user.username,
                                            accessLevel: user.accessLevel,
                                            email: user.email
                                        },
                                        message: `Account registered successfully. Please wait for admin approval to login`
                                    } );
                                });                 
                            })(req, res, next);
                        } );                        
                    }
                } );

            }

        }
    );
} );

router.post( `/retype-password`, ( req, res ) => {

    var con = req.con;
    var logger = req.logger;

    let id = req.body.id,
        password = req.body.password;
    if( ! id ) {
        return res.status(400).json( {
            error: true,
            data: [ {
                param: ``,
                msg: `No ID provided`,
                value: ``
            } ]
        } );
    }
    if( ! password ) {
        return res.status(400).json( {
            error: true,
            data: [ {
                param: ``,
                msg: `No password provided`,
                value: ``
            } ]
        } );
    }

    async.parallel( [
        (callback) => {
            var sql = `
                SELECT
                    password
                FROM
                    tbl_user
                WHERE
                    id = ?`,
                sqlParams = [ id ];
            con.query( sql, sqlParams, (error, results) => {
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

        if( results[0].length < 1 ) {
            return res.status(404).json( {
                error: true,
                data: [ {
                    params: ``, msg: `No user found`, value: ``
                } ],
                message: `No user found`
            } );
        } else {
            if( results[0][0].password != password ) {
                return res.status(400).json( {
                    error: true,
                    data: [ {
                        params: ``,
                        msg: `Wrong password`,
                        value: ``
                    } ],
                    message: `Wrong password`
                } );
            }
            return res.status(200).json( {
                error: false,
                data: results[0],
                message: results[0]
            } );
        }
    } );

} );



module.exports = router;