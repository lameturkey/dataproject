# Report Koen van der Kamp
# 31/01/2019
The web application allows a user to compare any country to other countries.
The comparison can be made in total medals and uses three different graphs:
1. Heatmap of the world
2. Barchart comparing specific countries
3. Line chart to compare over the years
The charts can also be filtered on sports and on season.

# Final design
My web application its building block is the 'handler' function. This function calls all the relevant make graph functions (bar, line, heatmap). These functions then return the update function to update these graphs.

The update functions all require an object:

Bar/heatmap: {country: amount of medals} (bar is one country heatmap is all)

line: {year: medals} (lots of years)

Everything in the object will be added to the graph. These objects can be requested from the requestData function. This function takes in 3 parameters (country, graph) both strings.

the final design can be seen in detail the following UML:
![Finalstructure](docs/finalstructure.png)

The proposal has been followed when possible. However some changes were made as seen in the following chart:

I will summarize the changes and then explain my tought process behind them:

1. the 'data handler' function makes all the graphs and keeps track of the update functions. the load world map function should only load the world map while leaving more data centered operations to other functions.
2. the line and bar chart updates when clicked on the heatmap. Instead of only the bar chart. This is a design question addressed in the first week of feedback (8/01/2019). I have chosen this approach because of a few reasons:
  1. Clicking on a line in a chart is hard
  2. Removing countries and adding would need two clicks (line and bar needs to be clicked) this solution is more user friendly


3. The data structure of my json object is different. I lost some important features with the proposed data structure. (I.E. what sport?) and made it more nested for easier acess to the data.

4. I had to add two additional json objects to be read for other aspects. One for the total list of sports and one for all the year olympics were held. I chose to make an json of this because otherwise every time the window opens it has to find all the different sports and years cutting into my loading time.

5. The user imput request for data is handled via the handler. This is to make the code as adaptable as possible for future features as no data has been made global. Only the function to request this data.

6. Population data was not used. I feel like the time needed to add another dataset would not be worth the feature (display medals/population on the y axis). Instead I devoted my time to debugging and making the code better and cleaner.

# Challenges
1. The best way to make a json of my data (datastructure)
2. learning how geojson works in combination with paths and d3.
3. How enter(), merge(), exit() work in detail. (with and without a key function)
4. Lots and lots of clarity and user focused updates (legenda with bar chart, clicking on the ticks, line graphtooltip, no data means no medals, consistancy between tooltips for more see the process.md). This was a bigger part of the project than I anticipated.
5. Working clean with comments. I didn't use var in the beginning, this caused alot of bugs later in the development stage. Reading your own code is hard when there are no comments.
