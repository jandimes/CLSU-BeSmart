const fs = require('fs');
const express = require("express");
const mysql = require("mysql2");
const path = require("path");
const async = require("async");

const router = express.Router();
const http = require("http");

router.get( "/update" , function ( req, res ) {

    var mc = req.con;
    const directoryPath = path.join ( __dirname, '../backups/' );
    
    
    //passsing directoryPath and callback function
    fs.readdir( directoryPath, function ( err, files ) {

        //handling error
        if ( err ) {
            return console.log('Unable to scan directory: ' + err);
        }

        //getlatestfile
        var crw = null,
            extract = null,
            a = 0;
        
        for ( a = 0 ; a < files.length ; a++ ) {

            if ( files[ a ].includes( 'CRW' ) ) {
                crw = a;
            }

            if ( files[ a ].includes( 'Extract' ) ) {
                extract = a;
            }
        }

        async.parallel ( [
        ( callback ) => {
                if ( extract != null ) {
                    var fileToImport = files[extract];
                    var xmlData = fs.readFileSync(directoryPath + fileToImport, 'utf8');

                    const transform = require('camaro');
                    const template = {
                        generated: '/PatronInfo/@generated',
                        patrons: ['//Patron', {
                            basic: {
                                barcode: 'PatronBarcode',
                                status: 'Status',
                                lastName: 'LastName',
                                firstName: 'FirstName',
                                middleName: 'MiddleName',
                                gender: 'Gender',
                                course: 'PatronTypeDescription',
                                cellphoneNumber: 'CellphoneNumber',
                            },
                            library: {
                                barcode: 'PatronBarcode',
                                accessLevel: 'AccessLevel',
                                assetItems: {
                                    out: 'number(AssetItemsOut)',
                                    overdue: 'number(AssetItemsOverdue)'
                                },
                                textbookItems: {
                                    out: 'number(TextbookItemsOut)',
                                    overdue: 'number(TextbookItemsOverdue)'
                                },
                                libraryItems: {
                                    out: 'number(LibraryItemsOut)',
                                    overdue: 'number(LibraryItemsOverdue)'
                                },
                                mediaItems: {
                                    out: 'number(MediaItemsOut)',
                                    overdue: 'number(MediaItemsOverdue)'
                                },
                                libraryHolds: 'number(LibraryHolds)',
                                mediaBookings: 'number(MediaBookings)',
                                fines: {
                                    library: 'LibraryFinesAmount',
                                    textbook: 'TextbookFinesAmount',
                                    other: 'OtherFinesAmount'
                                }
                            }
                } ]
                    };

                    const result = transform ( xmlData, template );

                    if ( Date.parse( result[ 'generated' ] ) <= Date.now ( ) ) {

                        async.parallel ( [
                            ( callback ) => {
                                        let sql = `TRUNCATE tbl_patrons_basic`;
                                        mc.query ( sql, [ ], ( error, results ) => {
                                            console.log( `${sql} successful...` );
                                            callback ( error, results );
                                        } );
                            },
                            ( callback ) => {
                                        let sql = `TRUNCATE tbl_patrons_library`;
                                        mc.query ( sql, [ ], ( error, results ) => {
                                            console.log( `${sql} successful...` );
                                            callback ( error, results );
                                        } );
                            },
                            ( callback ) => {
                                        for ( var patron of result [ 'patrons' ] ) {
                                            let sql = `INSERT INTO tbl_patrons_library ( accessLevel, assetItemsOut, assetItemsOverdue, textbookItemsOut, textbookItemsOverdue, libraryItemsOut, libraryItemsOverdue, mediaItemsOut, mediaItemsOverdue, libraryHolds, mediaBookings, libraryFines, textbookFines, otherFines ) VALUES ( ? ,? ,? ,? ,? ,? ,? ,? ,? ,? ,? ,? ,? ,? )`,
                                                sqlParams = [ patron.library.accessLevel, patron.library.assetItems.out, patron.library.assetItems.overdue, patron.library.textbookItems.out, patron.library.textbookItems.overdue, patron.library.libraryItems.out, patron.library.libraryItems.overdue, patron.library.mediaItems.out, patron.library.mediaItems.overdue, patron.library.libraryHolds, patron.library.mediaBookings, patron.library.fines.library, patron.library.fines.textbook, patron.library.fines.other ];
                                            mc.query ( sql, sqlParams, ( error, results ) => {
                                                if ( error )
                                                    callback ( error, results );
                                            } );
                                        }
                            },
                            ( callback ) => {
                                        for ( var patron of result [ 'patrons' ] ) {
                                            let sql = `INSERT INTO tbl_patrons_basic ( barcode, status, lastName, firstName, middleName, gender, course, cellphoneNumber ) VALUES ( ? ,? ,? ,? ,? ,? ,? ,? )`,
                                                sqlParams = [ patron.basic.barcode, patron.basic.status, patron.basic.lastName, patron.basic.firstName, patron.basic.middleName, patron.basic.gender, patron.basic.course, patron.basic.cellphoneNumber ];
                                            mc.query ( sql, sqlParams, ( error, results ) => {
                                                if ( error )
                                                    callback ( error, results );
                                            } );
                                        }
                            } 
                        ], ( error, results ) => {
                            if ( error )
                                console.log( error );

                            console.log( results );
                        } );

                    }
                }
        },
        ( callback ) => {
                if ( crw != null ) {
                    var fileToImport = files[crw];
                    var xmlData = fs.readFileSync( directoryPath + fileToImport, 'utf8' );

                    const transform1 = require( 'camaro' );
                    const template1 = {
                        patrons: [ '//Row', {
                            info: {
                                nameLast: 'nameLast',
                                nameFirst: 'nameFirst',
                                dateDue: 'dateDue'
                            }
                        } ]
                    };

                    const result = transform1 ( xmlData, template1 );

                    if ( result [ 'patrons' ] != null ) {

                        for ( var patron of result [ 'patrons' ] ) {
                            let sql = `UPDATE tbl_patrons_library, tbl_patrons_basic SET tbl_patrons_library.dateDue = ? WHERE tbl_patrons_library.ID = tbl_patrons_basic.ID and tbl_patrons_basic.firstName = ? and tbl_patrons_basic.lastName = ?`,
                                sqlParams = [ patron.info.dateDue, patron.info.nameFirst, patron.info.nameLast ];
                            mc.query ( sql, sqlParams, ( error, result ) => {
                                if ( error )
                                    callback ( error, result );
                            } );
                        }
                    }
                }
        },
        ], ( error, results ) => {
            if ( error )
                console.log( error );

            console.log( results );
        } );

    } );

    return res.redirect( '/' );
} );

module.exports = router;