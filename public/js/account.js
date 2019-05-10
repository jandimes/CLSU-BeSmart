const onload = () => {
    authenticateModule();

    setSectionSelection();
    setDefaultSection();
    setDelinquentPatrons();

    setLastUpdated();

    $(`[data-toggle="tooltip"]`).tooltip();
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

const setSectionSelection = () => {
    var selectEl = $(`select[name="section"]`);
    SECTIONS.forEach( ( section, i ) => {
      var optionEl = document.createElement(`option`);
        optionEl.value = (i + 1);
        optionEl.innerHTML = section;

      selectEl.append( optionEl );
    } );
  }



// DEFAULT SECTION
const setDefaultSection = () => {
let userID = JSON.parse( localStorage.getItem(`settings`) ).userID;

var settings = {
    "async": true,
    "crossDomain": true,
    "url": `/user-settings?userID=${userID}`,
    "method": "GET",
    "headers": {
        "cache-control": "no-cache",
        "Postman-Token": "a21b3e1d-1f8b-41c7-8095-1bf003ea25fd"
    }
    }
    
    $.ajax(settings)      
    .done( (response) => {  
        document.forms[`frmUserSettings`][`section`].value = response.data.section;    
    })
    .fail( (response) => {
        let responseObj = response.responseJSON;
        if( responseObj.error )
            notify( responseObj.data, `danger` );
    } );    
};



const setDelinquentPatrons = () => {
    var settings = {
        "async": true,
        "crossDomain": true,
        "url": "/patrons/delinquents",
        "method": "GET",
        "headers": {
            "cache-control": "no-cache",
            "Postman-Token": "4781b6a9-c549-4f7e-a23f-c4dbcec83ee1"
        }
    }
    
    $.ajax(settings).done(function (response) {              
        var dataTable = $('#tblDelinquents').DataTable();    
            dataTable.clear().draw();
        
            $.each( response.data, ( i, patron ) => {
                dataTable.row.add( {
                    0: patron.barcode,
                    1: `${patron.lastName}, ${patron.firstName} ${patron.middleName}`,
                    2: patron.gender,
                    3: patron.course
                  } ).draw();
            } );
    });
};



onload();



// GET USER DATA
const getUsersData = () => {
    var settings = {
        "async": true,
        "crossDomain": true,
        "url": "/users",
        "method": "GET",
        "headers": {
            "cache-control": "no-cache",
            "Postman-Token": "4781b6a9-c549-4f7e-a23f-c4dbcec83ee1"
        }
    }
    
    $.ajax(settings).done(function (response) {        
        var dataTable = $('#tblUsers').DataTable();    
            dataTable.clear().draw();
        
            $.each( response.data, ( i, user ) => {
                dataTable.row.add( {
                    0: user.username,
                    1: user.email,
                    2: `<span class="badge mr-2" style="font-size:20px;">
                            <i class="pe-7s-${(user.accessLevel != "administrator") ? "delete":"add"}-user"></i>
                        </span>` + user.accessLevel.toUpperCase(),
                    3: `<button type="button" id="${user.ID}"` +
                        ( (`${user.accessLevel}` != "administrator") ? ` onclick="promoteUser(${user.ID});" class="promote btn btn-info" style="margin: 0px 15px;width: 89.67px;">Promote`:` onclick="demoteUser(${user.ID});" class="demote btn btn-warning" style="margin: 0px 15px;"> Demote ` ) +
                        `</button>` +
                        `<button type="button" class="btn btn-danger" onclick="deactivateUser(${user.ID});">Deactivate</button>`
                  } ).draw();
            } );
    });
};



// MY FUNCTIONS
const notify = ( message, type ) => {
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

function promoteUser(id){
    swal({
        title: "Are you sure you want to promote this user?",
        type: "info",
        showCancelButton: true,
        confirmButtonClass: "btn-info",
        confirmButtonText: "Yes, promote user!",
        closeOnConfirm: false
    },
    function(isConfirmed){
        if( isConfirmed ) {
            var params = "id="+id;
            var xmlhttp = new XMLHttpRequest();	
            xmlhttp.open("PUT", "/users/promote", true);
            xmlhttp.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
            xmlhttp.onreadystatechange = function() {
                if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
                    document.getElementById(id).classList = "demote btn btn-warning";
                    document.getElementById(id).innerHTML = "Demote";
                    document.getElementById(id).setAttribute("onClick", "demoteUser("+id+");");
                }
            };
            xmlhttp.send(params);

            swal("Promoted!", "User has been promoted.", "success");
            getUsersData();
        } else {
            return;
        }
    });
}

function demoteUser(id){
    swal({
        title: "Are you sure you want to demote this user?",
        type: "warning",
        showCancelButton: true,
        confirmButtonClass: "btn-warning",
        confirmButtonText: "Yes, demote user!",
        closeOnConfirm: false
    },
    function(isConfirmed){
        if( isConfirmed ) {
            var params = "id="+id;
            var xmlhttp = new XMLHttpRequest();	
            xmlhttp.open("PUT", "/users/demote", true);
            xmlhttp.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
            xmlhttp.onreadystatechange = function() {
                if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
                    swal("Demoted!", "User has been demoted.", "success");
                    getUsersData();
                }
            };
            xmlhttp.send(params);
        } else {
            return;
        }
    });
}

function deactivateUser(id){
    swal({
        title: "Are you sure you want to deactivate this user?",
        type: "error",
        showCancelButton: true,
        confirmButtonClass: "btn-danger",
        confirmButtonText: "Yes, deactivate user!",
        closeOnConfirm: false
    },
    function(isConfirmed){
        if( isConfirmed ) {
            var xmlhttp = new XMLHttpRequest();	
            xmlhttp.open("PUT", "/users/deactivate/"+id, true);
            xmlhttp.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
            xmlhttp.onreadystatechange = function() {
                if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
                    // alert(this.offsetParent.tagName);
                    swal("Deactivated!", "User has been deactivated.", "success");
                    getUsersData();
                }
            };
            xmlhttp.send();            
        } else {
            return;
        }
    });
}

// EVENT LISTENERS
$(`form[name="frmUserSettings"] select[name="section"]`).on( `change`, (e) => {
    var userID = JSON.parse( localStorage.getItem(`settings`) ).userID;
    
    var settings = {
        "async": true,
        "crossDomain": true,
        "url": "/user-settings/section",
        "method": "PUT",
        "headers": {
            "Content-Type": "application/x-www-form-urlencoded",
            "cache-control": "no-cache",
            "Postman-Token": "6c0b64c7-f6c1-4bef-b737-dbdde059f034"
        },
        "data": {
            "userID": userID,
            "section": e.currentTarget.value
        }
    }

    $.ajax(settings)      
        .done( (response) => {  
            notify( response.data, `success` );
        })
        .fail( (response) => {
            let responseObj = response.responseJSON;
            if( responseObj.error )
                notify( responseObj.data, `danger` );
        } );
} );



getUsersData();