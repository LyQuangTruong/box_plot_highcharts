var d3 = require("d3");
var Highcharts = require("highcharts");
require("highcharts/modules/histogram-bellcurve")(Highcharts);
var colData = [];
var categoryX = [];
var seriesData = [];

HistgramHighCharts.defaultSettings = {
  HorizontalAxis: "value",
  Timestamp: "ts",
  Title: "Histgram high charts",
};

HistgramHighCharts.settings = EnebularIntelligence.SchemaProcessor(
  [
    {
      type: "text",
      name: "Title",
    },
  ],
  HistgramHighCharts.defaultSettings
);

function createHistgramHighCharts(that) {
  if (seriesData != []) seriesData = [];
  if (categoryX != []) categoryX = [];
  ConvertDataAPI(that);
  that.histgramHighChartsC3 = Highcharts.chart("root", {
    title: {
      text: that.settings.Title,
    },

    xAxis: [
      {
        title: { text: "Data" },
        alignTicks: false,
      },
      {
        title: { text: "Histogram" },
        alignTicks: false,
        opposite: true,
      },
    ],

    yAxis: [
      {
        title: { text: "Data" },
      },
      {
        title: { text: "Histogram" },
        opposite: true,
      },
    ],

    plotOptions: {
      histogram: {
        accessibility: {
          pointDescriptionFormatter: function (point) {
            var ix = point.index + 1,
              x1 = point.x.toFixed(3),
              x2 = point.x2.toFixed(3),
              val = point.y;
            return ix + ". " + x1 + " to " + x2 + ", " + val + ".";
          },
        },
      },
    },

    series: [
      {
        name: "Histogram",
        type: "histogram",
        xAxis: 1,
        yAxis: 1,
        baseSeries: "s1",
        zIndex: -1,
      },
      {
        name: "Data",
        type: "scatter",
        data: seriesData,
        id: "s1",
        marker: {
          radius: 1.5,
        },
      },
    ],
  });
}

function HistgramHighCharts(settings, options) {
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
    createHistgramHighCharts(that);
  }, 100);
}

HistgramHighCharts.prototype.addData = function (data) {
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
    var ts = this.settings.Timestamp;

    this.filteredData = data
      .filter((d) => {
        let hasLabel = d.hasOwnProperty(value);
        const dLabel = d[value];
        if (typeof dLabel !== "string" && typeof dLabel !== "number") {
          fireError("HorizontalAxis is not a string or number");
          hasLabel = false;
        }
        return hasLabel;
      })
      .filter((d) => {
        let hasTs = d.hasOwnProperty(ts);
        if (isNaN(d[ts])) {
          fireError("Timestamp is not a number");
          hasTs = false;
        }
        return hasTs;
      })
      .sort((a, b) => b.value - a.value);

    if (this.filteredData.length === 0) {
      return;
    }

    this.data = d3
      .nest()
      .key(function (d) {
        return d[ts];
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

HistgramHighCharts.prototype.clearData = function () {
  this.data = {};
  colData = [];
  seriesData = [];
  categoryX = [];
  this.refresh();
};

HistgramHighCharts.prototype.convertData = function () {
  colData = this.data;
  this.refresh();
};

function ConvertDataAPI(that) {
  categoryX = [];
  seriesData = [];
  colData.forEach(function (val, index) {
    for (var i = 0; i < val.values.length; i++) {
      seriesData.push(colData[index]["values"][i]["value"]);
      categoryX.push(colData[index]["values"][i]["ts"]);
    }
  });
}

HistgramHighCharts.prototype.resize = function (options) {
  this.width = options.width;
  this.height = options.height - 50;
};

HistgramHighCharts.prototype.refresh = function () {
  var that = this;

  ConvertDataAPI(that);

  if (this.axisX) this.axisX.remove();
  if (this.axisY) this.axisY.remove();
  if (this.yText) this.yText.remove();

  if (that.histgramHighChartsC3) {
    that.histgramHighChartsC3 = Highcharts.chart("root", {
      title: {
        text: that.settings.Title,
      },

      xAxis: [
        {
          title: { text: "Data" },
          alignTicks: false,
        },
        {
          title: { text: "Histogram" },
          alignTicks: false,
          opposite: true,
        },
      ],

      yAxis: [
        {
          title: { text: "Data" },
        },
        {
          title: { text: "Histogram" },
          opposite: true,
        },
      ],

      plotOptions: {
        histogram: {
          accessibility: {
            pointDescriptionFormatter: function (point) {
              var ix = point.index + 1,
                x1 = point.x.toFixed(3),
                x2 = point.x2.toFixed(3),
                val = point.y;
              return ix + ". " + x1 + " to " + x2 + ", " + val + ".";
            },
          },
        },
      },

      series: [
        {
          name: "Histogram",
          type: "histogram",
          xAxis: 1,
          yAxis: 1,
          baseSeries: "s1",
          zIndex: -1,
        },
        {
          name: "Data",
          type: "scatter",
          data: seriesData,
          id: "s1",
          marker: {
            radius: 1.5,
          },
        },
      ],
    });
  }
};

HistgramHighCharts.prototype.onError = function (errorCallback) {
  this.errorCallback = errorCallback;
};

HistgramHighCharts.prototype.getEl = function () {
  return this.el;
};

window.EnebularIntelligence.register("histgramHighCharts", HistgramHighCharts);

module.exports = HistgramHighCharts;
