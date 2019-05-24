const onload = () => {
    // authenticateModule();

    setSectionSelection();
    setDefaultSection();
    setReportFiltersSelection();
    setDelinquentPatrons();

    setLastUpdated();

    $(`[data-toggle="tooltip"]`).tooltip();
  };

// MY FUNC
const toTimeString = ( timeInMinutes ) => {
    return `${Math.floor(timeInMinutes / 60)} hours, ${Math.floor(timeInMinutes % 60)} minutes`;
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
    var selectEl = $(`form[name="frmUserSettings"] select[name="section"]`);
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



// FILTERS SELECTION
const setReportFiltersSelection = () => {

    var frmCustomReport = document.forms[`frmCustomReport`],
        courseEl = frmCustomReport[`course`],
        sectionEl = frmCustomReport[`section`],
        genderEl = frmCustomReport[`gender`],
        addedByEl = frmCustomReport[`addedBy`];
        

        courseEl.innerHTML += `<option value="">All</option>`;
        sectionEl.innerHTML += `<option value="">All</option>`;
        genderEl.innerHTML += `<option value="">All</option>`;
        addedByEl.innerHTML += `<option value="">All</option>`;

    
    var settings = {
        "async": true,
        "crossDomain": true,
        "url": `/reports/filters`,
        "method": "GET",
        "headers": {
            "cache-control": "no-cache",
            "Postman-Token": "a21b3e1d-1f8b-41c7-8095-1bf003ea25fd"
        }
    };
        
    $.ajax(settings)      
        .done( (response) => {  
            
            response[`data`][`course`].forEach( value => {
                courseEl.innerHTML += `<option value="${value}">${value}</option>`;
            } );

            response[`data`][`section`].forEach( value => {
                sectionEl.innerHTML += `<option value="${value}::${SECTIONS[value-1]}">${SECTIONS[value-1]}</option>`;
            } );

            response[`data`][`gender`].forEach( value => {
                genderEl.innerHTML += `<option value="${value}::${( value === "F" ) ? "Female" : ( value === "M" ) ? "Male" : "Undefined"}">${( value === "F" ) ? "Female" : ( value === "M" ) ? "Male" : "Undefined"}</option>`;
            } );

            response[`data`][`addedBy`].forEach( value => {
                addedByEl.innerHTML += `<option value="${value.ID}::${value.username}">${value.username}</option>`;
            } );

        } )
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



$( `form[name="frmCustomReport"] select, form[name="frmCustomReport"] input:not([type="date"])` ).on( `change`, (e) => {    
    
    var filter = $(e.currentTarget).attr(`name`);
    var selectedEl = document.querySelector( `#selected-${filter}` );
    var newValue = (e.currentTarget.value);

    if( e.currentTarget.value == "" ) {
        if( selectedEl.children.length > 0 ){
            swal( {
                title: "Are you sure?",
                text: "This will remove all the other filters.",
                type: "warning",
                showCancelButton: true,
                confirmButtonClass: "btn-danger",
                confirmButtonText: "Yes",
                cancelButtonText: "No",
                closeOnConfirm: true,
                closeOnCancel: true
            },
            function(isConfirm) {
                if (isConfirm) {
                    selectedEl.innerHTML = ``;
                } else {
                    return false;
                }
            } );
        }
    } else {

        // Search if filter is existing
        for( var i = 0; i < selectedEl.children.length; i++ ) {
            if( newValue == $( selectedEl.children[i] ).attr(`data-filter`) )
                return false;
        };
            
        selectedEl.innerHTML += `
            <li class="list-group-item" data-filter="${newValue}">
                ${ ( filter == `section` || filter == `gender` || filter == `addedBy` ) ? newValue.split(`::`)[1] : newValue }
                <button class="btn btn-danger btn-xs btn-fill pull-right">
                    <i class="pe-7s-close"></i>
                </button>
            </li>
        `;

        $( `.selected-filters button` ).off( `click` ).on( `click`, (e) => {
            e.preventDefault();
            e.currentTarget.parentNode.parentNode.removeChild( e.currentTarget.parentNode );
        } );

    }

    if( (e.currentTarget.tagName).toLowerCase() == `input` ) {
        e.preventDefault();
        e.currentTarget.value = null;
    }
} );

$( `.btn-remove-filters` ).on( `click`, (e) => {
    e.preventDefault();
    var filter = $(e.currentTarget).attr(`data-filter`);
    var selectedEl = document.getElementById( `selected-${filter}` ); 

    if( selectedEl.children.length > 0 )
        swal( {
            title: "Are you sure?",
            text: `This will remove all the ${filter} filters.`,
            type: "warning",
            showCancelButton: true,
            confirmButtonClass: "btn-danger",
            confirmButtonText: "Yes",
            cancelButtonText: "No",
            closeOnConfirm: true,
            closeOnCancel: true
        },
        function(isConfirm) {
            if (isConfirm) {
                selectedEl.innerHTML = null;
            } else {
                return false;
            }
        } );

} );

$( `.btn-remove-all-filters` ).on( `click`, (e) => {
    swal( {
        title: "Are you sure?",
        text: `This will remove all the filters.`,
        type: "warning",
        showCancelButton: true,
        confirmButtonClass: "btn-danger",
        confirmButtonText: "Yes",
        cancelButtonText: "No",
        closeOnConfirm: true,
        closeOnCancel: true
    },
    function(isConfirm) {
        if (isConfirm) {
            $( `form[name="frmCustomReport"] select, form[name="frmCustomReport"] input` ).val(null);
            $( `.selected-filters` ).html(null);
        } else {
            return false;
        }
    } );
} );



$( `#btn-generate-report` ).on( `click`, (e) => {
    e.preventDefault();

    var frmCustomReport = document.forms[`frmCustomReport`],
        selectedEl = {
            course: document.getElementById( `selected-course` )
        };

    var filters = {
        startDate: {
            year: frmCustomReport[`startDate`].value.split(`-`)[0] || ``,
            month: frmCustomReport[`startDate`].value.split(`-`)[1] || ``,
            day: frmCustomReport[`startDate`].value.split(`-`)[2] || ``
        },
        endDate: {
            year: frmCustomReport[`endDate`].value.split(`-`)[0] || ``,
            month: frmCustomReport[`endDate`].value.split(`-`)[1] || ``,
            day: frmCustomReport[`endDate`].value.split(`-`)[2] || ``
        },
        course: ``,
        section: ``,
        gender: ``,
        addedBy: ``,
        barcode: ``
    };
    


    Object.keys(filters).forEach( (key, index)  => {
        if( key != `startDate` && key != `endDate` ) {
            var selectedElChildren = $( `#selected-${key}` ).children();
            for( var i = 0; i < selectedElChildren.length; i ++ ) {
                if( key == `course` ) {
                    filters.course += `${$( selectedElChildren[i] ).attr(`data-filter`).split(`::`)[0]}`;
                    if( i < (selectedElChildren.length - 1) )
                        filters.course += `, `;
                } else if( key == `section` ) {
                    filters.section += `${$( selectedElChildren[i] ).attr(`data-filter`).split(`::`)[0]}`;
                    if( i < (selectedElChildren.length - 1) )
                        filters.section += `, `;
                } else if( key == `gender` ) {
                    filters.gender += `${$( selectedElChildren[i] ).attr(`data-filter`).split(`::`)[0]}`;
                    if( i < (selectedElChildren.length - 1) )
                        filters.gender += `, `;
                } else if( key == `addedBy` ) {
                    filters.addedBy += `${$( selectedElChildren[i] ).attr(`data-filter`).split(`::`)[0]}`;
                    if( i < (selectedElChildren.length - 1) )
                        filters.addedBy += `, `;
                } else if( key == `barcode` ) {
                    filters.barcode += `${$( selectedElChildren[i] ).attr(`data-filter`).split(`::`)[0]}`;
                    if( i < (selectedElChildren.length - 1) )
                        filters.barcode += `, `;
                }
            };
        }
    } );
    


    var settings = {
        "async": true,
        "crossDomain": true,
        "url": "/reports/generate",
        "method": "POST",
        "headers": {
          "Content-Type": "application/x-www-form-urlencoded",
          "cache-control": "no-cache",
          "Postman-Token": "64cd409e-e322-4d2f-841e-d526c5c5c28a"
        },
        "data": {
          "startDateYear": filters.startDate.year,
          "startDateMonth": filters.startDate.month,
          "startDateDay": filters.startDate.day,
          "endDateYear": filters.endDate.year,
          "endDateMonth": filters.endDate.month,
          "endDateDay": filters.endDate.day,
          "course": filters.course,
          "section": filters.section,
          "gender": filters.gender,
          "addedBy": filters.addedBy,
          "barcode": filters.barcode
        }
      };
      
      $.ajax(settings).done( (response) => {

          var summary = {
              year: {
                  sum: {
                    attendance: 0,
                    readingTime: 0
                  },
                  average: {
                    attendance: 0,
                    readingTime: 0
                  }
              },
              month: {
                  sum: {
                    attendance: 0,
                    readingTime: 0
                  },
                  average: {
                    attendance: 0,
                    readingTime: 0
                  }
              },
              day: {
                  sum: {
                    attendance: 0,
                    readingTime: 0
                  },
                  average: {
                    attendance: 0,
                    readingTime: 0
                  }
              },
              course: {
                  sum: {
                    attendance: 0,
                    readingTime: 0
                  },
                  average: {
                    attendance: 0,
                    readingTime: 0
                  }
              },
              section: {
                  sum: {
                    attendance: 0,
                    readingTime: 0
                  },
                  average: {
                    attendance: 0,
                    readingTime: 0
                  }
              },
              gender: {
                  sum: {
                    attendance: 0,
                    readingTime: 0
                  },
                  average: {
                    attendance: 0,
                    readingTime: 0
                  }
              },
              addedBy: {
                  sum: {
                    attendance: 0,
                    readingTime: 0
                  },
                  average: {
                    attendance: 0,
                    readingTime: 0
                  }
              }
          };
          
          var years = [],
            months = [],
            days = [],
            courses = [],
            sections = [],
            genders = [],
            addedBys = [];

          var dataTable = $('#tblCustomReportTable').DataTable();    
            dataTable.clear().draw();
        
            $.each( response.data, ( i, result ) => {
                dataTable.row.add( {
                    0: `${result.year}/${result.month}/${result.day}`,
                    1: SECTIONS[ (result.section-1) ],
                    2: result.barcode,
                    3: result.course,
                    4: ( result.gender == `F` ) ? `Female` : ( result.gender == `M` ) ? `Male` : `Undefined`,
                    5: result.addedByUsername
                  } ).draw();
            } );



            // SUMMARY
            
                // GROUP
                $.each( response.data, ( i, result ) => {
                    var isYearIncluded = false;
                    $.each( years, (i, yearObj) => {
                        if( yearObj.year == result.year ) {
                            isYearIncluded = true;
                        }
                    } );

                    if( ! isYearIncluded ) {
                        years.push( {
                            year: result.year,
                            sum: {
                                attendance: 1,
                                readingTime: result.readingTime
                            }
                        } );
                    } else {
                        $.each( years, (i, yearObj) => {
                            if( yearObj.year == result.year ) {
                                years[i].sum.attendance++;
                                years[i].sum.readingTime += result.readingTime;
                            }
                        } );
                    }
                } );


                $.each( response.data, ( i, result ) => {
                    var isMonthIncluded = false;
                    $.each( months, (i, monthObj) => {
                        if( monthObj.month == `${result.year}-${result.month}` ) {
                            isMonthIncluded = true;
                        }
                    } );

                    if( ! isMonthIncluded ) {
                        months.push( {
                            month: `${result.year}-${result.month}`,
                            sum: {
                                attendance: 1,
                                readingTime: result.readingTime
                            }
                        } );
                    } else {
                        $.each( months, (i, monthObj) => {
                            if( monthObj.month == `${result.year}-${result.month}` ) {
                                months[i].sum.attendance++;
                                months[i].sum.readingTime += result.readingTime;
                            }
                        } );
                    }
                } );


                $.each( response.data, ( i, result ) => {
                    var isDayIncluded = false;
                    $.each( days, (i, dayObj) => {
                        if( dayObj.day == `${result.year}-${result.month}-${result.day}` ) {
                            isDayIncluded = true;
                        }
                    } );

                    if( ! isDayIncluded ) {
                        days.push( {
                            day: `${result.year}-${result.month}-${result.day}`,
                            sum: {
                                attendance: 1,
                                readingTime: result.readingTime
                            }
                        } );
                    } else {
                        $.each( days, (i, dayObj) => {
                            if( dayObj.day == `${result.year}-${result.month}-${result.day}` ) {
                                days[i].sum.attendance++;
                                days[i].sum.readingTime += result.readingTime;
                            }
                        } );
                    }
                } );


                $.each( response.data, ( i, result ) => {
                    var isCourseIncluded = false;
                    $.each( courses, (i, courseObj) => {
                        if( courseObj.course == result.course ) {
                            isCourseIncluded = true;
                        }
                    } );

                    if( ! isCourseIncluded ) {
                        courses.push( {
                            course: result.course,
                            sum: {
                                attendance: 1,
                                readingTime: result.readingTime
                            }
                        } );
                    } else {
                        $.each( courses, (i, courseObj) => {
                            if( courseObj.course == result.course ) {
                                courses[i].sum.attendance++;
                                courses[i].sum.readingTime += result.readingTime;
                            }
                        } );
                    }
                } );


                $.each( response.data, ( i, result ) => {
                    var isSectionIncluded = false;
                    $.each( sections, (i, sectionObj) => {
                        if( sectionObj.section == result.section ) {
                            isSectionIncluded = true;
                        }
                    } );

                    if( ! isSectionIncluded ) {
                        sections.push( {
                            section: result.section,
                            sum: {
                                attendance: 1,
                                readingTime: result.readingTime
                            }
                        } );
                    } else {
                        $.each( sections, (i, sectionObj) => {
                            if( sectionObj.section == result.section ) {
                                sections[i].sum.attendance++;
                                sections[i].sum.readingTime += result.readingTime;
                            }
                        } );
                    }
                } );


                $.each( response.data, ( i, result ) => {
                    var isGenderIncluded = false;
                    $.each( genders, (i, genderObj) => {
                        if( genderObj.gender == result.gender ) {
                            isGenderIncluded = true;
                        }
                    } );

                    if( ! isGenderIncluded ) {
                        genders.push( {
                            gender: result.gender,
                            sum: {
                                attendance: 1,
                                readingTime: result.readingTime
                            }
                        } );
                    } else {
                        $.each( genders, (i, genderObj) => {
                            if( genderObj.gender == result.gender ) {
                                genders[i].sum.attendance++;
                                genders[i].sum.readingTime += result.readingTime;
                            }
                        } );
                    }
                } );


                $.each( response.data, ( i, result ) => {
                    var isAddedByIncluded = false;
                    $.each( addedBys, (i, addedByObj) => {
                        if( addedByObj.addedBy == result.addedBy ) {
                            isAddedByIncluded = true;
                        }
                    } );

                    if( ! isAddedByIncluded ) {
                        addedBys.push( {
                            addedBy: result.addedBy,
                            sum: {
                                attendance: 1,
                                readingTime: result.readingTime
                            }
                        } );
                    } else {
                        $.each( addedBys, (i, addedByObj) => {
                            if( addedByObj.addedBy == result.addedBy ) {
                                addedBys[i].sum.attendance++;
                                addedBys[i].sum.readingTime += result.readingTime;
                            }
                        } );
                    }
                } );
                

                
                // SUMMARIZE
                $.each( years, (i, yearObj) => {
                    summary.year.sum.attendance += yearObj.sum.attendance;
                    summary.year.sum.readingTime += yearObj.sum.readingTime;
                } );
                summary.year.average.attendance = summary.year.sum.attendance / years.length;
                summary.year.average.readingTime = summary.year.sum.readingTime / years.length;


                $.each( months, (i, monthObj) => {
                    summary.month.sum.attendance += monthObj.sum.attendance;
                    summary.month.sum.readingTime += monthObj.sum.readingTime;
                } );
                summary.month.average.attendance = summary.month.sum.attendance / months.length;
                summary.month.average.readingTime = summary.month.sum.readingTime / months.length;


                $.each( days, (i, dayObj) => {
                    summary.day.sum.attendance += dayObj.sum.attendance;
                    summary.day.sum.readingTime += dayObj.sum.readingTime;
                } );
                summary.day.average.attendance = summary.day.sum.attendance / days.length;
                summary.day.average.readingTime = summary.day.sum.readingTime / days.length;


                $.each( courses, (i, courseObj) => {
                    summary.course.sum.attendance += courseObj.sum.attendance;
                    summary.course.sum.readingTime += courseObj.sum.readingTime;
                } );
                summary.course.average.attendance = summary.course.sum.attendance / courses.length;
                summary.course.average.readingTime = summary.course.sum.readingTime / courses.length;


                $.each( sections, (i, sectionObj) => {
                    summary.section.sum.attendance += sectionObj.sum.attendance;
                    summary.section.sum.readingTime += sectionObj.sum.readingTime;
                } );
                summary.section.average.attendance = summary.section.sum.attendance / sections.length;
                summary.section.average.readingTime = summary.section.sum.readingTime / sections.length;


                $.each( genders, (i, genderObj) => {
                    summary.gender.sum.attendance += genderObj.sum.attendance;
                    summary.gender.sum.readingTime += genderObj.sum.readingTime;
                } );
                summary.gender.average.attendance = summary.gender.sum.attendance / genders.length;
                summary.gender.average.readingTime = summary.gender.sum.readingTime / genders.length;


                $.each( addedBys, (i, addedByObj) => {
                    summary.addedBy.sum.attendance += addedByObj.sum.attendance;
                    summary.addedBy.sum.readingTime += addedByObj.sum.readingTime;
                } );
                summary.addedBy.average.attendance = summary.addedBy.sum.attendance / addedBys.length;
                summary.addedBy.average.readingTime = summary.addedBy.sum.readingTime / addedBys.length;



                // DISPLAY
                $( `#summary-year-sum-attendance` ).html( summary.year.sum.attendance );
                $( `#summary-year-sum-reading-time` ).html( toTimeString( summary.year.sum.readingTime ) );
                $( `#summary-year-average-attendance` ).html( summary.year.average.attendance.toFixed(4) );
                $( `#summary-year-average-reading-time` ).html( toTimeString( summary.year.average.readingTime ) );


                $( `#summary-month-sum-attendance` ).html( summary.month.sum.attendance );
                $( `#summary-month-sum-reading-time` ).html( toTimeString( summary.month.sum.readingTime ) );
                $( `#summary-month-average-attendance` ).html( summary.month.average.attendance.toFixed(4) );
                $( `#summary-month-average-reading-time` ).html( toTimeString( summary.month.average.readingTime ) );


                $( `#summary-day-sum-attendance` ).html( summary.day.sum.attendance );
                $( `#summary-day-sum-reading-time` ).html( toTimeString( summary.day.sum.readingTime ) );
                $( `#summary-day-average-attendance` ).html( summary.day.average.attendance.toFixed(4) );
                $( `#summary-day-average-reading-time` ).html( toTimeString( summary.day.average.readingTime ) );


                $( `#summary-course-sum-attendance` ).html( summary.course.sum.attendance );
                $( `#summary-course-sum-reading-time` ).html( toTimeString( summary.course.sum.readingTime ) );
                $( `#summary-course-average-attendance` ).html( summary.course.average.attendance.toFixed(4) );
                $( `#summary-course-average-reading-time` ).html( toTimeString( summary.course.average.readingTime ) );


                $( `#summary-section-sum-attendance` ).html( summary.section.sum.attendance );
                $( `#summary-section-sum-reading-time` ).html( toTimeString( summary.section.sum.readingTime ) );
                $( `#summary-section-average-attendance` ).html( summary.section.average.attendance.toFixed(4) );
                $( `#summary-section-average-reading-time` ).html( toTimeString( summary.section.average.readingTime ) );


                $( `#summary-gender-sum-attendance` ).html( summary.gender.sum.attendance );
                $( `#summary-gender-sum-reading-time` ).html( toTimeString( summary.gender.sum.readingTime ) );
                $( `#summary-gender-average-attendance` ).html( summary.gender.average.attendance.toFixed(4) );
                $( `#summary-gender-average-reading-time` ).html( toTimeString( summary.gender.average.readingTime ) );


                $( `#summary-addedBy-sum-attendance` ).html( summary.addedBy.sum.attendance );
                $( `#summary-addedBy-sum-reading-time` ).html( toTimeString( summary.addedBy.sum.readingTime ) );
                $( `#summary-addedBy-average-attendance` ).html( summary.addedBy.average.attendance.toFixed(4) );
                $( `#summary-addedBy-average-reading-time` ).html( toTimeString( summary.addedBy.average.readingTime ) );

      } );

} );

$( `#toggle-custom-report-display` ).on( `click`, (e) => {
    var customReportContainer = $( `#custom-report-container` );
    var customReportResult = $( `#custom-report-result` );
    var customReportSummary = $( `#custom-report-summary` );

    // CHANGE ICON
        if( customReportContainer.css( `display` ) == `block` ) {
            e.currentTarget.className = `pe-7s-angle-down-circle`;
        } else if( customReportContainer.css( `display` ) == `none` ) {
            e.currentTarget.className = `pe-7s-angle-up-circle`;
        }
    
    // TOGGLE DISPLAY
        customReportContainer.toggle( `slow` );
        customReportResult.toggle( `slow` );
        customReportSummary.toggle( `slow` );

} );



getUsersData();