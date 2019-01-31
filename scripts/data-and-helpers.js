
// to call the script
window.onload = handler

// initialise all the graphs
function handler()
{

  // startup tutorial
  tutorial()

  // get all the data
  promises = [d3.json("../data/world_countries.json"), d3.json("../data/output.json"), d3.json("../data/sportslist.json"), d3.json("../data/yearlist.json")]
  Promise.all(promises).then(function(values)
  {

    // save them to more obvious variables
    geojson = values[0];
    data = values[1];
    sportslist = values[2].sort();
    sportslist.unshift("All");
    yearlist = values[3];

    // produce a color that can be acessed everywere
    window.color = colormaker();

    // produce the navigatiuon bar (needs a list of sports on wich you can filter)
    navbar(sportslist);

    // request the first data for the heatmap
    datalist =  calculateValues(data, "", "bar");

    // setup all the update functions and the function that can request data
    window.updateHeatmap = loadHeatmap(datalist, geojson);
    window.updateBar = loadBar();
    window.updateLine = loadLine(yearlist);
    window.requestData = function(country, kind)
    {
      return calculateValues(data, country, kind);
    }
  });
 }

// make the navigation buttons
function navbar(sportslist)
{

 // season dropdown
 var seasonSelect = d3.select("body").append("select").attr("class", "seasonSelect").on("change", onchange);

 seasonSelect.append("option").text("All").attr("value", "All");
 seasonSelect.append("option").text("Winter").attr("value", "Winter");
 seasonSelect.append("option").text("Summer").attr("value", "Summer");

 // sport dropdown
 var sportSelect = d3.select("body").append("select").attr("class", "sportSelect").on("change", onchange);
 for (var item in sportslist)
 {
   sportSelect.append("option").text(sportslist[item]).attr('value', sportslist[item]);
 }

 // other links
 d3.select("body").append("a")
                  .attr("class", "aboutme")
                  .attr("href", "aboutme.html")
                  .text("about me");

 d3.select("body").append("text")
                  .attr("class", "filtertext")
                  .text("Filters:");

 d3.select("body").append("a")
                  .attr("class", "aboutdata")
                  .attr("href", "aboutdata.html")
                  .text("about data");
}

// calculates the (filtered) values for all graphs
function calculateValues(data, countryFilter, graph)
{

 var season = d3.select(".seasonSelect").property('value');
 if (season == "All")
 {
   season = "";
 }

 var sportsFilter = d3.select(".sportSelect").property('value');
 if (sportsFilter == "All")
 {
   sportsFilter = "";
 }

 var object = {};
 Object.keys(data).forEach(function(country)
 {
  counter = 0;
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
             counter += parseInt(data[country][game][medal][sport]);
            }

          });
        });
        if (graph === "line")
        {
           object[game.split(" ")[0]] = object[game.split(" ")[0]] || 0;
           object[game.split(" ")[0]] = counter + object[game.split(" ")[0]];
           counter = 0;
        }
      }
    });
   }
 if (counter != 0)
 {
  object[country] = counter
 }
});
return object
}

// if a change is made to the filters
function onchange()
{
 window.updateHeatmap();
 window.updateBar();
 window.updateLine();
}

// function to color code the bars and lines
function colormaker()
{
 var colorObject = {};
 var color = d3.scaleOrdinal(d3.schemeCategory10);
 return function(x)
 {
   if (!(Object.keys(colorObject).includes(x)))
   {
     colorObject[x] = Object.keys(colorObject).length;
   }
     return color(colorObject[x])
 }
}

function tutorial()
{
 d3.select("body").append("button")
                  .attr("class", "skipbutton")
                  .on("click", function()
                {
                  d3.select(".skipbutton").remove()
                  d3.select(".image").remove()
                })
                  .text("SKIP");

 d3.select("body").append("img")
                  .attr("class", "image")
                  .attr("width", window.innerWidth - 50)
                  .attr("height", window.innerHeight- 10);




 i = 0;
 slideShow(i);
 function slideShow(i)
 {
   if (i > 3 )
   {
     d3.select(".image").remove();
     d3.select(".skipbutton").remove();
     return
   }
   d3.select(".image").attr("src", "../docs/tutorial"+ i + ".png");
   i = i + 1;

   setTimeout(slideShow, 4000, i);
 }


}
