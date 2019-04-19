// Set new default font family and font color to mimic Bootstrap's default styling
Chart.defaults.global.defaultFontFamily = '-apple-system,system-ui,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif';
Chart.defaults.global.defaultFontColor = '#292b2c';

// Pie Chart Example
var ctx = document.getElementById("myPieChart");
var myPieChart = new Chart(ctx, {
  type: 'pie',
  data: {
    labels: ["CAG", "CAS", "CED", "CEN", "CBAA", "CF", "CHSI", "CVSM"],
    datasets: [{
      data: [12, 12, 12, 12, 12, 12, 12, 12],
      backgroundColor: ['#28a745', '#9368e9', '#ffc107', '#8a0e1a', '#007bff', '#dc3545', '#f19fa7', '#484749'],
    }],
  },
});