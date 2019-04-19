var pathName = window.location.pathname.slice(1);

if(pathName) {
    // SIDEBAR
    $(`#${pathName}`).addClass(`active`);

    // BREADCRUMB
    var breadcrumbItem = document.createElement(`li`);
        breadcrumbItem.textContent = pathName.toUpperCase();
        breadcrumbItem.className = `breadcrumb-item active`;
    $(`ol.breadcrumb`).append( breadcrumbItem );
}

// USER INFO
if( pathName != `` ) {
    let loggedUser = JSON.parse( localStorage.getItem(`loggedUser`) );
    $(`#user-info-username`).text( loggedUser.username );
    $(`#user-info-email`).text( loggedUser.email );
}

// LOGOUT LISTENER
$(`#btnLogout`).on( `click`, (e) => {
    swal( {
        title: "Are you sure you want to logout?",
        type: "warning",
        showCancelButton: true,
        confirmButtonClass: "btn-warning",
        confirmButtonText: "Confirm Logout",
        closeOnConfirm: false
    },
    (isConfirmed) => {
        if( isConfirmed ) {
            swal("Logged out!", "User has been logged out.", "success");
            localStorage.removeItem(`loggedUser`);
            localStorage.removeItem(`settings`);

            setTimeout( () => {
                window.location.href = `/users/logout`;
            }, 2000 );
        } else {
            return;
        }
    });
} );