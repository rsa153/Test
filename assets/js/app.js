// create path to data
var path = "assets/data/data.csv";

// set height and width of svg
var svgWidth = 960;
var svgHeight = 500;

// set margins
var margin = {
    top: 30,
    right: 50,
    bottom: 80,
    left: 100
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// create svg wrapper

var svg = d3
    .select("#chart")
    .append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight);

var chart = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

var xAxis = "age";

function scale(data, xAxis) {

    var xScale = d3.scaleLinear()
        .domain([d3.min(data, d => d[xAxis]) * 0.8,
        d3.max(data, d => d[xAxis]) * 1.2
        ])
        .range([0, width]);

    return xScale;

}

function createAxes(newXScale, xAxis1) {
    var axisBottom = d3.axisBottom(newXScale);

    xAxis1.transition()
        .duration(1000)
        .call(axisBottom);

    return xAxis1;
}

function createCircles(circleGroup, newXScale, xAxis) {

    circleGroup.transition()
        .duration(1000)
        .attr("cx", d => newXScale(d[xAxis]));

    return circleGroup;
}

function createText(text, newXScale, xAxis) {

    text.transition()
        .duration(1000)
        .attr("x", d => newXScale(d[xAxis]));

    return text;
}

function utoolTip(xAxis, circleGroup) {

    var label;

    if (xAxis === "age") {
        label = "Age:";
    }
    else {
        label = "Income:";
    }

    var toolTip = d3.tip()
        .attr("class", "d3-tip")
        .offset([0, 0])
        .html(function (d) {
            return (`${d.state}<br>${d[xAxis]}%`);
        });

    circleGroup.call(toolTip);

    circleGroup.on("mouseover", function (data) {
        toolTip.show(data, this);
    })

        .on("mouseout", function (data) {
            toolTip.hide(data, this);
        });

    return circleGroup;
}

d3.csv("assets/data/data.csv").then(function (data, err) {
    if (err) throw err;

    data.forEach(function (data) {
        data.age = +data.age;
        data.income = +data.income;
        data.smokes = +data.smokes;
    });

    // create axis functions and append axis

    var xScale = scale(data, xAxis);

    var yScale = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.smokes)])
        .range([height, 0]);

    var bottomAxis = d3.axisBottom(xScale);
    var leftAxis = d3.axisLeft(yScale);

    var xAxis1 = chart.append("g")
        .classed("x-axis", true)
        .attr("transform", `translate(0, ${height})`)
        .call(bottomAxis);

    chart.append("g").call(leftAxis);

    var circleGroup = chart.selectAll("circle")
        .data(data)
        .enter()
        .append("circle")
        .attr("class", "stateCircle")
        .attr("cx", d => xScale(d[xAxis]))
        .attr("cy", d => yScale(d.smokes))
        .attr("r", 20);

    var text = chart.selectAll("text")
        .data(data)
        .enter()
        .append("text")
        .attr("class", "stateText")
        .attr("x", d => xScale(d[xAxis]))
        .attr("y", d => yScale(d.smokes))
        .text(function (d) { return d.abbr; });

    var labels = chart.append("g")
        .attr("transform", `translate(${width / 2}, ${height + 20})`);

    var age = labels.append("text")
        .attr("x", 0)
        .attr("y", 20)
        .attr("value", "age") // value to grab for event listener
        .classed("active", true)
        .text("Average Age (Years)");

    var income = labels.append("text")
        .attr("x", 0)
        .attr("y", 40)
        .attr("value", "income") // value to grab for event listener
        .classed("inactive", true)
        .text("Average Income ($)");

    chart.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left)
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        .classed("aText", true)
        .text("Smokes (%)");

    var circleGroup = uToolTip(xAxis, circleGroup);

    labels.selectAll("text")
    .on("click", function() {
      
      var value = d3.select(this).attr("value");
      if (value !== xAxis) {

        xAxis = value;

        xScale = scale(data, xAxis);

        xAxis1 = createAxes(xScale, xAxis1);

        circleGroup = createCircles(circleGroup, xScale, xAxis);

        circleGroup = uToolTip(xAxis, circleGroup);

        text = createText(text, xScale, xAxis);
        text = uToolTip(xAxis, text);

        if (xAxis === "income") {
            income
              .classed("active", true)
              .classed("inactive", false);
            age
              .classed("active", false)
              .classed("inactive", true);
          }
          else {
            income
              .classed("active", false)
              .classed("inactive", true);
            age
              .classed("active", true)
              .classed("inactive", false);
          }
      }
    });
}).catch(function(error) {
  console.log(error);
});
