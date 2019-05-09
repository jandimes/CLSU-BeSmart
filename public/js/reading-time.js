// CHART
Chart.defaults.global.defaultFontFamily = `-apple-system,system-ui,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif`;
Chart.defaults.global.defaultFontColor = `#292b2c`;



const onload = () => {
    showProgessBar();

    setLastUpdated();
    setChartReadingTimeYear();
    setChartReadingTimeMonth( new Date().getFullYear() );
    setChartReadingTimeCourse();
    setChartReadingTimeSection();
    setChartReadingTimeGender();
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
  
    

// READING-TIME PER YEAR
const setChartReadingTimeYear = () => {
    var settings = {
      "async": true,
      "crossDomain": true,
      "url": "/reading-time/year",
      "method": "GET",
      "headers": {
        "cache-control": "no-cache",
        "Postman-Token": "f0f91413-9d15-4581-a775-37373e0ef557"
      }
    }
  
    $.ajax(settings)
      .done( (response) => {
        setTextReadingTimeSummary( `year`, response.data );

        var labels = [], data = [];
        $.each( response.data, (i) => {
          labels.push( response.data[i].year );
          data.push( response.data[i].totalReadingTime );
        } );
        
        var ctx = document.getElementById( `chart-reading-time-year` );
        var chartReadingTimeYear = new Chart(ctx, {
          type: `line`,
          data: {
            labels: labels,
            datasets: [{
              label: `Minutes`,
              data: data,
              lineTension: 0.3,
              backgroundColor: `rgba(2,117,216,0.2)`,
              borderColor: `rgba(2,117,216,1)`,
              pointRadius: 5,
              pointBackgroundColor: `rgba(2,117,216,1)`,
              pointBorderColor: `rgba(255,255,255,0.8)`,
              pointHoverRadius: 5,
              pointHoverBackgroundColor: `rgba(2,117,216,1)`,
              pointHitRadius: 50,
              pointBorderWidth: 2
            }]
          },
          options: {
            legend: {
              display: false
            }
          }
        });

        animateProgressBar( 20 );
      } )
      .fail( (response) => {
        let responseObj = response.responseJSON;
        if( responseObj.error )
            notify( responseObj.data, `danger` );
      } );
};



  // READING TIME PER MONTH
const setChartReadingTimeMonth = ( year ) => {
var settings = {
    "async": true,
    "crossDomain": true,
    "url": "/reading-time/month?year=" + year,
    "method": "GET",
    "headers": {
    "cache-control": "no-cache",
    "Postman-Token": "f0f91413-9d15-4581-a775-37373e0ef557"
    }
}

$.ajax(settings)
    .done(function (response) {
    setTextReadingTimeSummary( `month`, response.data );

    var labels = [], data = [];
    $.each( response.data, (i) => {     
        labels.push( response.data[i].month );
        data.push( response.data[i].totalReadingTime );
    } );        
    

    
    var ctx = resetCanvas( `chart-reading-time-month` );
    var chartReadingTimeMonth = new Chart(ctx, {
        type: `line`,
        data: {
        labels: labels,
        datasets: [{
            label: `Minutes`,
            data: data,
            lineTension: 0.3,
            backgroundColors: `rgba(2,117,216,0.2)`,
            borderColor: `rgba(2,117,216,1)`,
            pointRadius: 5,
            pointBackgroundColor: `rgba(2,117,216,1)`,
            pointBorderColor: `rgba(255,255,255,0.8)`,
            pointHoverRadius: 5,
            pointHoverBackgroundColor: `rgba(2,117,216,1)`,
            pointHitRadius: 50,
            pointBorderWidth: 2
        }]
        },
        options: {
        legend: {
            display: false
        }
        }
    });

    $(`h3.title > span.chart-reading-time-month-year`).text( year );      

    animateProgressBar( 40 );
    })
    
    .fail( (response) => {
    let responseObj = response.responseJSON;
    if( responseObj.error )
        notify( responseObj.data, `danger` );
    } );
};



// READING-TIME PER COURSE
const setChartReadingTimeCourse = () => {
    var settings = {
      "async": true,
      "crossDomain": true,
      "url": "/reading-time/course",
      "method": "GET",
      "headers": {
        "cache-control": "no-cache",
        "Postman-Token": "29287d26-94c2-4d28-ba8b-eb6603e54069"
      }
    }
  
    $.ajax(settings)
      .done( (response) => {
        setTextReadingTimeSummary( `course`, response.data );

        var labels = [], data = [];
        $.each( response.data, (i) => {
          labels.push( response.data[i].course );
          data.push( response.data[i].totalReadingTime );
        } );
    
        var ctx = document.getElementById(`chart-reading-time-course`);
        var chartReadingTimeCourse = new Chart(ctx, {
          type: `radar`,
          data: {
            labels: labels,
            datasets: [{
              label: `Minutes`,
              data: data,
              backgroundColor: `#69D2E7`
            }],
          },
          options: {
            legend: {
              display: false
            }
          }
        });
      

        animateProgressBar( 60 );
      } )
        
      .fail( (response) => {
        let responseObj = response.responseJSON;
        if( responseObj.error )
            notify( responseObj.data, `danger` );
      } );
};



// READING TIME PER LIBRARY SECTION
const setChartReadingTimeSection = () => {
    var settings = {
      "async": true,
      "crossDomain": true,
      "url": "/reading-time/section",
      "method": "GET",
      "headers": {
        "cache-control": "no-cache",
        "Postman-Token": "9814f9e9-4d7f-4724-b482-475313c11539"
      }
    }
  
    $.ajax(settings)
      .done( (response) => {
        setTextReadingTimeSummary( `section`, response.data );

        var labels = SECTIONS, data = [],
            backgroundColors = [`#6B5B95`, `#DD4132`, `#9E1030`, `#FE840E`, `#C62168`, `#E94B3C`];
        $.each( response.data, (i) => {
          data.push( response.data[i].totalReadingTime );
        } );
        
        var ctx = document.getElementById(`chart-reading-time-section`);
        var chartReadingTimeSection = new Chart(ctx, {
          type: `doughnut`,
          data: {
            labels: labels,
            datasets: [{
              data: data,
              backgroundColor: backgroundColors
            }]
          }
        });
      
        animateProgressBar( 80 );

      } )
      
      .fail( (response) => {
        let responseObj = response.responseJSON;
        if( responseObj.error )
            notify( responseObj.data, `danger` );
      } );
};



  // ATTENDANCE PER GENDER
const setChartReadingTimeGender = () => {
    var settings = {
      "async": true,
      "crossDomain": true,
      "url": "/reading-time/gender",
      "method": "GET",
      "headers": {
        "cache-control": "no-cache",
        "Postman-Token": "fd29db74-938f-4391-8a9e-4130af653758"
      }
    }
  
    $.ajax(settings)
    
      .done( (response) => {
        setTextReadingTimeSummary( `gender`, response.data );

        var labels = [`Female`, `Male`, `Undefined`], data = [], backgroundColors = [`rgb(214,71,153)`, `rgb(0,0,255)`];
        $.each( response.data, (i) => {
          data.push( response.data[i].totalReadingTime ); 
        } );
    
        var ctx = document.getElementById(`chart-reading-time-gender`);
        var chartReadingTimeGender = new Chart(ctx, {
          type: `pie`,
          data: {
            labels: labels,
            datasets: [ {
              data: data,
              backgroundColor: backgroundColors
            } ]
          }
        });

        animateProgressBar( 100 );
        setTimeout( () => {
          hideProgressBar();
        }, 1000 );
      } )

      .fail( (response) => {
        let responseObj = response.responseJSON;
        if( responseObj.error )
          notify( responseObj.data, `danger` );
      } );

};



// TEXT SUMMARY
const setTextReadingTimeSummary = ( readingTime, data ) => {
    var totalEl = $(`div#text-reading-time-${readingTime} .text-summary .text-total`);
    var averageEl = $(`div#text-reading-time-${readingTime} .text-summary .text-average`);
    var readingTimeEl = $(`div#text-reading-time-${readingTime} .text-summary .text-reading-time`);
    var dataEl = $(`div#text-reading-time-${readingTime} .text-data`);

    var total = data.length,
        average = 0, sum = 0,
        dataStr = ``;

    data.forEach( ( value, index ) => {
        sum += value.totalReadingTime;

        if( readingTime == `month` )
            value[`${readingTime}`] = new Date( new Date().setMonth( value.month-1 ) ).toDateString().split(" ")[1];
        else if( readingTime == `section` )
            value[`${readingTime}`] = SECTIONS[ Number( value[`${readingTime}`] )-1 ];
        else if( readingTime == `gender` )
            if( value[`${readingTime}`] == `F` )
                value[`${readingTime}`] = `Female`;
        else if( value[`${readingTime}`] == `M` )
            value[`${readingTime}`] = `Male`;
        else if( value[`${readingTime}`] == `U` )
          value[`${readingTime}`] = `Undefined`;

        if( index == 0 )
        dataStr += `A `;
        else
        dataStr += `a `;

        dataStr += `total of <b class="text-info">${(value.totalReadingTime/60).toFixed(2)}</b> hours has been recorded in patron reading time for <i class="text-warning">${value[`${readingTime}`]}</i>`;

        if( (index+1) < total ) {
        dataStr += `; `;
        if( (index+1) == (total-1) )
            dataStr += `and `;
        }
        else
        dataStr += `. `;
    } );
    sum /= 60;
    average = (sum/total);

    totalEl.html( sum.toFixed(2) );
    averageEl.html( average.toFixed(2) );
    readingTimeEl.html( readingTime );
    dataEl.html( dataStr );
};



// MY FUNCTIONS
const resetCanvas = ( canvasID ) => {
    var canvasContainer = $(`canvas#${canvasID}`).parent(),
        width = $(`canvas#${canvasID}`).width(),
        height = $(`canvas#${canvasID}`).height();
    $(`canvas#${canvasID}`).remove();
      canvasContainer.append(`<canvas id="${canvasID}"></canvas>`);
  
    var canvas = document.querySelector(`canvas#${canvasID}`);
    var ctx = canvas.getContext(`2d`);
      ctx.canvas.width = width;
      ctx.canvas.height = height;
  
    return ctx;
};

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

const showProgessBar = () => {
  var content = $(`div.main-panel > div.content`);
    content.hide();

  var progressBarContainer = $(`div#progress-bar-container`);
    progressBarContainer.show();
};

const hideProgressBar = () => {
  var content = $(`div.main-panel > div.content`);
    content.show();

  var progressBarContainer = $(`div#progress-bar-container`);
    progressBarContainer.hide();
};

const animateProgressBar = ( value ) => {        
  var progressBar = document.querySelector(`div#progress-bar-container div.progress-bar`);
  var start = $(progressBar).attr( `aria-valuenow` );
  
  var x = start;
  var id = setInterval(frame, 50);
  function frame() {
      if( x < 33 ) {
        $(progressBar).addClass(`progress-bar-danger`);
      } else if( x < 66 ) {
        $(progressBar).removeClass(`progress-bar-danger`);
        $(progressBar).addClass(`progress-bar-warning`);
      } else {
        $(progressBar).removeClass(`progress-bar-warning`);
        $(progressBar).addClass(`progress-bar-success`);
      }



      if (x >= value) {
          clearInterval(id);
      } else {
          x++; 
          progressBar.setAttribute( `aria-valuenow`, x );
          progressBar.style.width = x + `%`; 
          progressBar.innerHTML = x * 1 + `%`;
      }
  }
};



onload();


//Printing
const formatPrintableTextSummary = (textSummary) => {
    var formattedText = textSummary.replace( /<[^>]*>?/g, `` );
    return formattedText;
};



// EVENT LISTENERS
$(`select#chart-reading-time-month-year`).on( `change`, (e) => {
    setChartReadingTimeMonth( Number(e.currentTarget.value) );
} );

$(`#print-chart-reading-time-year`).click( () => {
    var dataUrl = document.getElementById(`chart-reading-time-year`).toDataURL();
    var title = `Annual Patron Reading Time`;
    var textSummary = formatPrintableTextSummary( document.getElementById(`text-reading-time-year`).innerHTML );
    
    print(dataUrl, title, textSummary);
} );

$(`#print-chart-reading-time-month`).click( () => {
    var dataUrl = document.getElementById(`chart-reading-time-month`).toDataURL();
    var year = document.querySelector(`.chart-reading-time-month-year`).textContent;
    var title = `Monthly Patron Reading Time for ${year}`;
    var textSummary = formatPrintableTextSummary( document.getElementById(`text-reading-time-month`).innerHTML );
    
    print(dataUrl, title, textSummary);
} );

$(`#print-chart-reading-time-course`).click( () => {
    var dataUrl = document.getElementById(`chart-reading-time-course`).toDataURL();
    var title = `Reading Time per Course`;
    var textSummary = formatPrintableTextSummary( document.getElementById(`text-reading-time-course`).innerHTML );
    
    print(dataUrl, title, textSummary);
} );

$(`#print-chart-reading-time-section`).click( () => {
    var dataUrl = document.getElementById(`chart-reading-time-section`).toDataURL();
    var title = `Patron Reading Time per Library Section`;
    var textSummary = formatPrintableTextSummary( document.getElementById(`text-reading-time-section`).innerHTML );
    
    print(dataUrl, title, textSummary);
});

$(`#print-chart-reading-time-gender`).click( () => {
    var dataUrl = document.getElementById(`chart-reading-time-gender`).toDataURL();
    var title = `Patron Reading Time per Gender`;
    var textSummary = formatPrintableTextSummary( document.getElementById(`text-reading-time-gender`).innerHTML );
    
    print(dataUrl, title, textSummary);
});



const print = (dataUrl, title, textSummary) => {
    const windowEl = document.createElement(`html`);
    var windowContent = ``;
      windowContent += `<head>
                          <style>*{display:none;}@media print{*{display:block;}style{display:none;}}</style>
                          <link rel="stylesheet" href="./css/assets/css/bootstrap.min.css">                          
                        </head>`;
      windowContent += `<body>`;
      windowContent += `
        <div class="container-fluid">
          <div class="row mb-5">
            <h2 class="text-info text-center" style="font-size:35px;">
              Barcode-Enabled Solution for Monitoring Attendance and Reading Time (BeSmart)
            </h2>
          </div>
          <div class="row">
            <img src="${dataUrl}" width="75%" height="100%" style="margin-left:75px">
          </div>
          <div class="row">
            <h4>${title}</h4>
            <div>${textSummary}</div>
          </div>
        </div>
      `;
      windowContent += `</body>`;
  windowEl.innerHTML = windowContent;

  $(windowEl).printThis();
}

const toggleTextSummary = (button, readingTime) => {
    var buttonEl = $(button);
    var textEl = $(`#text-reading-time-${readingTime}`);

    textEl.toggle(`medium`);

    if( buttonEl.html() == `Show Summary` )
        buttonEl.html(`Hide Summary`);
    else if( buttonEl.html() == `Hide Summary` )
        buttonEl.html(`Show Summary`);
};