// @TODO: YOUR CODE HERE!

// When the browser window is resized, makeResponsive() is called.
d3.select(window).on("resize", makeResponsive);

// The code for the chart is wrapped inside a function that
// automatically resizes the chart
function makeResponsive() {

    // if the SVG area isn't empty when the browser loads,
    // remove it and replace it with a resized version of the chart
    var svgArea = d3.select("body").select("svg");

    // clear svg is not empty
    if (!svgArea.empty()) {
        svgArea.remove();
        createChart();
    }
}

// initialize chart by calling createChart function

createChart();

function createChart() {
    // create SVG parameters

    // SVG wrapper dimensions are determined by the current width and
    // height of the browser window.

    var svgWidth = window.innerWidth - (window.innerWidth / 2.5);
    var svgHeight = window.innerHeight - (window.innerHeight / 2);

    var margin = {
        top: 20,
        right: 40,
        bottom: 60,
        left: 100
    };

    var width = svgWidth - margin.left - margin.right;
    var height = svgHeight - margin.top - margin.bottom;

    // Create an SVG wrapper, append an SVG group that will hold our chart, and shift the latter by left and top margins.
    var svg = d3.select("#scatter")
        .append("svg")
        .attr("width", svgWidth)
        .attr("height", svgHeight);

    var chartGroup = svg.append("g")
        .attr('class', 'chartGroup')
        .attr("transform", `translate(${margin.left}, ${margin.top})`);

    // Import data
    d3.csv('assets/data/data.csv').then(censusData => {
        console.log(censusData);
        //parse and cast data 
        censusData.forEach(data => {
            data.poverty = +data.poverty;
            data.healthcare = +data.healthcare;
        });

        //  Create scales
        var xLinearScale = d3.scaleLinear()
            .domain([(d3.min(censusData, d => d.poverty) - 1), d3.max(censusData, d => d.poverty)])
            .range([0, width]);

        var yLinearScale = d3.scaleLinear()
            .domain([0, d3.max(censusData, d => d.healthcare)])
            .range([height, 0]);

        // Create axis functions
        var bottomAxis = d3.axisBottom(xLinearScale);
        var leftAxis = d3.axisLeft(yLinearScale);

        // Append Axes to the chart

        chartGroup.append("g")
            .attr("transform", `translate(0, ${height})`)
            .call(bottomAxis);

        chartGroup.append("g")
            .call(leftAxis);

        // Create Circles

        var circlesGroup = chartGroup.append('g')
            .attr('class', 'cirlcesGroup')
            .classed('stateCircle', true)
            .selectAll('circles')
            .data(censusData)
            .enter()
            .append("circle")
            .attr("cx", d => xLinearScale(d.poverty))
            .attr("cy", d => yLinearScale(d.healthcare))
            .attr("r", "15");


        // State labels
        var stateLabels = chartGroup.append('g')
            .attr('class', 'stateLabels')
            .classed('stateText', true)
            .selectAll('text')
            .data(censusData)
            .enter()
            .append('text')
            .attr('x', d => xLinearScale(d.poverty))
            .attr('y', d => yLinearScale(d.healthcare) + 5) // moved down 5
            .text(d => d.abbr)
        // Initialize tool tip

        var toolTip = d3.tip()
            .attr("class", "d3-tip")
            .offset([80, -60])
            .html(function (d) {
                return (`${d.state} <br>Poverty: ${d.poverty} <br>Healthcare: ${d.healthcare}`);
            });
        // Create tooltip in the chart
        chartGroup.call(toolTip);

        // Create event listeners to display and hide the tooltip

        stateLabels.on("mouseover", d => {
            toolTip.show(d, this);
        })
            // onmouseout event
            .on("mouseout", d => {
                toolTip.hide(d);
            });

        // Create axes labels
        chartGroup.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 0 - margin.left + 40)
            .attr("x", 0 - (height / 2))
            .attr("dy", "1em")
            .attr("class", "active aText")
            .text("Lacks Healthcare (%)");

        chartGroup.append("text")
            .attr("transform", `translate(${width / 2}, ${height + margin.top + 30})`)
            .attr("class", "active aText")
            .text("Poverty (%)");
    }).catch(function (error) {
        console.log(error);
    });


}
