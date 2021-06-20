var xOptions = ["poverty", "age", "income"];

var yOptions = ["healthcare", "smokes", "obesity"];

var tool_tip_suffixes = {
  poverty: "%",
  age: " years",
  income: " $/year",
  healthcare: "%",
  smokes: "%",
  obesity: "%"
};

function makeResponsive() {

  var svgArea = d3.select("body").select("svg");

  if (!svgArea.empty()) {
  svgArea.remove();
  }

  // Define SVG area dimensions
  var svgWidth = window.innerWidth*.85;
  var svgHeight = window.innerHeight*.8;

  // Define the chart's margins as an object
  var chartMargin = {
   top: 30,
   right: 50,
    bottom: 125,
    left: 100
  };

  // Define dimensions of the chart area
  var chartWidth = svgWidth - chartMargin.left - chartMargin.right;
  var chartHeight = svgHeight - chartMargin.top - chartMargin.bottom;


  // Select body, append SVG area to it, and set the dimensions
  var svg = d3
    .select("#scatter")
    .append("svg")
    .attr("height", svgHeight)
    .attr("width", svgWidth);

  // group for axis labels

  var labelsGroup = svg.append("g")
    .attr("transform", `translate(${chartMargin.left}, ${chartMargin.top})`);

  // creating axis labels

  var xLabels = labelsGroup.append("g")
    .attr("transform", `translate(${chartWidth / 2}, ${chartHeight})`);

  xLabels.append("text")
    .attr("dy", "2.5em")
    .classed("active", true)
    .style('text-anchor', 'middle')  //https://stackoverflow.com/questions/16620267/how-to-center-text-in-a-rect-element-in-d3
    .text("% In Poverty")
    .attr("value", "poverty");

  xLabels.append("text")
    .attr("dy", "4em")
    .classed("inactive", true)
    .style('text-anchor', 'middle') 
    .text("Median Age")
    .attr("value", "age");

  xLabels.append("text")
    .attr("dy", "5.5em")
    .classed("inactive", true)
    .style('text-anchor', 'middle') 
    .text("Median Household Income")
    .attr("value", "income");

  var yLabels = labelsGroup.append("g")
    .attr("transform",`rotate(-90) translate(-${chartHeight/2}, 0)`); // https://groups.google.com/g/d3-js/c/8iS5OdLjUuM?pli=1
    
  yLabels.append("text")
    .attr("dy", "-2em")
    .classed("active", true)
    .style('text-anchor', 'middle')
    .text("% Lacking Healthcare")
    .attr("value", "healthcare");

  yLabels.append("text")
    .attr("dy", "-3.5em")
    .classed("inactive", true)
    .style('text-anchor', 'middle')
    .text("% Smoke")
    .attr("value", "smokes");

  yLabels.append("text")
    .attr("dy", "-5em")
    .classed("inactive", true)
    .style('text-anchor', 'middle')
    .text("% Obese")
    .attr("value", "obesity");

  // initial x and y selections

  var xSelection = "poverty";
  var ySelection = "healthcare";

  var chartGroup = svg.append("g")
    .attr("transform", `translate(${chartMargin.left}, ${chartMargin.top})`);

  // reading in data

  d3.csv("assets/data/data.csv").then(function(data) {
    console.log(data);
    
    function makeGraph() {

      // clearing contents from the svg https://stackoverflow.com/questions/10784018/how-can-i-remove-or-replace-svg-content

      chartGroup.selectAll("*").remove();

      // y scale using y axis variable
      var yData = data.map(d=>parseFloat(d[ySelection]));

      var yScale = d3.scaleLinear()
        .domain([d3.min(yData)-2, d3.max(yData)+2])
        .range([chartHeight, 0]);

      //x scale using x axis variable

      var xData = data.map(d=>parseFloat(d[xSelection]));

      var xScale = d3.scaleLinear()
        .domain([d3.min(xData)*.95, d3.max(xData)*1.03])
        .range([0, chartWidth]);

      //drawing axes

      var yAxis = d3.axisLeft(yScale);
      var xAxis = d3.axisBottom(xScale);

      chartGroup.append("g")
        .call(yAxis);

      chartGroup.append("g")
        .attr("transform", `translate(0, ${chartHeight})`)
        .call(xAxis);

      //state abbreviations using the d3 annotations library, code from here: https://bl.ocks.org/susielu/625aa4814098671290a8c6bb88a6301e

      var badgeAnnotations = data.map(d => {return {
        subject: {
          text: d.abbr,
          radius: 10
        },
        color: "#5B8E7D",
        type: d3.annotationBadge,
        x: xScale(parseFloat(d[xSelection])),
        y: yScale(parseFloat(d[ySelection]))
      }
      });
        
      var makeAnnotations = d3
        .annotation()
        .type(d3.annotationLabel)
        .annotations([...badgeAnnotations])
        
      chartGroup.append("g")
        .attr("class", "annotation-group")
        .call(makeAnnotations);

      // setting up tool tips

      var tool_tip = d3.tip()
        .attr("class", "d3-tip")
        .offset([-8, 0])
        .html(d=>`<strong>${d.state}</strong><br>${xSelection}: ${d[xSelection]}${tool_tip_suffixes[xSelection]}<br>${ySelection}: ${d[ySelection]}${tool_tip_suffixes[ySelection]}`);
      chartGroup.call(tool_tip);


      // invisible circles for the tooltips to attach to because I couldn't get them to attach to the annotations (;｀O´)o

      chartGroup.selectAll("circle")
      .data(data)
      .enter()
      .append("circle")
      .attr("r", 10)
      .attr("opacity", "0")
      .attr("cx", d => xScale(parseFloat(d[xSelection])))
      .attr("cy", d => yScale(parseFloat(d[ySelection])))
      .on('mouseover', tool_tip.show)
      .on('mouseout', tool_tip.hide);

    };

    makeGraph();

    // x axis event listener

    xLabels.selectAll("text").on("click", function() {

      xSelection = d3.select(this).attr("value");

      xOptions.forEach(function(option) {
        if (xSelection == option) {
          xLabels.selectAll(`[value = ${option}]`)
            .attr("class", "active") //using .attr instead of .classed because I do want to overwrite the previous class
        }
        else{xLabels.selectAll(`[value = ${option}]`)
        .attr("class", "inactive")}
      });

      makeGraph();
    });

    //y axis event listener

    yLabels.selectAll("text").on("click", function() {

      ySelection = d3.select(this).attr("value");

      yOptions.forEach(function(option) {
        if (ySelection == option) {
          yLabels.selectAll(`[value = ${option}]`)
           .attr("class", "active") //using .attr instead of .classed because I do want to overwrite the previous class
        }
        else{yLabels.selectAll(`[value = ${option}]`)
          .attr("class", "inactive")}
      });

      makeGraph();
    });
  });

}

makeResponsive();

// window size event listener

d3.select(window).on("resize", makeResponsive);