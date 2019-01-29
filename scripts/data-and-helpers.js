
// to call the script
window.onload = dataHandler

// initialise all the graphs
function dataHandler()
{

  // startup tutorial
  tutorial()
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
    datalist =  calculatevalues(data, "", "bar");

    // setup all the update functions and the function that can request data
    window.updateheatmap = loadheatmap(datalist, geojson);
    window.updatebar = loadbar();
    window.updateline = loadline(yearlist);
    window.requestdata = function(country, kind)
    {
      return calculatevalues(data, country, kind);
    }
  });
 }

// make the navigation buttons
function navbar(sportslist)
{

 // season dropdown
 seasonselect = d3.select("body").append("select").attr("class", "seasonselect").on("change", onchange)

 seasonselect.append("option").text("All").attr("value", "All")
 seasonselect.append("option").text("Winter").attr("value", "Winter")
 seasonselect.append("option").text("Summer").attr("value", "Summer")

 // sport dropdown
 sportselect = d3.select("body").append("select").attr("class", "sportselect").on("change", onchange)
 for (var item in sportslist)
 {
   sportselect.append("option").text(sportslist[item]).attr('value', sportslist[item]);
 }

 // other links
 d3.select("body").append("a")
                  .attr("class", "aboutme")
                  .attr("href", "pages/aboutme.html")
                  .text("about me")

 d3.select("body").append("text")
                  .attr("class", "filtertext")
                  .text("Filters:")

 d3.select("body").append("a")
                  .attr("class", "aboutdata")
                  .attr("href", "pages/aboutdata.html")
                  .text("about data")
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
   if (!(Object.keys(colorobject).includes(x)))
   {
     colorobject[x] = Object.keys(colorobject).length
   }
     return color(colorobject[x])
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
                  .text("SKIP")

 d3.select("body").append("img")
                  .attr("class", "image")
                  .attr("width", window.innerWidth - 50)
                  .attr("height", window.innerHeight- 10);




 i = 0
 slideshow(i)
 function slideshow(i)
 {
   if (i > 3 )
   {
     d3.select(".image").remove()
     d3.select(".skipbutton").remove()
     return
   }
   d3.select(".image").attr("src", "../docs/tutorial"+ i + ".png")
   i = i + 1

   setTimeout(slideshow, 4000, i)
 }


}
