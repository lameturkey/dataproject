// loads the line graph as just axis and returns the function that updates the line graph
function loadLine(yearArray)
{

  // variables for the line graph
  var yearArray = yearArray;
  var yearsMaxvalue = 0;
  var lineWidth = window.innerWidth - 50;
  var lineHeight = window.innerHeight / 10 * 4 - 10;
  var padding = {
    left: 50,
    right: 30,
    up: 3,
    down: 25
  }

  // data variables
  var lines = [];
  var countryArray = [];
  var currentSport = d3.select(".sportSelect").property('value');
  var currentSeason = d3.select(".seasonSelect").property("value");


  // produce the barebones line chart
  linesvg = d3.select("body")
              .append("svg")
              .style("top", window.innerHeight / 10 * 6)
              .attr("class", "linechart")
              .attr("width", lineWidth)
              .attr("height", lineHeight);

  // tooltip div
  d3.select("body").append("div").attr("class", "tooltip");

  // tooltip line
  linesvg.append("line").attr("class", "tooltipline");

  // overlay for relative mouse tracking (tooltip related)
  overlay = linesvg.append('rect')
                   .attr("class", "overlay")
                   .attr('width', lineWidth)
                   .attr('height', lineHeight)
                   .on('mousemove', drawTooltip)
                   .on('mouseout', removeTooltip);


  // line template
  var line = d3.line().x(function(d){return xscale(d.year)})
                      .y(function(d){return yscale(d.medals)});

  // placeholder axises
  var xscale = d3.scaleLinear()
                 .range([padding.left, lineWidth - padding.right])
                 .domain([]);

  var yscale = d3.scaleLinear()
                 .range([lineHeight - padding.down, padding.up])
                 .domain([]);

  var xaxis =  d3.axisBottom().scale(xscale);
  var yaxis = d3.axisLeft().scale(yscale);

  linesvg.append("g")
         .attr("class", "linexaxis")
         .call(xaxis)
         .attr("transform", "translate(0," + (lineHeight - padding.down) + ")");

  linesvg.append("g")
         .attr("class", "lineyaxis")
         .call(yaxis)
         .attr("transform", "translate("+ padding.left + ", 0)");

  linesvg.append("text")
        .attr("class", "axistitle")
        .attr("transform", "rotate(-90)")
        .attr("x", -lineHeight / 1.5)
        .attr("y", padding.left / 3)
        .text("Total Medals");

  linesvg.append("text")
         .attr("class", "axistitle")
         .attr("y", lineHeight - padding.down / 2)
         .attr("x", lineWidth / 2)
         .text("Year");

  // function to remove a line and assign it to the window so it can be used everywere
  window.removeline = function removeline(country)
      {
        var index = countryArray.indexOf(country);
        countryArray.splice(index, 1);
        lines.splice(index, 1);
        window.updateLine()
      }

  // function to set all years where no medal was won to 0 instead of no data
  function addemptyYears(object)
  {

    // get the current season and year (for relevant years)
    var currentSeason = d3.select(".seasonSelect").property("value")
    var currentYears = Object.keys(object)

    // filter the relevant years (before 1992 winter and summer were at the same time)
    var emptyYears = yearArray.filter(function(value, index, arr)
    {

      // false if the year should be omitted and true if the year = 0 should be included
      if (currentYears.includes(value))
      {
        return false
      }
      if (value <= 1992)
      {
        return true
      }
      else if (currentSeason === "Summer" && ((value - 1992) % 4) === 0)
      {
        return false
      }
      else if (currentSeason === "Winter" && ((value - 1994) % 4) === 0)
      {
        return false
      }
    });

    // assign 0 to each true value above
    emptyYears.forEach(function(element)
    {
      object[element] = 0;
    })
    return object
  }

  // removes the tooltip
  function removeTooltip()
  {
    d3.select(".tooltip").style("display", "none");
    d3.select(".tooltipline").attr("visibility", "hidden");
  }

  // draws the tooltip tool tip on the mouse postition and the line on the nearest year
  function drawTooltip()
  {

    // calculate year from the mouse position
    var mouseCoordinates = d3.mouse(this);;
    var year = Math.round(xscale.invert(mouseCoordinates[0]));
    var nearestYear = 0;

    // finds the nearest datapoint year from the cursor location
    lines.forEach(function(line)
    {
        line.forEach(function(point)
        {
          if (Math.abs(year - point.year) < Math.abs(year - nearestYear))
          {
            nearestYear = point.year;
          }
        });
    });

    // produces the tooltip info object
    var object = {};
    object["year"] = nearestYear;
    lines.forEach(function(line)
    {
        line.forEach(function(point)
        {
          if (point.year == nearestYear)
          {
            object[countryArray[lines.indexOf(line)]] = point.medals;
          }
        });
    });

    // year = 0 means no valid year was found near the curor (no data yet in graph)
    if (object["year"] != 0)
    {
      d3.select(".tooltip").style("display", "block");

      offset = mouseCoordinates[0] + 20 + padding.left < lineWidth / 10 * 9 ? 40 : -150;

      text = d3.select(".tooltip")
               .style("left", (mouseCoordinates[0] + offset) + "px")
               .style("top", (mouseCoordinates[1] + window.innerHeight / 10 * 6 - 30) + "px")
               .selectAll("text").data(Object.keys(object));

      text.enter()
          .append("text")
          .merge(text)
          .attr("y", (d, i) => i * 20)
          .html(function(d)
            {
                // formatting of the tooltip
                if (d != "year")
                {
                  return d + ": " + "<b><span class='details'>" + object[d] + "</b> </span> <br> "
                }
                else
                {
                  return "<b><span class='details'>" + object[d] + "</span> </b> <br>"
                }
            });
        text.exit().remove();

      // adjust the line position and show it
      linesvg.select("line").attr("class", "tooltipline")
             .attr("visibility", "visible")
             .attr("x1", xscale(nearestYear))
             .attr("x2", xscale(nearestYear))
             .attr("y1", lineHeight - padding.down)
             .attr("y2", padding.up);
      }
  }

  function objectoline(object)
  {
    name = object[0];
    object = object[1];

    if(countryArray.includes(name))
    {
      return
    }
    object = addemptyYears(object);
    maxvalue = Math.max.apply(null, Object.values(object));
    if (maxvalue > yearsMaxvalue)
    {
      yearsMaxvalue = maxvalue;
    }
    var array1 = Object.keys(object);
    var array2 = array1.map(function(d)
    {
      newobject = {};
      newobject["medals"] = object[d];
      newobject["year"] = parseInt(d);
      return newobject
    })
    lines.push(array2);
    countryArray.push(name);
  }

  function updatedata()
  {
    lines = [];
    for (country in countryArray)
    {
      var data = window.requestData(countryArray[country], "line");
      data = addemptyYears(data);
      var array1 = Object.keys(data);
      var array2 = array1.map(function(d)
      {
        newobject = {};
        newobject["medals"] = data[d];
        newobject["year"] = parseInt(d);
        return newobject
      })
      lines.push(array2);
    }
    currentSport = d3.select(".sportSelect").property('value');
    currentSeason = d3.select(".seasonSelect").property("value");
   }

  // update function of the line graph takes an object with data from calculate values.
  return function(object)
  {

    // if the current sport has changed update all the data (lines) currently stored
    if (currentSport != d3.select(".sportSelect").property('value') || currentSeason != d3.select(".seasonSelect").property("value"))
    {
      updatedata();
    }

    // if an object is given turn it into a format that can be used to draw a line and add it to the lines
    if (object != undefined)
    {
      objectoline(object);
    }

    var allmedals = [];
    var allyears = [];

    // calculate the maximum and minimum value of the years and medals for the scales
    lines.forEach(function(array)
    {
      allyears = allyears.concat(array.map(function(objectpoint)
      {
        return objectpoint.year
      }));
      allmedals = allmedals.concat(array.map(function(objectpoint)
      {
        return objectpoint.medals
      }));
    });

    // axis
    xscale.range([padding.left, lineWidth - padding.right])
          .domain([Math.min.apply(null, allyears), Math.max.apply(null, allyears)]);

    yscale.range([lineHeight - padding.down, padding.up])
          .domain([0, Math.max.apply(null, allmedals)]);
    var xaxis =  d3.axisBottom().scale(xscale).tickFormat(d3.format("d"));
    var yaxis = d3.axisLeft().scale(yscale);

    d3.select(".linexaxis").transition().call(xaxis);
    d3.select(".lineyaxis").transition().call(yaxis);

    currentlines = linesvg.selectAll(".line").data(lines);

    // lines
    currentlines.enter()
                .append("path")
                .merge(currentlines)
                .attr("class", "line")
                .attr("d", line)
                .attr("stroke", function(d) {return color(countryArray[lines.indexOf(d)])});

    currentlines.exit().remove();
  }
}
