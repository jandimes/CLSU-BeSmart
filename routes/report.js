const express = require( `express` );
const async = require( `async` );
const router = express.Router();



// Routes
router.post( `/generate`, ( req, res ) => {
    var con = req.con;
    var logger = req.logger;

    var filter = {
        startDate: {
            year: req.body.startDateYear || 1,
            month: req.body.startDateMonth || 1,
            day: req.body.startDateDay || 1
        },
        endDate: {
            year: req.body.endDateYear || 9999,
            month: req.body.endDateMonth || 99,
            day: req.body.endDateDay || 99
        },
        course: req.body.course || ``,
        section: req.body.section || ``,
        gender: req.body.gender || ``,
        addedBy: req.body.addedBy || ``,
        barcode: req.body.barcode || ``
    };
  
    async.parallel(
        [
            (callback) => {

                // PREPARE WHERE CLAUSES
                    var courseClause = ``,
                        courses = filter.course.split( `, ` );
                    for( var i = 0; i < courses.length; i++ ) {
                        courseClause += `tbl_patrons_basic.course LIKE "%${courses[i]}%" `;
                        if( i != ( courses.length - 1 ) )
                            courseClause += `OR `;
                    }

                    var sectionClause = ``,
                        sections = filter.section.split( `, ` );
                    for( var i = 0; i < sections.length; i++ ) {
                        sectionClause += `tbl_attendance.section LIKE "%${sections[i]}%" `;
                        if( i != ( sections.length - 1 ) )
                            sectionClause += `OR `;
                    }

                    var genderClause = ``,
                        genders = filter.gender.split( `, ` );
                    for( var i = 0; i < genders.length; i++ ) {
                        genderClause += `tbl_patrons_basic.gender LIKE "%${genders[i]}%" `;
                        if( i != ( genders.length - 1 ) )
                            genderClause += `OR `;
                    }

                    var addedByClause = ``,
                        addedBys = filter.addedBy.split( `, ` );
                    for( var i = 0; i < addedBys.length; i++ ) {
                        addedByClause += `tbl_attendance.addedBy LIKE "%${addedBys[i]}%" `;
                        if( i != ( addedBys.length - 1 ) )
                            addedByClause += `OR `;
                    }

                    var barcodeClause = ``,
                        barcodes = filter.barcode.split( `, ` );
                    for( var i = 0; i < barcodes.length; i++ ) {
                        barcodeClause += `tbl_patrons_basic.barcode LIKE "%${barcodes[i]}%" `;
                        if( i != ( barcodes.length - 1 ) )
                            barcodeClause += `OR `;
                    }

                var sql = `
                        SELECT
                            SUBSTR( tbl_attendance.date, 1, 4 ) AS year,
                            SUBSTR( tbl_attendance.date, 6, 2) AS month,
                            SUBSTR( tbl_attendance.date, 9, 2) AS day,
                            tbl_patrons_basic.barcode,
                            tbl_patrons_basic.course,
                            tbl_attendance.section,
                            tbl_patrons_basic.gender,
                            tbl_attendance.addedBy,
                            tbl_user.username AS addedByUsername,
                            
                            (
                                ( ( SUBSTR( tbl_attendance.timeOut, 1, 2 ) * 60 * 60 ) + ( SUBSTR( tbl_attendance.timeOut, 4, 2 ) * 60 ) + SUBSTR( tbl_attendance.timeOut, 7, 2 ) )/60
                                -
                                ( ( SUBSTR( tbl_attendance.timeIn, 1, 2 ) * 60 * 60 ) + ( SUBSTR( tbl_attendance.timeIn, 4, 2 ) * 60 ) + SUBSTR( tbl_attendance.timeIn, 7, 2 ) )/60
                            )    
                            AS readingTime
                        FROM
                            tbl_attendance
                        INNER JOIN
                            tbl_patrons_basic ON tbl_patrons_basic.barcode = tbl_attendance.barcode
                        INNER JOIN
                            tbl_user ON tbl_user.ID = tbl_attendance.addedBy
                            
                        WHERE
                            (
                                tbl_attendance.timeIn != "" AND tbl_attendance.timeOut != ""
                            ) AND
                            
                            (
                                SUBSTR( tbl_attendance.date, 1, 10 ) >= "${filter.startDate.year}-${filter.startDate.month}-${filter.startDate.day}" AND
                                SUBSTR( tbl_attendance.date, 1, 10 ) <= "${filter.endDate.year}-${filter.endDate.month}-${filter.endDate.day}"
                            ) AND
                            
                            (
                                ${courseClause}
                            ) AND
                            
                            (
                                ${sectionClause}
                            ) AND
                            
                            (
                                ${genderClause}
                            ) AND
                            
                            (
                                ${addedByClause}
                            ) AND

                            (
                                ${barcodeClause}
                            )
                            
                        ORDER BY
                            tbl_attendance.date ASC,
                            tbl_patrons_basic.course ASC,
                            tbl_attendance.section ASC,
                            tbl_patrons_basic.gender ASC,
                            tbl_attendance.addedBy ASC,
                            tbl_patrons_basic.barcode ASC
                    `;  
                    
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

            return res.status(200).json( {
                error: false,
                data: results[0],
                message: `${results[0].length} result(s) found`
            } );
        }
    );
} );



router.get( `/filters`, ( req, res ) => {
    var con = req.con;
    var logger = req.logger;

    var filter = {
        course: [],
        section: [],
        gender: [],
        addedBy: []
    };
    
    async.parallel(
        [
            (callback) => {
                var sql = `
                    SELECT DISTINCT
                        tbl_patrons_basic.course
                    FROM
                        tbl_patrons_basic
                    ORDER BY
                        tbl_patrons_basic.course ASC`,
                    sqlParams = [];
                con.query( sql, sqlParams, (error, results) => {
                    callback(error, results);
                } );
            },
            (callback) => {
                var sql = `
                    SELECT DISTINCT
                        tbl_patrons_basic.gender
                    FROM
                        tbl_patrons_basic
                    ORDER BY
                        tbl_patrons_basic.gender ASC`,
                    sqlParams = [];
                con.query( sql, sqlParams, (error, results) => {
                    callback(error, results);
                } );
            },
            (callback) => {
                var sql = `
                    SELECT DISTINCT
                        tbl_user.ID,
                        tbl_user.username
                    FROM
                        tbl_user
                    ORDER BY
                        tbl_user.ID ASC`,
                    sqlParams = [];
                con.query( sql, sqlParams, (error, results) => {
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

            // Course
            results[0].forEach( value => {
                filter.course.push( value.course );
            } );

            // Gender
            results[1].forEach( value => {
                filter.gender.push( value.gender );
            } );

            // AddedBy
            results[2].forEach( value => {
                filter.addedBy.push( 
                    {
                        ID: value.ID,
                        username: value.username
                    }
                );
            } );

            filter.section = [ 1, 2, 3, 4, 5, 6, 7 ];

            return res.status(200).json( {
                error: false,
                data: filter
            } );
        }
    );
} );



module.exports = router;