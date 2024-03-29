var d3 = require("d3");
var Highcharts = require("highcharts");
require("highcharts/modules/exporting")(Highcharts);
require("highcharts/highcharts-more")(Highcharts);
require("highcharts/modules/accessibility")(Highcharts);
var colData = [];
var categoryX = [];
var seriesData = [];
var experimentNo;
var observations = [];
var sum = 0;
var avg = 0;

BoxPlotHighCharts.defaultSettings = {
  HorizontalAxis: "value",
  Legend: "ExperimentNo",
  Observations: "Observations",
  Timestamp: "ts",
  Title: "Highcharts Box Plot",
};

BoxPlotHighCharts.settings = EnebularIntelligence.SchemaProcessor(
  [
    {
      type: "text",
      name: "Title",
    },
    {
      type: "text",
      name: "Legend",
    },
    {
      type: "text",
      name: "Observations",
    },
  ],
  BoxPlotHighCharts.defaultSettings
);

function createBoxPlotHighCharts(that) {
  if (seriesData != []) seriesData = [];
  if (categoryX != []) categoryX = [];
  ConvertDataAPI(that);
  that.boxPlotHighChartsC3 = Highcharts.chart("root", {
    chart: {
      type: "boxplot",
    },

    title: {
      text: that.settings.Title,
    },

    legend: {
      enabled: false,
    },

    xAxis: {
      categories: experimentNo,
      title: {
        text: that.settings.Legend,
      },
    },

    yAxis: {
      title: {
        text: that.settings.Observations,
      },
      plotLines: [
        {
          value: avg,
          color: "red",
          width: 1,
          label: {
            text: `Average  mean:  ${avg}`,
            align: "center",
            style: {
              color: "gray",
            },
          },
        },
      ],
    },

    series: [
      {
        name: "Observations",
        data: seriesData,
        tooltip: {
          headerFormat: "<em>Experiment No {point.key}</em><br/>",
        },
      },
      {
        name: "Outliers",
        color: Highcharts.getOptions().colors[0],
        type: "scatter",
        data: [],
        marker: {
          fillColor: "white",
          lineWidth: 1,
          lineColor: Highcharts.getOptions().colors[0],
        },
        tooltip: {
          pointFormat: "Observation: {point.y}",
        },
      },
    ],
  });
}

function BoxPlotHighCharts(settings, options) {
  var that = this;
  this.el = window.document.createElement("div");
  this.el.id = "chart";

  this.settings = settings;
  this.options = options;
  this.data = [];
  this.maxNumber = 0;
  this.minNumber = 0;

  this.width = options.width || 700;
  this.height = options.height || 500;

  this.margin = { top: 20, right: 80, bottom: 30, left: 50 };

  setTimeout(function () {
    createBoxPlotHighCharts(that);
  }, 100);
}

BoxPlotHighCharts.prototype.addData = function (data) {
  var that = this;
  function fireError(err) {
    if (that.errorCallback) {
      that.errorCallback({
        error: err,
      });
    }
  }

  if (data instanceof Array) {
    console.log("data: ", data);
    var value = this.settings.HorizontalAxis;
    var legend = this.settings.Legend;
    var ts = this.settings.Timestamp;

    this.filteredData = data
      .filter((d) => {
        let hasLabel = d.hasOwnProperty(that.settings.Legend);
        return hasLabel;
      })
      .filter((d) => {
        let hasLabel = d.hasOwnProperty(that.settings.Observations);
        const dLabel = d[that.settings.Observations];
        if (typeof dLabel !== "number") {
          fireError("VerticalAxis is not a number");
          hasLabel = false;
        }
        return hasLabel;
      })
      .filter((d) => {
        let hasTs = d.hasOwnProperty(ts);
        if (isNaN(d[ts])) {
          fireError("timestamp is not a number");
          hasTs = false;
        }
        return hasTs;
      })
      .sort((a, b) => b.Observations - a.Observations);

    if (this.filteredData.length === 0) {
      return;
    }

    this.data = d3
      .nest()
      .key(function (d) {
        return d[legend];
      })
      .entries(this.filteredData)
      .sort(function (a, b) {
        if (a.key < b.key) return -1;
        if (a.key > b.key) return 1;
        return 0;
      });
    this.convertData();
  } else {
    fireError("no data");
  }
};

BoxPlotHighCharts.prototype.clearData = function () {
  this.data = {};
  colData = [];
  seriesData = [];
  categoryX = [];
  this.refresh();
};

BoxPlotHighCharts.prototype.convertData = function () {
  colData = this.data;
  this.refresh();
};

function ConvertDataAPI(that) {
  categoryX = [];
  seriesData = [];
  observations = [];
  let x = colData;

  experimentNo = x.map((item) => {
    return item.key;
  });

  seriesData = colData.map((item) => {
    let vz = [];
    let v = item.values.map((subItem) => subItem[that.settings.Observations]).sort();
    let minimum = v[0];
    let maximum = v[v.length - 1];

    let medianIndex = Math.round(v.length / 2);
    var medianValue;
    if (v.length % 2 == 0) {
      medianValue = (v[medianIndex] + v[medianIndex + 1]) / 2;
    } else {
      medianValue = v[medianIndex];
    }

    let firstQuartile = (maximum - minimum) * 0.25;

    let thirdQuartile = (maximum - minimum) * 0.75;

    vz.push(minimum);
    vz.push(firstQuartile);
    vz.push(medianValue);
    vz.push(thirdQuartile);
    vz.push(maximum);
    vz.sort();

    return vz;
  });

  x = observations;
  for (let i = 0; i < x.length; i++) {
    for (let j = 0; j < x.length; j++) {
      sum += x[i][j];
    }
  }
  avg = sum / (x.length * 5);
}

BoxPlotHighCharts.prototype.resize = function (options) {
  this.width = options.width;
  this.height = options.height - 50;
};

BoxPlotHighCharts.prototype.refresh = function () {
  var that = this;

  ConvertDataAPI(that);

  if (this.axisX) this.axisX.remove();
  if (this.axisY) this.axisY.remove();
  if (this.yText) this.yText.remove();

  if (that.boxPlotHighChartsC3) {
    that.barChartHighChartC3 = Highcharts.chart("root", {
      chart: {
        type: "boxplot",
      },

      title: {
        text: that.settings.Title,
      },

      legend: {
        enabled: false,
      },

      xAxis: {
        categories: experimentNo,
        title: {
          text: that.settings.Legend,
        },
      },

      yAxis: {
        title: {
          text: that.settings.Observations,
        },
        plotLines: [
          {
            value: avg,
            color: "red",
            width: 1,
            label: {
              text: `Average  mean:  ${avg}`,
              align: "center",
              style: {
                color: "gray",
              },
            },
          },
        ],
      },

      series: [
        {
          name: "Observations",
          data: seriesData,
          tooltip: {
            headerFormat: "<em>Experiment No {point.key}</em><br/>",
          },
        },
        {
          name: "Outliers",
          color: Highcharts.getOptions().colors[0],
          type: "scatter",
          data: [],
          marker: {
            fillColor: "white",
            lineWidth: 1,
            lineColor: Highcharts.getOptions().colors[0],
          },
          tooltip: {
            pointFormat: "Observation: {point.y}",
          },
        },
      ],
    });
  }
};

BoxPlotHighCharts.prototype.onError = function (errorCallback) {
  this.errorCallback = errorCallback;
};

BoxPlotHighCharts.prototype.getEl = function () {
  return this.el;
};

window.EnebularIntelligence.register("boxPlotHighCharts", BoxPlotHighCharts);

module.exports = BoxPlotHighCharts;
