var ScrollBoxChart = {
  chart: null,
  config: {
    type: 'LineWithScrollBox',
    data: null,
    options: {
      responsive: false,            // 반응형 숨기기
      tooltips: {                   // y값 툴팁 숨기기
        enabled: false,
        mode: 'index',
        intersect: false,
      },
      legend: { display: false },   // 범례 숨기기
      elements: {                   // y축 포인트 숨기기
        point: { radius: 0 },
      },
      scales: {                     // x, y축
        xAxes: [{                   // x축
          display: true,
          scaleLabel: {             // 라벨 제목 숨기기
            display: false,
            labelString: '',
          },
          ticks: {                  // 라벨 경사 0도(수평)
            minRotation: 0,
            maxRotation: 0,
          },
        }],
        yAxes: [{                   // y축
          display: true,
          scaleLabel: {             // 라벨 제목 숨기기
            display: false
          },
        }],
      },
    },
  },
};

var ScrollBox = {
  xStart: 0,
  xEnd: 0,
  yTop: 0,
  yBottom: 0,
  padding: 50,
  lineWidth: 1.5,
  lineColor: 'rgb(54, 162, 235)',
};

var ChartView = {
  chart: null,
  config: {
    type: 'line',
    data: null,
    options: {
      responsive: false,          // 반응형 숨기기
      tooltips: {                 // y값 툴팁 숨기기
        mode: 'index',
        intersect: false,
      },
      legend: { display: false }, // 범례 숨기기
      elements: {                 // y축 포인트 숨기기
        point: { radius: 0 },
      },
      scales: {                   // x, y축
        xAxes: [{                 // y축
          display: true,
          scaleLabel: {           // 라벨 제목 숨기기
            display: false,
            labelString: '',
          },
          ticks: {                // 라벨 경사 0도(수평)
            minRotation: 0,
            maxRotation: 0,
          },
        }],
        yAxes: [{                 // y축
          display: true,
          scaleLabel: {           // 라벨 제목 숨기기
            display: false
          },
          ticks: { min: 0 },      // 최소값 0
        }],
      },
    },
  },
};

function getStartAndEndIdx(chart) {
  var xAxisLeft = chart.scales['x-axis-0'].left;
  var xAxisRight = chart.scales['x-axis-0'].right;
  var xAxisWidth = xAxisRight - xAxisLeft;
  var start = Math.round((ScrollBox.xStart - xAxisLeft) / (xAxisWidth / 100));
  var end = start + Math.round((ScrollBox.xEnd - ScrollBox.xStart) / (xAxisWidth / 100));

  return { start: start, end: end };
}

function initScrollBox(chart, lineColor) {
  ScrollBox.yTop = chart.scales['y-axis-0'].top;
  ScrollBox.yBottom = chart.scales['y-axis-0'].bottom;

  var xAxisLeft = chart.scales['x-axis-0'].left;
  var xAxisRight = chart.scales['x-axis-0'].right;
  var activePoint = chart.tooltip._active[0];
  var x = activePoint.tooltipPosition().x;
  var padding = ScrollBox.padding;
  ScrollBox.xStart = x < padding + xAxisLeft ? xAxisLeft : x - padding;
  ScrollBox.xEnd = x > xAxisRight - padding ? xAxisRight : x + padding;

  if (lineColor) ScrollBox.lineColor = lineColor;
}

function initChart(chartData) {
  Chart.controllers.LineWithScrollBox = Chart.controllers.line.extend({
    draw: function(ease) {
      Chart.controllers.line.prototype.draw.call(this, ease);

      if (this.chart.tooltip._active && this.chart.tooltip._active.length) {
        initScrollBox(this.chart, chartData.boxColor);

        var idx = getStartAndEndIdx(this.chart);

        if (!ChartView.chart) {
          ChartView.config.data = {
            labels: chartData.labels.slice(idx.start, idx.end + 1),
            datasets: [{
              backgroundColor: chartData.backgroundColor,
              borderColor: chartData.backgroundColor,
              data: chartData.data.slice(idx.start, idx.end + 1),
              fill: true,
            }],
          };

          ChartView.chart = new Chart(chartData.ctxView, ChartView.config);
        } else {
          ChartView.chart.data.labels = this.chart.data.labels.slice(idx.start, idx.end + 1);
          ChartView.chart.data.datasets[0].data = this.chart.data.datasets[0].data.slice(idx.start, idx.end + 1);
          ChartView.chart.update();
        }
      }

      // draw line
      var chartCtx = this.chart.chart.ctx;
      chartCtx.save();
      chartCtx.beginPath();
      chartCtx.moveTo(ScrollBox.xStart, ScrollBox.yTop);
      chartCtx.lineTo(ScrollBox.xStart, ScrollBox.yBottom);
      chartCtx.lineTo(ScrollBox.xEnd, ScrollBox.yBottom);
      chartCtx.lineTo(ScrollBox.xEnd, ScrollBox.yTop);
      chartCtx.lineTo(ScrollBox.xStart, ScrollBox.yTop);
      chartCtx.lineWidth = ScrollBox.lineWidth;
      chartCtx.strokeStyle = chartData.backgroundColor.boxColor;
      chartCtx.stroke();
      chartCtx.restore();
    }
  });
}

function drawChart(chartData) {
  initChart(chartData);

  ScrollBoxChart.config.data = {
    labels: chartData.labels,
    datasets: [{
      borderColor: chartData.backgroundColor,
      data: chartData.data,
    }],
  };

  var myChart = new Chart(chartData.ctx, ScrollBoxChart.config);
}
