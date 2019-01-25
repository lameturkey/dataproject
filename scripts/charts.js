function loadheatmap(countrybyname, geojson)
{

  // formatting of the value
  var format = d3.format(",");

  // Set placeholder tooltip
  var tip = d3.tip()
              .attr('class', 'd3-tip')
              .direction("s")
              .offset([-0, -10])
              .html(function(d) {
                return "<strong>Country: </strong><span class='details'>" + d.properties.name + "<br></span>" + "<strong>Total Medals: </strong><span class='details'>" + format(d.value) +"</span>";
              })

  // graph padding
              width = window.innerWidth / 100 * 50
              height = window.innerHeight / 10 * 6

  // color coding used for opacity
  var hue = d3.scaleLinear()
      .domain([Math.min.apply(null, Object.values(countrybyname)), Math.max.apply(null, Object.values(countrybyname))])
      .range([0.1, 1])

  // produce svg
  var svg = d3.select("body")
              .append("svg")
              .attr("width", width)
              .attr("height", height)
              .append('g')
              .attr('class', 'map');

  // set the projection
  var projection = d3.geoMercator()
                     .scale(100)
                    .translate( [width / 2, height / 1.5]);

  // make the path
  var path = d3.geoPath().projection(projection);

  // initialise the tooltip with values
  svg.call(tip);
    geojson.features.forEach(function(d)
    {
        d.value = countrybyname[d.properties.name]
    });

  // append all countries as paths
  svg.append("g")
      .attr("class", "countries")
    .selectAll("path")
      .data(geojson.features)
    .enter().append("path").attr("class", "countryform")
      .attr("d", path)
      .style("fill", "blue")
      .style('stroke', 'white')
      .style('stroke-width', 1.5)
      // use the opacity for "heatmapping"
      .style("opacity", function(d) {
        if (d.value != undefined)
        {
          return hue(d.value)
        }
        return 0
      })

      // tooltips
        .style("stroke","white")
        .style('stroke-width', 0.3)
        .on('mouseover',function(d){
          if(d.value == undefined)
          {
            d.value = 0
          }
          tip.show(d);
          d3.select(this)
            .style("stroke","white")
            .style("stroke-width",3);
        })
        .on('mouseout', function(d){
          tip.hide(d);

          d3.select(this)

            .style("stroke","white")
            .style("stroke-width",0.3);
        })

        // on click send info to line and bar charts
        .on("click", function(d){
          name = d.properties.name;
          object = {}
          object[name] = countrybyname[name]
          if(object[name] != undefined)
          {
          var data = window.requestdata(name, "bar")
          window.updatebar(data)
          var data = window.requestdata(name, "line")
          window.updateline([name, data])
          }
        });

  svg.append("path")
      .datum(topojson.mesh(geojson.features, function(a, b) { return a.id !== b.id; }))
      .attr("class", "names")
      .attr("d", path);

    // return the update function of the heatmap
    return function()
    {

      // update the opacity scale and set the new values for each country
      countrybyname = calculatevalues(data, "", "bar")
      hue.domain([Math.min.apply(null, Object.values(countrybyname)), Math.max.apply(null, Object.values(countrybyname))])
          .range([0.1, 1])

      geojson.features.forEach(function(d) {
          d.value = countrybyname[d.properties.name]
      });

      // update all the values
      d3.selectAll(".countryform")
        .data(geojson.features)
        .style("opacity", function(d) {
              if (d.value != undefined)
              {
                return hue(d.value)
              }
              return 0
            })
    }

}

// loads the line graph as just axis and returns the function that updates the line graph
function loadline(yeararray)
{

  // variables for the line graph
  var yeararray = yeararray
  var yearsmaxvalue = 0
  var linewidth = window.innerWidth - 50
  var lineheight = window.innerHeight / 10 * 4 - 10
  var lines = []
  var countrylist = []
  var currentsport = d3.select(".sportselect").property('value')
  var currentseason = d3.select(".seasonselect").property("value")
  var padding = {
    left: 30,
    right: 30,
    up: 1,
    down: 25
  }

  // produce the barebones line chart
  d3.select("body").append("svg").style("top", window.innerHeight / 10 * 6).style("position", "relative").attr("class", "linechart")
    .attr("width", linewidth).attr("height", lineheight)


  linesvg = d3.select(".linechart")
  d3.select("body").append("div").attr("class", "tooltip")

  overlay = linesvg.append('rect')
      .attr('width', linewidth)
      .attr('height', lineheight)
      .attr('opacity', 0)
      .on('mousemove', drawTooltip)
      .on('mouseout', removeTooltip);

  // initialise the tooltip line
  const tooltipLine = d3.line()
                      .x(d => x(d.year))
                      .y(d => y(d.medals));

  var xscale = d3.scaleLinear()
               .range([padding.left, linewidth - padding.right])
               .domain([])

  var yscale = d3.scaleLinear()
               .range([lineheight - padding.down, padding.up])
               .domain([])

  var xaxis =  d3.axisBottom().scale(xscale)
  var yaxis = d3.axisLeft().scale(yscale)
  linesvg.append("line").attr("class", "tooltipline")


  linesvg.append("g").attr("class", "linexaxis")
                    .call(xaxis).attr("transform", "translate(0," + (lineheight - padding.down) + ")");
  linesvg.append("g").attr("class", "lineyaxis")
                    .call(yaxis).attr("transform", "translate("+ padding.left + ", 0)")

  // function to remove a line and assign it to the window so it can be used everywere
  window.removeline = function removeline(country)
      {
        var index = countrylist.indexOf(country);
        countrylist.splice(index, 1);
        lines.splice(index, 1);
        window.updateline()
      }

  // function to set all year where no medal was won to 0 instead of no data
  function addemptyyears(object)
  {
    var currentseason = d3.select(".seasonselect").property("value")
    var currentyears = Object.keys(object)

    var emptyyears = yeararray.filter(function(value, index, arr)
    {
      if (currentyears.includes(value))
      {
        return false
      }
      if (value < 1992)
      {
        return true
      }
      else if (currentseason === "Summer" && ((value - 1992) % 4) === 0)
      {
        return false
      }
      else if (currentseason === "Winter" && ((value - 1994) % 4) === 0)
      {
        return false
      }
      return false
    });
    emptyyears.forEach(function(element)
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
    var nearestyear = 0

    // finds the nearest  year from the cursor location
    lines.forEach(function(line)
    {
        line.forEach(function(datapoint)
        {
          if (Math.abs(year - datapoint.year) < Math.abs(year - nearestyear))
          {
            nearestyear = datapoint.year
          }
        })
    })

    // produces the tooltip info
    var object = {}
    object["year"] = nearestyear
    lines.forEach(function(line)
    {
        line.forEach(function(datapoint)
        {
          if (datapoint.year == nearestyear)
          {
            object[countrylist[lines.indexOf(line)]] = datapoint.medals
          }
        })
    })

    // year = 0 means no valid year was found near the curor (no data yet in graph)
    if (object["year"] != 0)
    {
      text = d3.select(".tooltip")
               .style("left", (mouseCoordinates[0] + 20 + padding.left) + "px")
               .style("top", (mouseCoordinates[1] + 10 + 350) + "px")
               .selectAll("text")

      text.data(Object.keys(object))
          .enter()
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

      // adjust the line
      linesvg.select("line").attr("class", "tooltipline")
              .style("stroke", "black")
              .attr("visibility", "visible")
              .attr("x1", xscale(nearestyear))
              .attr("x2", xscale(nearestyear))
              .attr("y1", lineheight - padding.down)
              .attr("y2", padding.up)
      }
    else {
      removeTooltip()
      }
  }


  // update function of the line graph takes an object with data from calculate values.
  return function(object)
  {

    // if the current sport has changed update all the data (lines) currently stored
    if (currentsport != d3.select(".sportselect").property('value') || currentseason != d3.select(".seasonselect").property("value"))
    {
      lines = []
      for (country in countrylist)
      {
        var data = window.requestdata(countrylist[country], "line")
        data = addemptyyears(data)
        var array1 = Object.keys(data)
        var array2 = array1.map(function(d){
          newobject = {}
          newobject["medals"] = data[d]
          newobject["year"] = parseInt(d)
          return newobject
        })
        lines.push(array2)
      }
      currentsport = d3.select(".sportselect").property('value')
      currentseason = d3.select(".seasonselect").property("value")
    }

    // if and object is given turn it into a format that can be used to draw a line
    if (object !== undefined)
    {
        name = object[0]
        object = object[1]
        if(countrylist.includes(name))
        {
          return
        }
        addemptyyears(object)
        maxvalue = Math.max.apply(null, Object.values(object))
        if (maxvalue > yearsmaxvalue)
        {
          yearsmaxvalue = maxvalue
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
        countrylist.push(name)
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
    xscale.range([padding.left, linewidth - padding.right])
                  .domain([Math.min.apply(null, allyears), Math.max.apply(null, allyears)])
    yscale.range([lineheight - padding.down, padding.up])
          .domain([0, Math.max.apply(null, allmedals)])
    var xaxis =  d3.axisBottom().scale(xscale)
    var yaxis = d3.axisLeft().scale(yscale)

    d3.select(".linexaxis").transition().call(xaxis)
    d3.select(".lineyaxis").transition().call(yaxis)

    // line template
    line = d3.line().x(function(d){return xscale(d.year)})
                    .y(function(d){return yscale(d.medals)})


    currentlines = linesvg.selectAll(".line").data(lines)

    currentlines.enter().append("path").merge(currentlines)
      .attr("class", "line")
      .attr("d", line)
      .attr("stroke", function(d) {return color(countrylist[lines.indexOf(d)])})

    currentlines.exit().remove()



  }
}

// function to load a bar chart and returns a function to update said bar chart
function loadbar(dataobject)
{
  barwidth = window.innerWidth / 100 * 50 - 50
  barheight = window.innerHeight / 10 * 6
  var padding = {
    left: 35,
    up: 5,
    down: 20,
    right: 1
  }
  var data = {}
  var currentsport = d3.select(".sportselect").property('value')
  var currentseason = d3.select(".seasonselect").property("value")

  var newsvg = d3.select("body").append("svg").attr("class", "barchart")
      .attr("width", barwidth).attr("height", barheight).style("left", window.innerWidth / 100 * 50);
  var xscale = d3.scaleOrdinal()
              .range([padding.left, barwidth - padding.right])
  var yscale = d3.scaleLinear()
              .range([barheight - padding.down, padding.up])

  var xaxis =  d3.axisBottom().scale(xscale)
  var yaxis = d3.axisLeft().scale(yscale)

  newsvg.append("g").attr("class", "barxaxis")
                    .call(xaxis).attr("transform", "translate(0," + (barheight - padding.down) + ")");
  newsvg.append("g").attr("class", "baryaxis")
                    .call(yaxis).attr("transform", "translate("+ padding.left + ", 0)")


  // function that removes a bar from the bar chart ()
  function removepoint(country)
  {
    delete data[country];
    updatebar({})
  }

  // return function that updates this bar chart
  return function (datapoint)
  {

    // if a key is given add it to the data
    if (Object.keys(datapoint).length != 0)
    {
      data[Object.keys(datapoint)[0]] = Object.values(datapoint)[0]
    }

    // if one of the filters has changed update the whole dataset
    if (currentsport != d3.select(".sportselect").property('value') || currentseason != d3.select(".seasonselect").property("value"))
    {
      countries = Object.keys(data)
      data = {}
      for (country in countries)
      {
        data[countries[country]] = window.requestdata(countries[country], "bar")[countries[country]]
        if (data[countries[country]]  === undefined)
        {
          data[countries[country]] = 0
        }
      }
      currentsport = d3.select(".sportselect").property('value')
      currentseason = d3.select(".seasonselect").property("value")
     }

      // calculate the scales
      xscale = d3.scaleBand()
                  .domain(Object.keys(data))
                  .range([padding.left, barwidth - padding.right])
                  .padding(0.02)

      yscale = d3.scaleLinear()
                  .domain([0, Math.max.apply(null, Object.values(data))])
                  .range([barheight - padding.down, padding.up])
                  .nice()

      xaxis =  d3.axisBottom().scale(xscale)
      yaxis = d3.axisLeft().scale(yscale)

      d3.select(".barxaxis").transition().duration(750).call(xaxis)
      d3.select('.baryaxis').transition().duration(750).call(yaxis)

      // allow the user to click the ticks for removal
      d3.select('.barchart').select(".barxaxis").selectAll('.tick')
              .data(Object.keys(data))
              .on('click', function(country)
              {
                removepoint(country)
                window.removeline(country)
              })

      // update add or remove bars
      bars = newsvg.selectAll("rect").data(Object.keys(data))
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
        .attr("height", function(d) { return barheight - padding.down - yscale(data[d]); })


      bars.exit().remove()

    }
}

// make the navigation buttons
function makebuttons(sportslist)
{
  seasonselect = d3.select("body").append("select").attr("class", "seasonselect").on("change", onchange)

  seasonselect.append("option").text("All").attr("value", "All")
  seasonselect.append("option").text("Winter").attr("value", "Winter")
  seasonselect.append("option").text("Summer").attr("value", "Summer")

  sportselect = d3.select("body").append("select").attr("class", "sportselect").on("change", onchange)
  for (var item in sportslist)
  {
    sportselect.append("option").text(sportslist[item]).attr('value', sportslist[item]);
  }

  d3.select("body").append("a").attr("class", "aboutme").attr("href", "pages/aboutme.html").text("about me")
  d3.select("body").append("text").attr("class", "filtertext").text("Filters:")
  d3.select("body").append("a").attr("class", "aboutdata").attr("href", "pages/aboutdata.html").text("about data")
}

// to call the script
window.onload = dataHandler


// initialise all the graphs
function dataHandler()
{
   promises = [d3.json("data/world_countries.json"), d3.json("data/output.json"), d3.json("data/sportslist.json"), d3.json("data/yearlist.json")]
   Promise.all(promises).then(function(values)
   {
    tutorial()
    yearlist = values[3]
    window.color = colormaker()
    window.updateheatmap = function(x) {}
    sportslist = values[2].sort()
    sportslist.unshift("All")
    geojson = values[0]
    data = values[1]
    makebuttons(sportslist)
    datalist =  calculatevalues(data, "", "bar")
    window.updateheatmap = loadheatmap(datalist, geojson)
    window.updatebar = loadbar()
    window.updateline = loadline(yearlist)
    window.requestdata = function(country, kind)
    {
        return calculatevalues(data, country, kind)
    }
   });
 }

// calculates the (filtered) values for all graphs
function calculatevalues(data, countryFilter, graph)
{
  season = d3.select(".seasonselect").property('value')
  if (season == "All")
  {
    season = ""
  }
  sportsFilter = d3.select(".sportselect").property('value')
  if (sportsFilter == "All")
  {
    sportsFilter = ""
  }
  object = {};
 Object.keys(data).forEach(function(country)
 {
   counter = 0
   if (countryFilter === "" || countryFilter === country)
   {
     Object.keys(data[country]).forEach(function(game)
     {
       if (season === "" || game.split(" ")[1] === season)
       {
         Object.keys(data[country][game]).forEach(function(medal)
         {
           Object.keys(data[country][game][medal]).forEach(function(sport)
           {
             if (sportsFilter === "" || sportsFilter === sport)
             {
              counter += parseInt(data[country][game][medal][sport])
              }

           })
         })
         if (graph === "line")
         {
            object[game.split(" ")[0]] = object[game.split(" ")[0]] || 0
            object[game.split(" ")[0]] = counter + object[game.split(" ")[0]]
            counter = 0
         }
       }

     })
    }
  if (counter != 0)
  {
   object[country] = counter
  }
 })
 return object
}

// if a change is made to the filters
function onchange()
{
  window.updateheatmap()
  window.updatebar()
  window.updateline()
}

// function to color code the bars and lines
function colormaker()
{
  colorobject = {}
  var color = d3.scaleOrdinal(d3.schemeCategory10);
  return function(x)
  {
    console.log(x)
    if (!(Object.keys(colorobject).includes(x)))
    {
      colorobject[x] = Object.keys(colorobject).length
    }
      return color(colorobject[x])
  }
}

function tutorial()
{
  d3.select("body").append("img")
                   .attr("class", "image")
                   .attr("width", window.innerWidth - 50)
                   .attr("height", window.innerHeight- 10);
  i = 0
  slideshow(i)
  function slideshow(i)
  {
    console.log(i)
    d3.select(".image").attr("src", "docs/tutorial"+ i + ".png")
    i = i + 1
    if (i > 3)
    {
      d3.select(".image").remove()
      return
    }
    setTimeout(slideshow, 5000, i)
  }


}
