const onload = () => {
  setLastUpdated();
};

const setLastUpdated = () => {
  var settings = {
    "async": true,
    "crossDomain": true,
    "url": "/attendance/last-updated",
    "method": "GET",
    "headers": {
      "cache-control": "no-cache",
      "Postman-Token": "b40974a1-bc96-414b-be1a-cd54b85b85e7"
    }
  }
  $.ajax(settings)      
    .done( (response) => {      
      $(`.last-updated`).text( new Date(response.data.lastUpdated).toDateString() );
    })
    .fail( (response) => {
      let responseObj = response.responseJSON;
      if( responseObj.error )
          notify( responseObj.data, `danger` );
    } );
};



onload();



// EVENT LISTENERS
$(`#search-barcode`).on( `keyup`, (e) => {

  var barcode = e.currentTarget.value.trim();
  if( barcode.length == 0 ) {
    $(`#search-results`).hide();
    return;
  }

  var settings = {
    "async": true,
    "crossDomain": true,
    "url": "/patrons/all/" + barcode,
    "method": "GET",
    "headers": {
      "Content-Type": "application/x-www-form-urlencoded",
      "cache-control": "no-cache",
      "Postman-Token": "8d81bbe6-d4a3-4260-b209-b4a50e319292"
    },
    "success": (response) => {    
      if( response.error ) {
        notify( response.message, `danger` );
        return;
      } else {
        var patron = response.data[0];
        var count = response.count;
        var message = response.message;

        if( count == 0 ) {
          $(`#search-results`).hide();
        } else {
          $(`#search-results`).show();

          // BASIC
          if( patron.basic.gender )
            $(`#search-results #avatar-image`).attr(`src`, `./images/avatar-${patron.basic.gender}.svg`);
          else
            $(`#search-results #avatar-image`).attr(`src`, `./images/logo.svg`);

          $(`#search-results #full-name`).html( `${patron.basic.lastName}, ${patron.basic.firstName} ${patron.basic.middleName}` );
          $(`#search-results #status`).html( patron.basic.status );
          $(`#search-results #barcode`).html( patron.basic.barcode );
          $(`#search-results #course`).html( patron.basic.course );

          if( patron.basic.status == `Active` ) {
            $(`#search-results #status`).parent().removeClass(`list-group-item-danger`);
            $(`#search-results #status`).parent().addClass(`list-group-item-success`);
          } else if( patron.basic.status == `Inactive` ) {
            $(`#search-results #status`).parent().removeClass(`list-group-item-success`);
            $(`#search-results #status`).parent().addClass(`list-group-item-danger`);
          }

          // LIBRARY
          $(`#search-results #access-level`).html( `${patron.library.accessLevel}` );

          $(`#search-results #asset-items-out`).html( `${patron.library.assetItems.out}` );
          $(`#search-results #asset-items-overdue`).html( `${patron.library.assetItems.overdue}` );
          $(`#search-results #textbook-items-out`).html( `${patron.library.textbookItems.out}` );
          $(`#search-results #textbook-items-overdue`).html( `${patron.library.textbookItems.overdue}` );
          $(`#search-results #library-items-out`).html( `${patron.library.libraryItems.out}` );
          $(`#search-results #library-items-overdue`).html( `${patron.library.libraryItems.overdue}` );
          $(`#search-results #media-items-out`).html( `${patron.library.mediaItems.out}` );
          $(`#search-results #media-items-overdue`).html( `${patron.library.mediaItems.overdue}` );

          $(`#search-results #fines-library`).html( `${Number(patron.library.fines.library)}` );
          $(`#search-results #fines-textbook`).html( `${Number(patron.library.fines.textbook)}` );
          $(`#search-results #fines-other`).html( `${Number(patron.library.fines.other)}` );

          $(`#search-results #library-holds`).html( `${Number(patron.library.libraryHolds)}` );
          $(`#search-results #media-bookings`).html( `${Number(patron.library.mediaBookings)}` );
          
          getAttendanceSummary();
        }
      }
    }
  }
  
  $.ajax(settings).done(function (response) {
    // console.log( response );
  });



  // ATTENDANCE SUMMARY
  var getAttendanceSummary = () => {
    var settings = {
      "async": true,
      "crossDomain": true,
      "url": "/attendance/" + barcode,
      "method": "GET",
      "headers": {
        "Content-Type": "application/x-www-form-urlencoded",
        "cache-control": "no-cache",
        "Postman-Token": "db46f0d2-49c2-48d4-95f7-086fe5beb87c"
      },
      "success": (response) => {
        var dataTable = $(`#tblAttendance`).DataTable();
          dataTable.clear().draw();

          $.each( response.data, ( i, attendance ) => {
            dataTable.row.add( {
              0: attendance.date.split(`T`)[0],
              1: attendance.timeIn,
              2: attendance.timeOut,
              3: getLibrarySection( attendance.section )
            } ).draw();
          } );
      }
    }
    
    $.ajax(settings).done(function (response) {
      // console.log(response.data);
    });
  };

} );



  // SEARCH SUGGESTIONS SNIPPET  
  // $(`#search-barcode`).click(function (event) {
  //     $(`.instant-results`).fadeIn(`slow`).css(`height`, `auto`);
  //     event.stopPropagation();
  // });

  // $(`body`).click(function () {
  //     $(`.instant-results`).fadeOut(`500`);
  // });



// MY FUNCTIONS
var notify = ( message, type ) => {
  var icon = `pe-7s-` + ((type==`success`) ? `smile`:`close-circle`);

  var showMsg = ( message ) => {
      $.notify( {
          icon: icon,
          message: message
      }, {
          type: type,
          timer: 1000
      } );
  }

  if( typeof message == `object` ) {
      (message).forEach( error => {
          showMsg( error.msg );
      });
  } else {
      showMsg( message );
  }
};

var getLibrarySection = ( index ) => {
  var sections = [ `Filipiniana`, `Humanities`, `Multimedia`, `Reference`, `Science & Technology`, `Technical` ];
  return sections[ (index-1) ];
};