var d3 = require("d3");
var Highcharts = require("highcharts");
require("highcharts/modules/exporting")(Highcharts);
require("highcharts/highcharts-more")(Highcharts);
require("highcharts/modules/accessibility")(Highcharts);
var colData = [];
var categoryX = [];
var seriesData = [];
var experimentNo = [];
var observations = [];
var experimentNoTemp = [];
var observationsTemp = [];

BoxPlotHighCharts.defaultSettings = {
  HorizontalAxis: "value",
  Legend: "Observations",
  Timestamp: "ts",
  Title: "Box Plot Highcharts",
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
          value: 932,
          color: "red",
          width: 1,
          label: {
            text: "Theoretical mean: 932",
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
        data: observations,
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
        const dLabel = d["ExperimentNo"];
        if (typeof dLabel !== "number") {
          fireError("VerticalAxis is not a number");
          hasLabel = false;
        }
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

function unique(arr) {
  var obj = {}
  var newArr = []
  for (let i = 0; i < arr.length; i++) {
    if (!obj[arr[i]]) {
      obj[arr[i]] = 1
      newArr.push(arr[i])
    }
  }
  return newArr
}

function ConvertDataAPI(that) {
  categoryX = [];
  seriesData = [];
  experimentNoTemp = [];
  observationsTemp = [];
  let temp = [];
  console.log("colData", colData);
  colData.forEach(function (val, index) {
    for (var i = 0; i < val.values.length; i++) {
      console.log("val", i, ": ", val);
      // if (colData[index]["values"][i]["ExperimentNo"] == val.key) {
      //   console.log("Testing");
      //   temp.push(colData[index]["values"][i]["Observations"]);


      //   console.log("temp", temp);
      // }

      experimentNoTemp.push(colData[index]["values"][i]["ExperimentNo"]);
      observationsTemp.push(colData[index]["values"][i]["Observations"]);
      experimentNo.push(experimentNoTemp);
      observations.push(observationsTemp);
      // console.log("experimentNoTemp", experimentNoTemp);
      console.log("observationsTemp", observationsTemp);
      // console.log("experimentNo", experimentNo);
      // console.log("observations", observations);
    }
  });
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
            value: 932,
            color: "red",
            width: 1,
            label: {
              text: "Theoretical mean: 932",
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
          data: observations,
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
