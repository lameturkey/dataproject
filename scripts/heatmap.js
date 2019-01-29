

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
  var opacity = d3.scaleLinear()
      .domain([Math.min.apply(null, Object.values(countrybyname)), Math.max.apply(null, Object.values(countrybyname))])
      .range([0.05, 1])

  // produce svg
  var svg = d3.select("body")
              .append("svg")
              .attr("width", width)
              .attr("height", height)
              .append('g')
              .attr('class', 'map');

  // set the projection it looks good on my width of 1280 so scale to that
  var projection = d3.geoMercator()
                     .scale(100 * (window.innerWidth/1280))
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
          return opacity(d.value)
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
      opacity.domain([Math.min.apply(null, Object.values(countrybyname)), Math.max.apply(null, Object.values(countrybyname))])
          .range([0.05, 1])

      geojson.features.forEach(function(d) {
          d.value = countrybyname[d.properties.name]
      });

      // update all the values
      d3.selectAll(".countryform")
        .data(geojson.features)
        .style("opacity", function(d) {
              if (d.value != undefined)
              {
                return opacity(d.value)
              }
              return 0
            })
    }

}
