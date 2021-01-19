// @TODO: YOUR CODE HERE!
var width = parseInt(d3.select("#scatter").style("width"));

var height = width - width / 3.9;

var margin = 20;

var labelArea = 110;

let axisDelay = 1000;
let dotDelay = 1000;

// padding for the text at the bottom and left axes
var tPadBot = 40;
var tPadLeft = 40;

var svg = d3
  .select("#scatter")
  .append("svg")
  .attr("width", width)
  .attr("height", height)
  .attr("class", "chart");

// Import Data
d3.csv("assets/data/data.csv").then(function (data) {
  createGraph(data);
});

// Dot radii
var radius;
function getRadius() {
  if (width <= 530) {
    radius = 10;
  } else {
    radius = 15;
  }
}
getRadius();

// X Axis Label Creation
svg.append("g").attr("class", "xAxisLabel");

var xAxisLabel = d3.select(".xAxisLabel");

function xLabelRefresh() {
  xAxisLabel.attr(
    "transform",
    "translate(" +
      ((width - labelArea) / 2 + labelArea) +
      ", " +
      (height - margin - tPadBot) +
      ")"
  );
}
xLabelRefresh();

xAxisLabel
  .append("text")
  .attr("y", -26)
  .attr("data-name", "poverty")
  .attr("data-axis", "x")
  .attr("class", "aText active x")
  .text("In Poverty (%)");
xAxisLabel
  .append("text")
  .attr("y", 0)
  .attr("data-name", "age")
  .attr("data-axis", "x")
  .attr("class", "aText inactive x")
  .text("Age (Median)");
xAxisLabel
  .append("text")
  .attr("y", 26)
  .attr("data-name", "income")
  .attr("data-axis", "x")
  .attr("class", "aText inactive x")
  .text("Household Income (Median)");

// Specifying the variables like this allows us to make our transform attributes more readable.
var leftTextX = margin + tPadLeft;
var leftTextY = (height + labelArea) / 2 - labelArea;

// Y Axis Label Creation
svg.append("g").attr("class", "yAxisLabel");

var yAxisLabel = d3.select(".yAxisLabel");

function yAxisLabelRefresh() {
  yAxisLabel.attr(
    "transform",
    "translate(" + leftTextX + ", " + leftTextY + ")rotate(-90)"
  );
}
yAxisLabelRefresh();

yAxisLabel
  .append("text")
  .attr("y", -26)
  .attr("data-name", "obesity")
  .attr("data-axis", "y")
  .attr("class", "aText inactive y")
  .text("Obese (%)");

yAxisLabel
  .append("text")
  .attr("x", 0)
  .attr("data-name", "smokes")
  .attr("data-axis", "y")
  .attr("class", "aText inactive y")
  .text("Smokes (%)");

yAxisLabel
  .append("text")
  .attr("y", 26)
  .attr("data-name", "healthcare")
  .attr("data-axis", "y")
  .attr("class", "aText active y")
  .text("Lacks Healthcare (%)");

// Create Graph
function createGraph(stateData) {
  var currentX = "poverty";
  var currentY = "healthcare";

  var xMin;
  var xMax;
  var yMin;
  var yMax;

  // Tooltip creation.
  var toolTip = d3
    .tip()
    .attr("class", "d3-tip")
    .offset([40, -60])
    .html(function (d) {
      var xKey;

      var stateName = "<div>" + d.state + "</div>";

      var yKey = "<div>" + currentY + ": " + d[currentY] + "%</div>";

      if (currentX === "poverty") {
        xKey = "<div>" + currentX + ": " + d[currentX] + "%</div>";
      } else {
        xKey =
          "<div>" +
          currentX +
          ": " +
          parseFloat(d[currentX]).toLocaleString("en") +
          "</div>";
      }
      return stateName + xKey + yKey;
    });

  svg.call(toolTip);

  // Capture X Min and Max
  function xMinMax() {
    xMin = d3.min(stateData, function (d) {
      return parseFloat(d[currentX]) * 0.8;
    });
    xMax = d3.max(stateData, function (d) {
      return parseFloat(d[currentX]) * 1.2;
    });
  }

  // Capture Y min and max
  function yMinMax() {
    yMin = d3.min(stateData, function (d) {
      return parseFloat(d[currentY]) * 0.8;
    });
    yMax = d3.max(stateData, function (d) {
      return parseFloat(d[currentY]) * 1.2;
    });
  }

  // Axes Label Change
  function axislabelChange(axis, clickedText) {
    d3.selectAll(".aText")
      .filter("." + axis)
      .filter(".active")
      .classed("active", false)
      .classed("inactive", true);

    clickedText.classed("inactive", false).classed("active", true);
  }

  xMinMax();
  yMinMax();

  // Axes Scale Creation
  var xScale = d3
    .scaleLinear()
    .domain([xMin, xMax])
    .range([margin + labelArea, width - margin]);

  var yScale = d3
    .scaleLinear()
    .domain([yMin, yMax])
    .range([height - margin - labelArea, margin]);

  var xAxis = d3.axisBottom(xScale);
  var yAxis = d3.axisLeft(yScale);

  // Calculate x and y tick counts.
  function tickCount() {
    if (width <= 500) {
      xAxis.ticks(5);
      yAxis.ticks(5);
    } else {
      xAxis.ticks(10);
      yAxis.ticks(10);
    }
  }
  tickCount();

  svg
    .append("g")
    .call(xAxis)
    .attr("class", "xAxis")
    .attr("transform", "translate(0," + (height - margin - labelArea) + ")");
  svg
    .append("g")
    .call(yAxis)
    .attr("class", "yAxis")
    .attr("transform", "translate(" + (margin + labelArea) + ", 0)");

  var dots = svg.selectAll("g dots").data(stateData).enter();

  //Dot creation
  dots
    .append("circle")
    .attr("cx", function (d) {
      return xScale(d[currentX]);
    })
    .attr("cy", function (d) {
      return yScale(d[currentY]);
    })
    .attr("r", radius)
    .attr("class", function (d) {
      return "stateCircle " + d.abbr;
    })
    .on("mouseover", function (d) {
      toolTip.show(d, this);
      d3.select(this).style("stroke", "#323232");
    })
    .on("mouseout", function (d) {
      toolTip.hide(d);
      d3.select(this).style("stroke", "#e3e3e3");
    });

  //
  dots
    .append("text")
    .text(function (d) {
      return d.abbr;
    })
    .attr("dx", function (d) {
      return xScale(d[currentX]);
    })
    .attr("dy", function (d) {
      return yScale(d[currentY]) + radius / 2.5;
    })
    .attr("font-size", radius)
    .attr("class", "stateText")
    .on("mouseover", function (d) {
      toolTip.show(d);
      d3.select("." + d.abbr).style("stroke", "#323232");
    })
    .on("mouseout", function (d) {
      toolTip.hide(d);
      d3.select("." + d.abbr).style("stroke", "#e3e3e3");
    });

  // Graph Refresh
  d3.selectAll(".aText").on("click", function () {
    // get value of selection
    var value = d3.select(this);
    if (value.classed("inactive")) {
      // Get name and axis saved in label.
      var axis = value.attr("data-axis");
      var name = value.attr("data-name");

      if (axis === "x") {
        currentX = name;

        xMinMax();

        xScale.domain([xMin, xMax]);

        svg.select(".xAxis").transition().duration(dotDelay).call(xAxis);

        // dot refresh
        d3.selectAll("circle").each(function () {
          d3.select(this)
            .transition()
            .attr("cx", function (d) {
              return xScale(d[currentX]);
            })
            .duration(dotDelay);
        });

        d3.selectAll(".stateText").each(function () {
          d3.select(this)
            .transition()
            .attr("dx", function (d) {
              return xScale(d[currentX]);
            })
            .duration(axisDelay);
        });

        axislabelChange(axis, value);
      } else {
        currentY = name;

        yMinMax();

        yScale.domain([yMin, yMax]);

        svg.select(".yAxis").transition().duration(axisDelay).call(yAxis);

        d3.selectAll("circle").each(function () {
          d3.select(this)
            .transition()
            .attr("cy", function (d) {
              return yScale(d[currentY]);
            })
            .duration(dotDelay);
        });

        d3.selectAll(".stateText").each(function () {
          d3.select(this)
            .transition()
            .attr("dy", function (d) {
              return yScale(d[currentY]) + radius / 3;
            })
            .duration(axisDelay);
        });
        axislabelChange(axis, value);
      }
    }
  });
}
