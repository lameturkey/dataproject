// function to load a bar chart and returns a function to update said bar chart
function loadbar(dataobject)
{
  barwidth = window.innerWidth / 100 * 50 - 50;
  barheight = window.innerHeight / 10 * 6;
  var padding =
  {
    left: 55,
    up: 5,
    down: 20,
    right: 1
  }
  var data = {};
  var currentsport = d3.select(".sportselect").property('value');
  var currentseason = d3.select(".seasonselect").property("value");

  var barsvg = d3.select("body").append("svg").attr("class", "barchart")
      .attr("width", barwidth).attr("height", barheight).style("left", window.innerWidth / 100 * 50);
  var xscale = d3.scaleOrdinal()
              .range([padding.left, barwidth - padding.right]);
  var yscale = d3.scaleLinear()
              .range([barheight - padding.down, padding.up]);

  var xaxis =  d3.axisBottom().scale(xscale);
  var yaxis = d3.axisLeft().scale(yscale);

  barsvg.append("g")
         .attr("class", "barxaxis")
         .call(xaxis).attr("transform", "translate(0," + (barheight - padding.down) + ")");

  barsvg.append("g")
         .attr("class", "baryaxis")
         .call(yaxis).attr("transform", "translate("+ padding.left + ", 0)");

  barsvg.append("text")
         .attr("transform", "rotate(-90)")
         .attr("x", -barheight / 1.5)
         .attr("y", padding.left / 3)
         .text("Total Medals")

  // function that removes a bar from the bar chart ()
  function removepoint(country)
  {
    delete data[country];
    updatebar()
  };

  // return function that updates this bar chart
  return function (datapoint)
  {

    // if a object is given add it to the data
    if (datapoint != undefined)
    {
      data[Object.keys(datapoint)[0]] = Object.values(datapoint)[0];
    };

    // if one of the filters has changed update the whole dataset
    if (currentsport != d3.select(".sportselect").property('value') || currentseason != d3.select(".seasonselect").property("value"))
    {
      countries = Object.keys(data);
      data = {};
      for (country in countries)
      {
        data[countries[country]] = window.requestdata(countries[country], "bar")[countries[country]];
        if (data[countries[country]]  === undefined)
        {
          data[countries[country]] = 0;
        }
      }
      currentsport = d3.select(".sportselect").property('value');
      currentseason = d3.select(".seasonselect").property("value");
     }

      // calculate the scales
      xscale = d3.scaleBand()
                  .domain(Object.keys(data))
                  .range([padding.left, barwidth - padding.right])
                  .padding(0.02);

      yscale = d3.scaleLinear()
                  .domain([0, Math.max.apply(null, Object.values(data))])
                  .range([barheight - padding.down, padding.up])
                  .nice();

      xaxis =  d3.axisBottom().scale(xscale);
      yaxis = d3.axisLeft().scale(yscale);

      d3.select(".barxaxis").transition().duration(750).call(xaxis);
      d3.select('.baryaxis').transition().duration(750).call(yaxis);

      // allow the user to click the ticks for removal
      d3.select('.barchart').select(".barxaxis").selectAll('.tick')
              .data(Object.keys(data))
              .on('click', function(country)
              {
                removepoint(country)
                window.removeline(country)
              });

      // update add or remove bars
      bars = barsvg.selectAll("rect").data(Object.keys(data));
      bars
        .enter().append("rect").merge(bars)
        .on("click", function(d)
        {
          removepoint(d)
          window.removeline(d)
        })
        .style("fill", function(d) {return color(d)})
        .attr("x", function(d) { return xscale(d); })
        .attr("width", xscale.bandwidth())
        .attr("y", function(d) { return yscale(data[d])})
        .attr("height", function(d) { return barheight - padding.down - yscale(data[d]); });


      bars.exit().remove();

    }
}
