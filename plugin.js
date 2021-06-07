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
  Timestamp: "ts",
  Title: "Highcharts Box Plot",
};

BoxPlotHighCharts.settings = EnebularIntelligence.SchemaProcessor(
  [
    {
      type: "text",
      name: "Title",
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
        text: "Experiment No.",
      },
    },

    yAxis: {
      title: {
        text: "Observations",
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
        // data: [
        //   [2.85, 2.63, 2.36, 2.23, 2.22],
        //   [3.31, 2.45, 2.44, 2.13, 2.08],
        //   [3.48, 2.36, 2.23, 2.14, 1.99],
        //   [2.75, 2.71, 2.63, 2.15, 2.09],
        //   [2.68, 2.19, 2.09, 2.02, 1.97],
        // ],
        data: seriesData,
        tooltip: {
          headerFormat: "<em>Experiment No {point.key}</em><br/>",
        },
      },
      {
        name: "Outliers",
        color: Highcharts.getOptions().colors[0],
        type: "scatter",
        data: [
          // x, y positions where 0 is the first category
          [0, 0.202],
          [4, 0.718],
          [4, 0.951],
          [4, 0.969],
        ],
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
    var value = this.settings.HorizontalAxis;
    var legend = this.settings.Legend;
    var ts = this.settings.Timestamp;

    this.filteredData = data
      .filter((d) => {
        let hasLabel = d.hasOwnProperty("ExperimentNo");
        return hasLabel;
      })
      .filter((d) => {
        let hasLabel = d.hasOwnProperty("Observations");
        const dLabel = d["Observations"];
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
  let temp = [];
  let x = colData;

  experimentNo = x.map((item) => {
    return item.key;
  });

  seriesData = x.map((item) => {
    let z = [];
    for (let index = 0; index < 5; index++) {
      z.push(item.values[index].Observations);
    }
    return z;
  });

  console.log("observations: ", observations);
  observations = x.map((item) =>
    item.values.map((subItem) => subItem.Observations).sort()
  );
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
          text: "Experiment No.",
        },
      },

      yAxis: {
        title: {
          text: "Observations",
        },
        plotLines: [
          {
            // Trung bình
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
          // data: [
          //   [2.85, 2.63, 2.36, 2.23, 2.22],
          //   [3.31, 2.45, 2.44, 2.13, 2.08],
          //   [3.48, 2.36, 2.23, 2.14, 1.99],
          //   [2.75, 2.71, 2.63, 2.15, 2.09],
          //   [2.68, 2.19, 2.09, 2.02, 1.97],
          // ],
          data: seriesData,
          tooltip: {
            headerFormat: "<em>Experiment No {point.key}</em><br/>",
          },
        },
        {
          name: "Outliers",
          color: Highcharts.getOptions().colors[0],
          type: "scatter",
          data: [
            // x, y positions where 0 is the first category
            [0, 0.202],
            [4, 0.718],
            [4, 0.951],
            [4, 0.969],
          ],
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
