// CHART
Chart.defaults.global.defaultFontFamily = '-apple-system,system-ui,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif';
Chart.defaults.global.defaultFontColor = '#292b2c';



const onload = () => {
  setLastUpdated();
  setChartReadingTimeCourse();
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
  
    

// READING-TIME PER COURSE
const setChartReadingTimeCourse = () => {
    var settings = {
        "async": true,
        "crossDomain": true,
        "url": "/reading-time/course",
        "method": "GET",
        "headers": {
          "cache-control": "no-cache",
          "Postman-Token": "699b2dea-946d-4b7e-8228-a4e95b0f480d"
        }
      }
    
    $.ajax(settings)
        .done(function (response) {            
            setTextReadingTimeSummary(`course`, response.data);

            var labels = [], data = [], backgroundColors = [];
            $.each( response.data, (i) => {
                labels.push( response.data[i].course );
                data.push( response.data[i].readingTime );
                backgroundColors.push( `rgb(${Math.random()*255},${Math.random()*255},${Math.random()*255})` );
            } );
        
            var ctx = document.getElementById("chart-reading-time-course");
            var chartReadingTimeCourse = new Chart(ctx, {
                type: 'radar',
                data: {
                labels: labels,
                datasets: [{
                    label: "Minutes",
                    data: data,
                    backgroundColor: backgroundColors
                }],
                },
                options: {
                legend: {
                    display: false
                }
                }
            });
        })
        .fail( (response) => {
          let responseObj = response.responseJSON;
          if( responseObj.error )
              notify( responseObj.data, `danger` );
        } );
};



onload();



// TEXT SUMMARY
var setTextReadingTimeSummary = ( readingTime, data ) => {
    var totalEl = $(`div#text-reading-time-${readingTime} .text-summary .text-total`);
    var averageEl = $(`div#text-reading-time-${readingTime} .text-summary .text-average`);
    var readingTimeEl = $(`div#text-reading-time-${readingTime} .text-summary .text-reading-time`);
    var dataEl = $(`div#text-reading-time-${readingTime} .text-data`);

    var total = data.length,
        average = 0, sum = 0,
        dataStr = ``;

    data.forEach( ( value, index ) => {
        sum += value.readingTime;

        if( readingTime == `month` )
            value[`${readingTime}`] = new Date( new Date().setMonth( value.month-1 ) ).toDateString().split(" ")[1];
        else if( readingTime == `section` )
            value[`${readingTime}`] = SECTIONS[ Number( value[`${readingTime}`] )-1 ];
        else if( readingTime == `gender` )
            if( value[`${readingTime}`] == `F` )
                value[`${readingTime}`] = `Female`;
        else if( value[`${readingTime}`] == `M` )
            value[`${readingTime}`] = `Male`;

        if( index == 0 )
        dataStr += `A `;
        else
        dataStr += `a `;

        dataStr += `total of <b class="text-info">${(value.readingTime/60).toFixed(2)}</b> hours has been recorded in patron attendance for <i class="text-warning">${value[`${readingTime}`]}</i>`;

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


//Printing
var formatPrintableTextSummary = (textSummary) => {
    var formattedText = textSummary.replace( /<[^>]*>?/g, `` );
    return formattedText;
};



$(`#print-chart-reading-time-course`).click( () => {
    var dataUrl = document.getElementById(`chart-reading-time-course`).toDataURL();
    var title = `Reading Time per Course`;
    var textSummary = formatPrintableTextSummary( document.getElementById(`text-reading-time-course`).innerHTML );
    
    print(dataUrl, title, textSummary);
});



const print = (dataUrl, title, textSummary) => {
    var windowContent = ``;
      windowContent += `<html>`;
      windowContent += `<head><style>*{display:none;}@media print{*{display:block;}style{display:none;}}</style></head>`;
      windowContent += `<body>`;
      windowContent += `<h1 style="font-size:35px;">BESMART</h1>`;
      windowContent += `<img src="${dataUrl}" width="75%" height="100%" style="margin-left:75px">`;
      windowContent += `<h1>${title}</h1>`;
      windowContent += `<div>${textSummary}</div`;
      windowContent += `</body>`;
      windowContent += `</html>`;
    var printWin = window.open(`width=1366,height=692`);
    printWin.document.write(windowContent);
    printWin.focus();
    printWin.print();
    printWin.close();
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