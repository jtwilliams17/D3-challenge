// @TODO: YOUR CODE HERE!
//start with defining svg dimensions
let svgWidth = 960;
let svgHeight = 500;

let axisDelay = 2500;
let circleDely = 2500;

//set the margin
let margin = { top: 20, right: 40, bottom: 80, left: 100 };

//calculate chart Dimension by adjusting the margin
let chartWidth = svgWidth - margin.left - margin.right;
let chartHeight = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart,
// and shift the latter by left and top margins.
let svg = d3
  .select(".chart")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

// Append an SVG group
let chartGroup = svg
  .append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

/********************************************/
d3.csv("assets/data/data.csv", rowConverter)
  .then(createChart)
  .catch(function (error) {
    console.log("*********unexpected error occured*********");
    console.log(error);
  });
/******************************************** */
function rowConverter(row) {
  row.id = +row.id;
  row.state = +row.state;
  row.poverty = +row.poverty;
  row.povertyMoe = +row.povertyMoe;
  row.age = +row.age;
  row.ageMoe = +row.ageMoe;
  row.income = +row.income;
  row.incomeMoe = +row.incomeMoe;
  row.healthcare = +row.healthcare;
  row.healthcareLow = +row.healthcareLow;
  row.healthcareHigh = +row.healthcareHigh;
  row.obesity = +row.obesity;
  row.obesityLow = +row.obesityLow;
  row.obesityHigh = +row.obesityHigh;
  row.smokes = +row.smokes;
  row.smokesLow = +row.smokesLow;
  row.smokesHigh = +row.smokesHigh;

  return row;
}
/********************************************/

function createChart(stateData) {
  console.table(stateData, [
    "id",
    "state",
    "abbr",
    "poverty",
    "povertyMoe",
    "age",
    "ageMoe",
    "income",
    "incomeMoe",
    "healthcare",
    "healthcareLow",
    "healthcareHigh",
    "obesity",
    "obesityLow",
    "obesityHigh",
    "smokes",
    "smokesLow",
    "smokesHigh",
  ]);
  //we store the current chartinformation into activeInfo Object
  let activeInfo = {
    data: stateData,
    currentX: "poverty",
    currentY: "healthcare",
  };

  /*********************************************/

  activeInfo.xScale = d3
    .scaleLinear()
    .domain(getXDomain(activeInfo))
    .range([0, chartWidth]);

  activeInfo.yScale = d3
    .scaleLinear()
    .domain(getYDomain(activeInfo))
    .range([chartHeight, 0]);

  activeInfo.xAxis = d3.axisBottom(activeInfo.xScale);
  activeInfo.yAxis = d3.axisLeft(activeInfo.yScale);

  createAxis(activeInfo);

  // /*********************************************/

  createCircles(activeInfo);

  createToolTip(activeInfo);

  createLables();

  d3.selectAll(".aText").on("click", function (event) {
    console.log(event);
    handleClick(d3.select(this), activeInfo);
  });
}
/********************************************/

function handleClick(label, activeInfo) {
  let axis = label.attr("data-axis");
  let name = label.attr("data-name");

  if (label.classed("active")) {
    //no need to do anything if clicked on active axis
    return;
  }
  updateLabel(label, axis);

  if (axis === "x") {
    activeInfo.currentX = name;
    activeInfo.xScale.domain(getXDomain(activeInfo));
    renderXAxes(activeInfo);
    renderHorizontal(activeInfo);
  } //add logic to handle y axis click
  else {
    activeInfo.currentY = name;
    activeInfo.yScale.domain(getYDomain(activeInfo));
    renderYAxes(activeInfo);
    renderVertical(activeInfo);
  }
}

/********************************************/

function createLables() {
  let xlabelsGroup = chartGroup
    .append("g")
    .attr("class", "xText")
    .attr("transform", `translate(${chartWidth / 2}, ${chartHeight + 20})`);

  xlabelsGroup
    .append("text")
    .attr("x", 0)
    .attr("y", 20)
    .attr("data-name", "poverty")
    .attr("data-axis", "x")
    .attr("class", "aText active x")
    .text("In Poverty (%)");

  xlabelsGroup
    .append("text")
    .attr("x", 0)
    .attr("y", 40)
    .attr("data-name", "age")
    .attr("data-axis", "x")
    .attr("class", "aText inactive x")
    .text("Age (Median)");

  xlabelsGroup
    .append("text")
    .attr("x", 0)
    .attr("y", 60)
    .attr("data-name", "income")
    .attr("data-axis", "x")
    .attr("class", "aText inactive x")
    .text("Household Income (Median)");

  let ylabelsGroup = chartGroup
    .append("g")
    .attr("class", "yText")
    .attr("transform", `translate(-60 , ${chartHeight / 2}) rotate(-90)`);

  ylabelsGroup
    .append("text")
    .attr("y", 0)
    // .attr("x", -chartHeight / 2)
    .attr("dy", "1em")
    .attr("data-name", "healthcare")
    .attr("data-axis", "y")
    .attr("class", "aText active y")
    .text("Lacks Healthcare (%)");

  ylabelsGroup
    .append("text")
    .attr("y", -20)
    // .attr("x", -chartHeight / 2)
    .attr("dy", "1em")
    .attr("data-name", "smokes")
    .attr("data-axis", "y")
    .attr("class", "aText active y")
    .text("Smokes (%)");

  ylabelsGroup
    .append("text")
    .attr("y", -40)
    // .attr("x", -chartHeight / 2)
    .attr("dy", "1em")
    .attr("data-name", "obesity")
    .attr("data-axis", "y")
    .attr("class", "aText active y")
    .text("Obese (%)");
}
/********************************************/
function createCircles(activeInfo) {
  let currentX = activeInfo.currentX;
  let currentY = activeInfo.currentY;
  let xScale = activeInfo.xScale;
  let yScale = activeInfo.yScale;

  chartGroup
    .selectAll("circle")
    .data(activeInfo.data)
    .enter()
    .append("circle")
    .attr("cx", (d) => xScale(d[currentX]))
    .attr("cy", (d) => yScale(d[currentY]))
    .attr("r", 15)
    .attr("fill", "lightblue");
}
/********************************************/

function createAxis(activeInfo) {
  chartGroup.append("g").call(activeInfo.yAxis).attr("class", "y-axis");

  chartGroup
    .append("g")
    .call(activeInfo.xAxis)
    .attr("class", "x-axis")
    .attr("transform", `translate(0, ${chartHeight})`);
}

/********************************************/
function renderXAxes(activeInfo) {
  chartGroup
    .select(".x-axis")
    .transition()
    .duration(axisDelay)
    .call(activeInfo.xAxis);
}
/********************************************/
function renderYAxes() {
  chartGroup
    .select(".y-axis")
    .transition()
    .duration(axisDelay)
    .call(activeInfo.yAxis);
}

/********************************************/
function getXDomain(activeInfo) {
  let min = d3.min(activeInfo.data, (d) => d[activeInfo.currentX]);
  let max = d3.max(activeInfo.data, (d) => d[activeInfo.currentX]);
  return [min * 0.8, max * 1.2];
}
/********************************************/
function getYDomain(activeInfo) {
  let min = 0;
  d3.min(activeInfo.data, (d) => d[activeInfo.currentY]);
  let max = d3.max(activeInfo.data, (d) => d[activeInfo.currentY]);
  return [min, max];
}
/********************************************/

function renderHorizontal(activeInfo) {
  d3.selectAll("circle").each(adjustCircles);

  function adjustCircles() {
    d3.select(this)
      .transition()
      .attr("cx", (d) => activeInfo.xScale(d[activeInfo.currentX]))
      .duration(circleDely);
  }
}

/********************************************/
function renderVertical(activeInfo) {
  d3.selectAll("circle").each(function () {
    d3.select(this)
      .transition()
      .attr("cy", (d) => activeInfo.yScale(d[activeInfo.currentY]))
      .duration(circleDely);
  });
}

/********************************************/

function updateLabel(label, axis) {
  d3.selectAll(".aText")
    .filter("." + axis)
    .filter(".active")
    .classed("active", false)
    .classed("inactive", true);

  label.classed("inactive", false).classed("active", true);
}

/********************************************/

function createToolTip(activeInfo) {
  let label = "In Poverty (%):";

  if (activeInfo.currentX === "poverty") {
    label = "In Poverty (%):";
  } elseif (activeInfo.currentX === "age") {
    label = "Age (Median):";
  } else {
    label = "Household Income (Median):"
  }

  let toolTip = d3
    .tip()
    .attr("class", "tooltip")
    .offset([80, -60])
    .html(function (event, d) {
      let html =
        d.rockband +
        "<br> " +
        label +
        d[activeInfo.currentX] +
        "<br> Number of Hits: " +
        d[activeInfo.currentY];
      return html;
    });

  chartGroup.call(toolTip);

  let circles = d3.selectAll("circle");

  circles.on("mouseover", toolTip.show);

  circles.on("mouseout", toolTip.hide);
}

/********************************************/
