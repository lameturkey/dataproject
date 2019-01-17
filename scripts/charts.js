function loadheatmap(countrybyname, geojson){
  var format = d3.format(",");
  // Set tooltips
  var tip = d3.tip()
              .attr('class', 'd3-tip')
              .offset([-10, 0])
              .html(function(d) {
                return "<strong>Country: </strong><span class='details'>" + d.properties.name + "<br></span>" + "<strong>Total Medals: </strong><span class='details'>" + format(d.value) +"</span>";
              })

  var margin = {top: 0, right: 0, bottom: 0, left: 0},
              width = 672 - margin.left - margin.right,
              height = 350 - margin.top - margin.bottom;

  var hue = d3.scaleLinear()
      .domain([Math.min.apply(null, Object.values(countrybyname)), Math.max.apply(null, Object.values(countrybyname))])
      .range([0.1, 1])
  var path = d3.geoPath();

  var svg = d3.select("body")
              .append("svg")
              .attr("width", width)
              .attr("height", height)
              .append('g')
              .attr('class', 'map');

  var projection = d3.geoMercator()
                     .scale(100)
                    .translate( [width / 2, height / 1.5]);

  var path = d3.geoPath().projection(projection);

  svg.call(tip);
    geojson.features.forEach(function(d)
    {
        d.value = countrybyname[d.properties.name]
    });

  svg.append("g")
      .attr("class", "countries")
    .selectAll("path")
      .data(geojson.features)
    .enter().append("path").attr("class", "countryform")
      .attr("d", path)
      .style("fill", "blue")
      .style('stroke', 'white')
      .style('stroke-width', 1.5)
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
      //.datum(topojson.mesh(data.features, function(a, b) { return a !== b; }))
      .attr("class", "names")
      .attr("d", path);
    return function()
    {

      countrybyname = calculatevalues(data, "", "bar")
      hue.domain([Math.min.apply(null, Object.values(countrybyname)), Math.max.apply(null, Object.values(countrybyname))])
          .range([0.1, 1])

      geojson.features.forEach(function(d) {
          d.value = countrybyname[d.properties.name]
      });

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


function loadline()
{
  var yearsmaxvalue = 0
  var lineheight = 300
  var linewidth = 1150
  var lines = []
  var countrylist = []
  var currentsport = d3.select(".sportselect").property('value')
  var currentseason = d3.select(".seasonselect").property("value")
  var padding = {
    left: 30,
    right: 1,
    up: 1,
    down: 30
  }
  d3.select("body").append("svg").style("top", 380).style("position", "relative").attr("class", "linechart")
    .attr("width", linewidth).attr("height", lineheight)
  linesvg = d3.select(".linechart")

  var xscale = d3.scaleLinear()
              .range([padding.left, linewidth - padding.right])
              .domain([])
  var yscale = d3.scaleLinear()
              .range([lineheight - padding.down, padding.up])
              .domain([])
  var xaxis =  d3.axisBottom().scale(xscale)
  var yaxis = d3.axisLeft().scale(yscale)



  linesvg.append("g").attr("class", "linexaxis")
                    .call(xaxis).attr("transform", "translate(0," + (lineheight - padding.down) + ")");
  linesvg.append("g").attr("class", "lineyaxis")
                    .call(yaxis).attr("transform", "translate("+ padding.left + ", 0)")
      window.removeline = function removeline(country)
                    {
                      var index = countrylist.indexOf(country);
                      countrylist.splice(index, 1);
                      lines.splice(index, 1);
                      window.updateline()
                    }


  return function(object)
  {
    if (currentsport != d3.select(".sportselect").property('value') || currentseason != d3.select(".seasonselect").property("value"))
    {
      lines = []
      for (country in countrylist)
      {
        var data = window.requestdata(countrylist[country], "line")
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
    if (object !== undefined)
    {
      name = object[0]
      object = object[1]

      if(countrylist.includes(name))
      {
        return
      }
      maxvalue = Math.max.apply(null, Object.values(object))
      if (maxvalue > yearsmaxvalue)
      {
        yearsmaxvalue = maxvalue
      }
      var array1 = Object.keys(object)
      var array2 = array1.map(function(d){
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
    lines.forEach(function(array){
      allyears = allyears.concat(array.map(function(objectpoint){
        return objectpoint.year
      }))
      allmedals = allmedals.concat(array.map(function(objectpoint){
        return objectpoint.medals
      }))
    })

    var xscale = d3.scaleLinear()
                .range([padding.left, linewidth - padding.right])
                  .domain([Math.min.apply(null, allyears), Math.max.apply(null, allyears)])
    var yscale = d3.scaleLinear()
                .range([lineheight - padding.down, padding.up])
                .domain([Math.min.apply(null, allmedals), Math.max.apply(null, allmedals)])
    var xaxis =  d3.axisBottom().scale(xscale)
    var yaxis = d3.axisLeft().scale(yscale)

    line = d3.line().x(function(d){return xscale(d.year)})
                    .y(function(d){return yscale(d.medals)})

    d3.select(".linexaxis").transition().call(xaxis)
    d3.select(".lineyaxis").transition().call(yaxis)

    currentlines = linesvg.selectAll(".line").data(lines)

    currentlines.enter().append("path").merge(currentlines)
      .attr("class", "line")
      .attr("d", line)

    currentlines.exit().remove()



  }
}

function loadbar(dataobject)
{
  var barwidth = 500
  var barheight = 350
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
      .attr("width", 500).attr("height", 350);
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



  function removepoint(country)
  {
    delete data[country];
    updatebar({})
  }

  return function (datapoint)
  {
    if (Object.keys(datapoint).length != 0)
    {
      data[Object.keys(datapoint)[0]] = Object.values(datapoint)[0]
    }
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

    d3.select(".barxaxis").transition().call(xaxis)
    d3.select('.baryaxis').transition().call(yaxis)
    bars = newsvg.selectAll("rect").data(Object.keys(data))
    bars
      .enter().append("rect").merge(bars)
      .style("fill", "red")
      .attr("x", function(d) { return xscale(d); })
      .attr("width", xscale.bandwidth())
      .attr("y", function(d) { return yscale(data[d])})
      .attr("height", function(d) { return barheight - padding.down - yscale(data[d]); })
      .on("click", function(d)
      {
        removepoint(d)
        window.removeline(d)
      });

    bars.exit().remove()

  }
}

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

  d3.select("body").append("a").attr("class", "about").attr("href", "pages/aboutme.html").text("about me")
  d3.select("body").append("a").attr("class", "about").attr("href", "pages/aboutdata.html").text("about data")
}
 window.onload = function load()
 {
   dataHandler()
 }

 function dataHandler()
 {
   promises = [d3.json("world_countries.json"), d3.json("output.json"), d3.json("sportslist.json")]
   Promise.all(promises).then(function(values)
   {
    window.updateheatmap = function(x) {}
    sportslist = values[2].sort()
    sportslist.unshift("All")
    geojson = values[0]
    data = values[1]
    makebuttons(sportslist)
    datalist =  calculatevalues(data, "", "bar")
    window.updateheatmap = loadheatmap(datalist, geojson)
    window.updatebar = loadbar()
    window.updateline = loadline()
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
       }
       if (graph === "line")
       {
          object[game.split(" ")[0]] = object[game.split(" ")[0]] || 0
          object[game.split(" ")[0]] = counter + object[game.split(" ")[0]]
          counter = 0
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


function onchange()
{
  window.updateheatmap()
  window.updatebar({})
  window.updateline()
}
