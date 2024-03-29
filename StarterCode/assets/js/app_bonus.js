//define SVG size
var svgWidth = 960;
var svgHeight = 500;

//define margins for SVG
var margin = {
  top: 20,
  right: 40,
  bottom: 80,
  left: 100
};

//define drawing area
var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

//Create an SVG wrapper, append an SVG group that will hold our chart,
//and shift the latter by left and top margins.
var svg = d3.select("#scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

//Append an SVG group
var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

//Initial Params load
var chosenXAxis = "poverty";
var chosenYAxis = "healthcare";

//function used for updating x-scale var upon click on axis label
function xScale(DabblerData, chosenXAxis) {
  // create scales
  var xLinearScale = d3.scaleLinear()
    .domain([d3.min(DabblerData, d => d[chosenXAxis]) * 0.8,
      d3.max(DabblerData, d => d[chosenXAxis]) * 1.2
    ])
    .range([0, width]);

  return xLinearScale;
}

//function used for updating y-scale var upon click on axis label
function yScale(DabblerData, chosenYAxis) {
    // create scales
    var yLinearScale = d3.scaleLinear()
      .domain([d3.min(DabblerData, d => d[chosenYAxis]) * 0.8,
        d3.max(DabblerData, d => d[chosenYAxis]) * 1.2
      ])
      .range([height, 0]);
  
    return yLinearScale;  
  }

//function used for updating xAxis var upon click on axis label
function renderXAxes(newXScale, xAxis) {
  var bottomAxis = d3.axisBottom(newXScale);

  xAxis.transition()
    .duration(1000)
    .call(bottomAxis);

  return xAxis;
}

//function used for updating yAxis var upon click on axis label
function renderYAxes(newYScale, yAxis) {
    var sideAxis = d3.axisLeft(newYScale);
  
    yAxis.transition()
      .duration(1000)
      .call(sideAxis);
  
    return yAxis;
  }
  
//function used for updating circles group with a transition to new circles
function renderCircles(circlesGroup, newXScale, newYScale, chosenXaxis, chosenYAxis) {

  circlesGroup.transition()
    .duration(1000)
    .attr("cx", d => newXScale(d[chosenXAxis]))
    .attr("cy", d => newYScale(d[chosenYAxis]));

  return circlesGroup;
}

//function used for updating text in circles group with a transition to new text
function renderStateText(textGroup, newXScale, newYScale, chosenXaxis, chosenYAxis) {

    textGroup.transition()
    .duration(1000)
    .attr("x", d => newXScale(d[chosenXAxis]))
    .attr("y", d => newYScale(d[chosenYAxis]));

  return textGroup;
}

//function used for updating circles group with new tooltip
function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup) {
  
  //Update Xaxis tooltip labels 
  if (chosenXAxis === "poverty") {
    var xlabel_tip = "Poverty:";
  } else if (chosenXAxis === "age") {
    var xlabel_tip = "Age:";
  } else {
    var xlabel_tip = "Income:";
  }
  
  //Update Yaxis tooltip labels 
  if (chosenYAxis === "healthcare") {
    var ylabel_tip = "Healthcare:";
  } else if (chosenYAxis === "smokes") {
    var ylabel_tip = "Smokes:";
  } else {
    var ylabel_tip = "Obesity:";
  }

  //define tooltip variable displaying State, chosen Xaxis and Yaxis labels value
  var toolTip = d3.tip()
    .attr("class", "d3-tip")
    .offset([-8, 0])
    .html(function(d) {
      if (chosenXAxis === "age") {
        //display Years Old for Xaxis if Age
        return (`${d.state} <br> ${xlabel_tip} ${d[chosenXAxis]} yrs old <br> ${ylabel_tip} ${d[chosenYAxis]}%`);
      } else if (chosenXAxis !== "poverty" && chosenXAxis !== "age") {
        //display $ for Xaxis if Income
        return (`${d.state} <br> ${xlabel_tip} $ ${d[chosenXAxis]} <br> ${ylabel_tip} ${d[chosenYAxis]}%`);
      } else {
        //display % for others
        return (`${d.state} <br> ${xlabel_tip} ${d[chosenXAxis]}% <br> ${ylabel_tip} ${d[chosenYAxis]}%`);
      }      
    });

  //Call tooltip
  circlesGroup.call(toolTip);
  
  //handler to display info when mouse hover over circle
  circlesGroup.on("mouseover", function(data) {
    toolTip.show(data);
  })
    // onmouseout event, hide info
    .on("mouseout", function(data, index) {
      toolTip.hide(data);
    });

  return circlesGroup;
}

//Retrieve data from the CSV file and execute everything below
d3.csv("assets/data/data.csv")
  .then(function(DabblerData) {

  //parse data
  DabblerData.forEach(function(data) {
    data.poverty = +data.poverty;
    data.age = +data.age;
    data.income = +data.income;
    data.healthcare = +data.healthcare;
    data.obesity = +data.obesity;
    data.smokes = +data.smokes;
  });

  //Create x scale function
  var xLinearScale = xScale(DabblerData, chosenXAxis);

  //Create y scale function
  var yLinearScale = yScale(DabblerData, chosenYAxis);

  //Create initial bottom and left axis functions
  var bottomAxis = d3.axisBottom(xLinearScale);
  var leftAxis = d3.axisLeft(yLinearScale);

  //append x axis
  var xAxis = chartGroup.append("g")
    .classed("x-axis", true)
    .attr("transform", `translate(0, ${height})`)
    .call(bottomAxis);

  //append y axis
  var yAxis = chartGroup.append("g")
    .classed("y-axis", true)
    .attr("transform", `translate(0-${width}, 0)`)
    .call(leftAxis);

  //append initial circles
  var circlesGroup = chartGroup.selectAll("circle")
    .data(DabblerData)
    .enter()
    .append("circle")
    .attr("cx", d => xLinearScale(d[chosenXAxis]))
    .attr("cy", d => yLinearScale(d[chosenYAxis]))
    .attr("r", 15)
    .attr("fill", "blue")
    .attr("opacity", ".5");

  //define State Abbr text struct and load initial chosen params
  var textGroup = chartGroup.selectAll("text.state")
    .data(DabblerData)
    .enter()
    .append("text")
    .classed("text.state", true)
    .text((d) => d.abbr)
    .attr("x", d => xLinearScale(d[chosenXAxis]))
    .attr("y", d => yLinearScale(d[chosenYAxis]))
    .attr("text-anchor", "middle")
    .attr("font-size", 10)
    .attr("dy","0.35em")
    .attr("fill", "white")
    .attr("opacity", "5");  
  
  //Create group for  x- axis labels
  var labelsGroup = chartGroup.append("g")
    .attr("transform", `translate(${width / 2}, ${height + 20})`);

  //Create poverty label
  var povertyLabel = labelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 20)
    .attr("value", "poverty") // value to grab for event listener
    .classed("active", true)
    .text("In Poverty (%)");

  //Create age label
  var ageLabel = labelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 40)
    .attr("value", "age") // value to grab for event listener
    .classed("inactive", true)
    .text("Age (Median)");

  //Create income label
  var incomeLabel = labelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 60)
    .attr("value", "income") // value to grab for event listener
    .classed("inactive", true)
    .text("Household (Median)");

  //Create healthcare label
  var healthcareLabel = labelsGroup.append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", 0+(margin.left)*2)
    .attr("y", 0-(height+60))
    .attr("dy", "1em")
    .attr("value", "healthcare") // value to grab for event listener
    .classed("active", true)
    .text("Lacks Healthcare (%)");

  //Create smokes label
  var smokesLabel = labelsGroup.append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", 0+(margin.left)*2)
    .attr("y", 0-(height+80))
    .attr("dy", "1em")
    .attr("value", "smokes") // value to grab for event listener
    .classed("inactive", true)
    .text("Smokes (%)");

  //Create obesity label
  var obeseLabel = labelsGroup.append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", 0+(margin.left)*2)
    .attr("y", 0-(height+100))
    .attr("dy", "1em")
    .attr("value", "obesity") // value to grab for event listener
    .classed("inactive", true)
    .text("Obese (%)");

  //updateToolTip function above csv import
  var circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

  //x axis labels event listener
  labelsGroup.selectAll("text")
    .on("click", function() {

      // get value of selection
      var value = d3.select(this).attr("value");

      if (1) {
        // replaces chosenXAxis with value
        if (value === "poverty" || value === "age" || value === "income") {
          chosenXAxis = value;
          
          // functions here found above csv import
          // updates x scale for new data
          xLinearScale = xScale(DabblerData, chosenXAxis);
          
          // updates x axis with transition
          xAxis = renderXAxes(xLinearScale, xAxis);
          
          // to enable and disable labels for each Axis depending which is selected. Alter only one axis at a time
          if (chosenXAxis === "poverty") {
            povertyLabel
              .classed("active", true)
              .classed("inactive", false);
            ageLabel
              .classed("active", false)
              .classed("inactive", true);
            incomeLabel
              .classed("active", false)
              .classed("inactive", true);
          } else if (chosenXAxis === "age") {
            povertyLabel
            .classed("active", false)
            .classed("inactive", true);
            ageLabel
            .classed("active", true)
            .classed("inactive", false);
            incomeLabel
            .classed("active", false)
            .classed("inactive", true);  
          } else {
            povertyLabel
            .classed("active", false)
            .classed("inactive", true);
            ageLabel
            .classed("active", false)
            .classed("inactive", true);
            incomeLabel
            .classed("active", true)
            .classed("inactive", false);
          }
        } else {
          chosenYAxis = value;
          yLinearScale = yScale(DabblerData, chosenYAxis);        
          yAxis = renderYAxes(yLinearScale, yAxis);
          if (chosenYAxis === "obesity") {
            obeseLabel
              .classed("active", true)
              .classed("inactive", false);
            smokesLabel
              .classed("active", false)
              .classed("inactive", true);
            healthcareLabel
              .classed("active", false)
              .classed("inactive", true);
          } else if (chosenYAxis === "smokes") {
            obeseLabel
            .classed("active", false)
            .classed("inactive", true);
            smokesLabel
            .classed("active", true)
            .classed("inactive", false);
            healthcareLabel
            .classed("active", false)
            .classed("inactive", true);  
          } else {
            obeseLabel
            .classed("active", false)
            .classed("inactive", true);
            smokesLabel
            .classed("active", false)
            .classed("inactive", true);
            healthcareLabel
            .classed("active", true)
            .classed("inactive", false);
          }
        }

        //updates circles with new x, y values
        circlesGroup = renderCircles(circlesGroup, xLinearScale, yLinearScale, chosenXAxis, chosenYAxis);

        //updates text State Abbr with new x, y values
        textGroup = renderStateText(textGroup, xLinearScale, yLinearScale, chosenXAxis, chosenYAxis);

        //updates tooltips with new info
        circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);
      }
    });
});
