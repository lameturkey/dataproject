/*****************************************************************************
* Loads a bar chart and returns a function that updates this barchart        *
* one can click on the bar or ticks to remove it from data.                  *
* By: Koen van der Kamp (12466573)                                           *
******************************************************************************/


function loadBar(dataobject)
{

  // scale the bar to the window (50% height - some padding for the left side and 60% of the height)
  var barWidth = window.innerWidth / 100 * 50 - 50;
  var barHeight = window.innerHeight / 10 * 6;
  var padding =
  {
    left: 55,
    up: 5,
    down: 20,
    right: 1
  }

  // data and data state values (current sport and current season of the current data)
  var data = {};
  var currentSport = d3.select(".sportSelect").property('value');
  var currentSeason = d3.select(".seasonSelect").property("value");


  // svgs and axis stuff
  var barsvg = d3.select("body")
                 .append("svg")
                 .attr("class", "barchart")
                 .attr("width", barWidth)
                 .attr("height", barHeight)
                 .style("left", window.innerWidth / 100 * 50);

  var xscale = d3.scaleOrdinal()
                 .range([padding.left, barWidth - padding.right]);

  var yscale = d3.scaleLinear()
                 .range([barHeight - padding.down, padding.up]);

  var xaxis =  d3.axisBottom().scale(xscale);
  var yaxis = d3.axisLeft().scale(yscale);

  barsvg.append("g")
         .attr("class", "barxaxis")
         .call(xaxis)
         .attr("transform", "translate(0," + (barHeight - padding.down) + ")");

  barsvg.append("g")
        .attr("class", "baryaxis")
        .call(yaxis)
        .attr("transform", "translate("+ padding.left + ", 0)");

  barsvg.append("text")
        .attr("class", "axistitle")
        .attr("transform", "rotate(-90)")
        .attr("x", -barHeight / 1.5)
        .attr("y", padding.left / 3)
        .text("Total Medals")

  // function that removes a bar from the bar chart ()
  function removepoint(country)
  {
    delete data[country];
    updateBar()
  };

  // function that updates the data in the data object to match the filters
  function updatedata()
  {

    // get all countries that need updating
    countries = Object.keys(data);

    // remove old data
    data = {};

    // request new data from the datahandler
    for (country in countries)
    {
      data[countries[country]] = window.requestData(countries[country], "bar")[countries[country]];

      // if the data doesn't exist there are no medals
      if (data[countries[country]]  === undefined)
      {
        data[countries[country]] = 0;
      }
    }

    // update the data trackers
    currentSport = d3.select(".sportSelect").property('value');
    currentSeason = d3.select(".seasonSelect").property("value");
  }

  // return function that updates this bar chart
  return function (datapoint)
  {

    // if an object is given add it to the data
    if (datapoint != undefined)
    {
      data[Object.keys(datapoint)[0]] = Object.values(datapoint)[0];
    };

    // if one of the filters has changed update the whole dataset
    if (currentSport != d3.select(".sportSelect").property('value') || currentSeason != d3.select(".seasonSelect").property("value"))
    {
        updatedata()
    }

    // calculate and update the scales
    xscale = d3.scaleBand()
                .domain(Object.keys(data))
                .range([padding.left, barWidth - padding.right])
                .padding(0.02);

    yscale = d3.scaleLinear()
                .domain([0, Math.max.apply(null, Object.values(data))])
                .range([barHeight - padding.down, padding.up])
                .nice();

    xaxis =  d3.axisBottom().scale(xscale);
    yaxis = d3.axisLeft().scale(yscale);

    d3.select(".barxaxis").transition().duration(750).call(xaxis);
    d3.select('.baryaxis').transition().duration(750).call(yaxis);

    // allow the user to click the ticks for removal
    d3.select('.barchart').select(".barxaxis").selectAll('.tick')
            .data(Object.keys(data), function(d) { return d })
            .on('click', function(country)
            {

              // dont allow the user to spam click a single tick
              this.remove()

              // remove from data
              removepoint(country)
              window.removeline(country)
            });

    // update add or remove bars
    var bars = barsvg.selectAll("rect").data(Object.keys(data));
    bars.enter()
        .append("rect")
        .merge(bars)
        .on("click", function(d)
          {
            removepoint(d)
            window.removeline(d)
          })
        .style("fill", function(d) {return color(d)})
        .attr("x", function(d) { return xscale(d); })
        .attr("width", xscale.bandwidth())
        .attr("y", function(d) { return yscale(data[d])})
        .attr("height", function(d) { return barHeight - padding.down - yscale(data[d]); });

    // remove excess bars
    bars.exit().remove();

  }
}
