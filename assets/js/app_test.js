//start with defining svg dimensions
var svgWidth = 960;
var svgHeight = 500;
var textsize = parseInt(svgWidth * 0.009);

let axisDelay = 2500;
let circleDelay = 2500;

//set the margin
var margin = {
  top: 20,
  right: 40,
  bottom: 80,
  left: 100,
};

//calculate chart Dimension by adjusting the margin
var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart,
// and shift the latter by left and top margins.
var svg = d3
  .select("#scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

// Append an SVG group
var chartGroup = svg
  .append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Initial Params
var chosenXAxis = "poverty";

var chosenYAxis = "healthcare";

// function used for updating x-scale var upon click on axis label
function xScale(stateData, chosenXAxis) {
  // create scales
  var xLinearScale = d3
    .scaleLinear()
    .domain([
      d3.min(stateData, (d) => d[chosenXAxis]) * 0.8,
      d3.max(stateData, (d) => d[chosenXAxis]) * 1.2,
    ])
    .range([0, width]);

  return xLinearScale;
}

// function used for updating y-scale var upon click on axis label
function yScale(stateData, chosenYAxis) {
  // create scales
  var yLinearScale = d3
    .scaleLinear()
    .domain([
      d3.min(stateData, (d) => d[chosenYAxis]) * 0.8,
      d3.max(stateData, (d) => d[chosenYAxis]) * 1.2,
    ])
    .range([height, 0]);

  return yLinearScale;
}

// function used for updating xAxis var upon click on axis label
function renderXAxes(newXScale, xAxis) {
  var bottomAxis = d3.axisBottom(newXScale);

  xAxis.transition().duration(axisDelay).call(bottomAxis);

  return xAxis;
}

// function used for updating xAxis var upon click on axis label
function renderYAxes(newYScale, yAxis) {
  var leftAxis = d3.axisLeft(newYScale);

  yAxis.transition().duration(axisDelay).call(leftAxis);

  return yAxis;
}

// function used for updating circles group with a transition to
// new circles
function renderCircles(
  circlesGroup,
  newXScale,
  chosenXAxis,
  newYScale,
  chosenYAxis
) {
  circlesGroup
    .transition()
    .duration(circleDelay)
    .attr("cx", (d) => newXScale(d[chosenXAxis]))
    .attr("cy", (d) => newYScale(d[chosenYAxis]));

  return circlesGroup;
}

// function used for updating abrreviations on circles
function renderAbbr(abbrGroup, newXScale, chosenXAxis, newYScale, chosenYAxis) {
  abbrGroup
    .transition()
    .duration(circleDelay)
    .attr("x", (d) => newXScale(d[chosenXAxis]))
    .attr("y", (d) => newYScale(d[chosenYAxis]));

  return abbrGroup;
}

// function used for updating circles group with new tooltip
function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup) {
  var xlabel;
  var ylabel;

  if (chosenXAxis === "poverty") {
    xlabel = "In Poverty (%):";
  } else if (chosenXAxis === "age") {
    xlabel = "Age:";
  } else {
    xlabel = "Household Income:";
  }

  if (chosenYAxis === "healthcare") {
    ylabel = "Lacks Healthcare (%):";
  } else if (chosenYAxis === "smokes") {
    ylabel = "Smokes (%):";
  } else {
    ylabel = "Obese (%):";
  }

  var toolTip = d3
    .tip()
    .attr("class", "tooltip")
    .offset([80, -60])
    .html(function (d) {
      return `${d.state}<br>${xlabel} ${d[chosenXAxis]}<br>${ylabel} ${d[chosenYAxis]}`;
    });

  circlesGroup.call(toolTip);

  circlesGroup
    .on("mouseover", function (data) {
      toolTip.show(data);
    })
    // onmouseout event
    .on("mouseout", function (data, index) {
      toolTip.hide(data);
    });

  return circlesGroup;
}

// Retrieve data from the CSV file and execute everything below
d3.csv("assets/data/data.csv")
  .then(function (stateData, err) {
    if (err) throw err;

    // parse data
    stateData.forEach(function (data) {
      data.id = +data.id;
      data.state = +data.state;
      data.poverty = +data.poverty;
      data.povertyMoe = +data.povertyMoe;
      data.age = +data.age;
      data.ageMoe = +data.ageMoe;
      data.income = +data.income;
      data.incomeMoe = +data.incomeMoe;
      data.healthcare = +data.healthcare;
      data.healthcareLow = +data.healthcareLow;
      data.healthcareHigh = +data.healthcareHigh;
      data.obesity = +data.obesity;
      data.obesityLow = +data.obesityLow;
      data.obesityHigh = +data.obesityHigh;
      data.smokes = +data.smokes;
      data.smokesLow = +data.smokesLow;
      data.smokesHigh = +data.smokesHigh;
    });

    // xLinearScale function above csv import
    var xLinearScale = xScale(stateData, chosenXAxis);

    // yLinearScale function above csv import
    var yLinearScale = yScale(stateData, chosenYAxis);

    // Create initial axis functions
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);

    // append x axis
    var xAxis = chartGroup
      .append("g")
      .classed("x-axis", true)
      .attr("transform", `translate(0, ${height})`)
      .call(bottomAxis);

    // append y axis
    var yAxis = chartGroup.append("g").classed("y-axis", true).call(leftAxis);

    // append initial circles
    var circlesGroup = chartGroup
      .selectAll("circle")
      .data(stateData)
      .enter()
      .append("circle")
      .attr("cx", (d) => xLinearScale(d[chosenXAxis]))
      .attr("cy", (d) => yLinearScale(d[chosenYAxis]))
      .attr("r", 20)
      .attr("fill", "lightblue");

    //   append initial abbreviations
    var abbrGroup = chartGroup
      .selectAll("text")
      .exit()
      .data(stateData)
      .enter()
      .append("text")
      .attr("x", (d) => xLinearScale(d[chosenXAxis]))
      .attr("y", (d) => yLinearScale(d[chosenYAxis]))
      .attr("font-size", textsize + "px")
      .attr("text-anchor", "middle")
      .attr("class", "stateText");

    circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

    // Create group for three x-axis labels
    var xlabelsGroup = chartGroup
      .append("g")
      .attr("transform", `translate(${width / 2}, ${height + 20})`);

    var statePovertyLabel = xlabelsGroup
      .append("text")
      .attr("x", 0)
      .attr("y", 20)
      .attr("class", "axis-text-x")
      .attr("value", "poverty")
      .classed("active", true)
      .text("In Poverty (%)");

    var stateAgeLabel = xlabelsGroup
      .append("text")
      .attr("x", 0)
      .attr("y", 40)
      .attr("class", "axis-text-x")
      .attr("value", "age")
      .classed("inactive", true)
      .text("Age (Median)");

    var stateIncomeLabel = xlabelsGroup
      .append("text")
      .attr("x", 0)
      .attr("y", 60)
      .attr("class", "axis-text-x")
      .attr("value", "income")
      .classed("inactive", true)
      .text("Household Income (Median)");

    // Create group for three y-axis labels
    var ylabelsGroup = chartGroup.append("g");

    var stateHealthcareLabel = ylabelsGroup
      .append("text")
      .attr("transform", `translate(-40,${height / 2})rotate(-90)`)
      .attr("dy", "1em")
      .attr("class", "axis-text-y")
      .classed("axis-text", true)
      .attr("value", "healthcare")
      .classed("active", true)
      .text("Lack of Healthcare (%)");

    var stateSmokesLabel = ylabelsGroup
      .append("text")
      .attr("transform", `translate(-60,${height / 2})rotate(-90)`)
      .attr("dy", "1em")
      .attr("class", "axis-text-y")
      .attr("value", "smokes")
      .classed("inactive", true)
      .text("Smokes (%)");

    var stateObesityLabel = ylabelsGroup
      .append("text")
      .attr("transform", `translate(-80,${height / 2})rotate(-90)`)
      .attr("dy", "1em")
      .attr("class", "axis-text-y")
      .attr("value", "obesity")
      .classed("inactive", true)
      .text("Obesity (%)");

    // x axis labels event listener
    xlabelsGroup.selectAll(".axis-text-x").on("click", function () {
      // get value of selection
      var value = d3.select(this).attr("value");
      if (value !== chosenXAxis) {
        // replaces chosenXAxis with value
        chosenXAxis = value;

        // functions here found above csv import
        // updates x scale for new data
        xLinearScale = xScale(stateData, chosenXAxis);

        // functions here found above csv import
        // updates y scale for new data
        yLinearScale = yScale(stateData, chosenYAxis);

        // updates x axis with transition
        xAxis = renderXAxes(xLinearScale, xAxis);

        // updates circles with new values
        circlesGroup = renderCircles(
          circlesGroup,
          xLinearScale,
          yLinearScale,
          chosenXAxis,
          chosenYAxis
        );

        // updates abbreviations with new values
        abbrGroup = renderAbbr(
          circlesGroup,
          xLinearScale,
          yLinearScale,
          chosenXAxis,
          chosenYAxis
        );

        // updates tooltips with new info
        circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

        // changes classes to change bold text
        if (chosenXAxis === "age") {
          statePovertyLabel.classed("active", false).classed("inactive", true);
          stateAgeLabel.classed("active", true).classed("inactive", false);
          stateIncomeLabel.classed("active", false).classed("inactive", true);
        } else if (chosenXAxis === "poverty") {
          statePovertyLabel.classed("active", true).classed("inactive", false);
          stateAgeLabel.classed("active", false).classed("inactive", true);
          stateIncomeLabel.classed("active", false).classed("inactive", true);
        } else {
          statePovertyLabel.classed("active", false).classed("inactive", true);
          stateAgeLabel.classed("active", false).classed("inactive", true);
          stateIncomeLabel.classed("active", true).classed("inactive", false);
        }
      }
    });

    // y axis labels event listener
    ylabelsGroup.selectAll(".acis-text-y").on("click", function () {
      // get value of selection
      var value = d3.select(this).attr("value");
      if (value !== chosenYAxis) {
        // replaces chosenXAxis with value
        chosenYAxis = value;

        // functions here found above csv import
        // updates x scale for new data
        xLinearScale = xScale(stateData, chosenXAxis);

        // functions here found above csv import
        // updates y scale for new data
        yLinearScale = yScale(stateData, chosenYAxis);

        // updates y axis with transition
        yAxis = renderYAxes(yLinearScale, yAxis);

        // updates circles with new values
        circlesGroup = renderCircles(
          circlesGroup,
          xLinearScale,
          yLinearScale,
          chosenXAxis,
          chosenYAxis
        );

        // updates abbreviations with new values
        abbrGroup = renderAbbr(
          circlesGroup,
          xLinearScale,
          yLinearScale,
          chosenXAxis,
          chosenYAxis
        );

        // updates tooltips with new info
        circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

        // changes classes to change bold text
        if (chosenYAxis === "healthcare") {
          stateHealthcareLabel
            .classed("active", true)
            .classed("inactive", false);
          stateSmokesLabel.classed("active", false).classed("inactive", true);
          stateObesityLabel.classed("active", false).classed("inactive", true);
        } else if (chosenYAxis === "smokes") {
          stateHealthcareLabel
            .classed("active", false)
            .classed("inactive", true);
          stateSmokesLabel.classed("active", true).classed("inactive", false);
          stateObesityLabel.classed("active", false).classed("inactive", true);
        } else {
          stateHealthcareLabel
            .classed("active", false)
            .classed("inactive", true);
          stateSmokesLabel.classed("active", false).classed("inactive", true);
          stateObesityLabel.classed("active", true).classed("inactive", flase);
        }
      }
    });
  })
  .catch(function (error) {
    console.log(error);
  });
