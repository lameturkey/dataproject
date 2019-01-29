// loads the line graph as just axis and returns the function that updates the line graph
function loadline(yearArray)
{

  // variables for the line graph
  var yearArray = yearArray
  var yearsMaxvalue = 0
  var lineWidth = window.innerWidth - 50
  var lineHeight = window.innerHeight / 10 * 4 - 10
  var lines = []
  var countryArray = []
  var currentSport = d3.select(".sportselect").property('value')
  var currentSeason = d3.select(".seasonselect").property("value")
  var padding = {
    left: 50,
    right: 30,
    up: 3,
    down: 25
  }

  // produce the barebones line chart
  d3.select("body").append("svg").style("top", window.innerHeight / 10 * 6).style("position", "relative").attr("class", "linechart")
    .attr("width", lineWidth).attr("height", lineHeight)


  linesvg = d3.select(".linechart")
  d3.select("body").append("div").attr("class", "tooltip")

  overlay = linesvg.append('rect')
      .attr("class", "overlay")
      .attr('width', lineWidth)
      .attr('height', lineHeight)
      .on('mousemove', drawTooltip)
      .on('mouseout', removeTooltip);

  // initialise the tooltip line
  var tooltipLine = d3.line()
                      .x(d => x(d.year))
                      .y(d => y(d.medals));


  // line template
  var line = d3.line().x(function(d){return xscale(d.year)})
                    .y(function(d){return yscale(d.medals)})

  // placeholder axises
  var xscale = d3.scaleLinear()
               .range([padding.left, lineWidth - padding.right])
               .domain([])

  var yscale = d3.scaleLinear()
               .range([lineHeight - padding.down, padding.up])
               .domain([])

  var xaxis =  d3.axisBottom().scale(xscale)
  var yaxis = d3.axisLeft().scale(yscale)
  linesvg.append("line").attr("class", "tooltipline")


  linesvg.append("g")
         .attr("class", "linexaxis")
         .call(xaxis)
         .attr("transform", "translate(0," + (lineHeight - padding.down) + ")");

  linesvg.append("g")
         .attr("class", "lineyaxis")
         .call(yaxis)
         .attr("transform", "translate("+ padding.left + ", 0)")

  linesvg.append("text")
        .attr("class", "axistitle")
        .attr("transform", "rotate(-90)")
        .attr("x", -lineHeight / 1.5)
        .attr("y", padding.left / 3)
        .text("Total Medals")

  linesvg.append("text")
         .attr("class", "axistitle")
         .attr("y", lineHeight - padding.down / 2)
         .attr("x", lineWidth / 2)
         .text("Year")

  // function to remove a line and assign it to the window so it can be used everywere
  window.removeline = function removeline(country)
      {
        var index = countryArray.indexOf(country);
        countryArray.splice(index, 1);
        lines.splice(index, 1);
        window.updateline()
      }

  // function to set all years where no medal was won to 0 instead of no data
  function addemptyYears(object)
  {
    var currentSeason = d3.select(".seasonselect").property("value")
    var currentYears = Object.keys(object)

    var emptyYears = yearArray.filter(function(value, index, arr)
    {
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
      return false
    });
    emptyYears.forEach(function(element)
    {
      object[element] = 0
    })
    return object
  }

  // removes the tooltip
  function removeTooltip()
  {
    d3.select(".tooltip").style("display", "none")
    d3.select(".tooltipline").attr("visibility", "hidden")
  }

  // draws the tooltip
  function drawTooltip()
  {
    d3.select(".tooltip").style("display", "block")
    // draws the tool tip on the mouse postition and the line on the nearest year
    var mouseCoordinates = d3.mouse(this);
    var year = Math.round(xscale.invert(mouseCoordinates[0]))
    var nearestYear = 0

    // finds the nearest  year from the cursor location
    lines.forEach(function(line)
    {
        line.forEach(function(point)
        {
          if (Math.abs(year - point.year) < Math.abs(year - nearestYear))
          {
            nearestYear = point.year
          }
        })
    })

    // produces the tooltip info
    var object = {}
    object["year"] = nearestYear
    lines.forEach(function(line)
    {
        line.forEach(function(point)
        {
          if (point.year == nearestYear)
          {
            object[countryArray[lines.indexOf(line)]] = point.medals
          }
        })
    })

    // year = 0 means no valid year was found near the curor (no data yet in graph)
    if (object["year"] != 0)
    {
      text = d3.select(".tooltip")
               .style("left", (mouseCoordinates[0] + 20 + padding.left) + "px")
               .style("top", (mouseCoordinates[1] + window.innerHeight / 10 * 6 - 20) + "px")
               .selectAll("text").data(Object.keys(object))

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
            })
        text.exit().remove()
      // adjust the line
      linesvg.select("line").attr("class", "tooltipline")
              .style("stroke", "black")
              .attr("visibility", "visible")
              .attr("x1", xscale(nearestYear))
              .attr("x2", xscale(nearestYear))
              .attr("y1", lineHeight - padding.down)
              .attr("y2", padding.up)
      }
    else
    {
      removeTooltip()
    }
  }


  // update function of the line graph takes an object with data from calculate values.
  return function(object)
  {

    // if the current sport has changed update all the data (lines) currently stored
    if (currentSport != d3.select(".sportselect").property('value') || currentSeason != d3.select(".seasonselect").property("value"))
    {
      lines = []
      for (country in countryArray)
      {
        var data = window.requestdata(countryArray[country], "line")
        data = addemptyYears(data)
        var array1 = Object.keys(data)
        var array2 = array1.map(function(d){
          newobject = {}
          newobject["medals"] = data[d]
          newobject["year"] = parseInt(d)
          return newobject
        })
        lines.push(array2)
      }
      currentSport = d3.select(".sportselect").property('value')
      currentSeason = d3.select(".seasonselect").property("value")
    }

    // if an object is given turn it into a format that can be used to draw a line
    if (object !== undefined)
    {
        name = object[0]
        object = object[1]
        if(countryArray.includes(name))
        {
          return
        }
        object = addemptyYears(object)
        maxvalue = Math.max.apply(null, Object.values(object))
        if (maxvalue > yearsMaxvalue)
        {
          yearsMaxvalue = maxvalue
        }
        var array1 = Object.keys(object)
        var array2 = array1.map(function(d)
        {
          newobject = {}
          newobject["medals"] = object[d]
          newobject["year"] = parseInt(d)
          return newobject
        })
        lines.push(array2)
        countryArray.push(name)
     }

    allmedals = []
    allyears = []

    // calculate the maximum and minimum value of the years and medals for the scales
    lines.forEach(function(array)
    {
      allyears = allyears.concat(array.map(function(objectpoint){
        return objectpoint.year
      }))
      allmedals = allmedals.concat(array.map(function(objectpoint){
        return objectpoint.medals
      }))
    })

    // axis
    xscale.range([padding.left, lineWidth - padding.right])
                  .domain([Math.min.apply(null, allyears), Math.max.apply(null, allyears)])
    yscale.range([lineHeight - padding.down, padding.up])
          .domain([0, Math.max.apply(null, allmedals)])
    var xaxis =  d3.axisBottom().scale(xscale)
    var yaxis = d3.axisLeft().scale(yscale)

    d3.select(".linexaxis").transition().call(xaxis)
    d3.select(".lineyaxis").transition().call(yaxis)

    currentlines = linesvg.selectAll(".line").data(lines)

    currentlines.enter()
                .append("path")
                .merge(currentlines)
                .attr("class", "line")
                .attr("d", line)
                .attr("stroke", function(d) {return color(countryArray[lines.indexOf(d)])})

    currentlines.exit().remove()
  }
}
