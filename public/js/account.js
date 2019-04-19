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



// GET USER DATA
var getUsersData = () => {
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
                    2: `<span class="badge mr-2"><h4><i class="pe-7s-${(user.accessLevel != "administrator") ? "delete":"add"}-user"></i></h4></span>`+ user.accessLevel.toUpperCase(),
                    3: `<button type="button" id="${user.ID}"` +
                        ( (`${user.accessLevel}` != "administrator") ? ` onclick="promoteUser(${user.ID});" class="promote btn btn-info" style="margin: 0px 15px;width: 89.67px;">Promote`:` onclick="demoteUser(${user.ID});" class="demote btn btn-warning" style="margin: 0px 15px;"> Demote ` ) +
                        `</button>` +
                        `<button type="button" class="btn btn-danger" onclick="deactivateUser(${user.ID});">Deactivate</button>`
                  } ).draw();
            } );
    });
};



// MY FUNCTIONS
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



getUsersData();