// create a geo path - https://github.com/mbostock/d3/wiki/Geo-Paths
var svgWidth = Math.max(document.documentElement.clientWidth, window.innerWidth || 0),
    svgHeight = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);


// create an svg element
var svg = d3.select("#chart")
  .append("svg")
  .attr("id", "choropleth")
  .attr("viewBox", `0 0 ${svgWidth} ${svgHeight}`)
  .attr("preserveAspectRatio", "xMinYMin");

const zoom = d3.zoom()
               .on("zoom", function () {
                   const transform = d3.zoomTransform(this);
                   svg.attr("transform", transform);
               });

svg.call(zoom);

const map = svg.append("g")
               .attr("class", "map");

// create a container for counties
var counties = map.append("g")
    .attr("id", "counties");
 
// create a container for states
var states = map.append("g")
    .attr("id", "states");

Promise.all([
    d3.json("/d3_choropleth/data/us-states.json"),
    d3.json("/d3_choropleth/data/us-counties.json"),
    d3.csv("/d3_choropleth/data/data.csv"),
]).then(function(response) {
    
    drawMap(response[0].features, response[1].features, response[2]);

}).catch(function(err) {
    if (err) throw err;
});


function drawMap(stateFeature, countyFeature, data) {

    const projection = d3.geoAlbersUsa() 
                         .scale(1200)
                         .translate([svgWidth / 2, svgHeight / 2]);
          path = d3.geoPath(projection);

    // county-level drawing
    counties.selectAll("path")
    .data(countyFeature)
    .enter()
    .append("path")
    .attr('fill', 'none')
    .attr('stroke', 'black')
    .attr('stroke-width', '1')
    //   .attr("class", data ? quantize : null)
    .attr("d", path);


    data.forEach(d => {
        d.poverty = parseFloat(d.poverty);
    });

    
    // Discrete color scale and legend
    // const colorScale = d3.scaleQuantize()
    // .domain(d3.extent(data, d => d.poverty))
    // .range(d3.schemeYlGn[9]);   

    // legend({
    //     color: d3.scaleQuantize(colorScale.domain(), d3.schemeYlGn[9]),
    //     title: "Poverty Index by State",
    //     tickSize: 0,
    //     tickFormat: ".0f",
    //     positionX: svgWidth / 1.8,  // legend position
    //     positionY: svgHeight / 4.5
    // });


    // Continuous color scale and legend
    const colorScale = d3.scaleSequential()
                         .domain(d3.extent(data, d => d.poverty))                        
                         .interpolator(d3.piecewise(d3.interpolateHcl, [d3.hcl(NaN, 0, 100), "red", "black"]));

    legend({
        color: d3.scaleSequential(colorScale.domain(),
                d3.piecewise(d3.interpolateHcl, [d3.hcl(NaN, 0, 100), "red", "black"])),
        title: "Poverty Index by State",
        tickSize: 0,
        positionX: svgWidth / 1.8,  // legend position
        positionY: svgHeight / 4.5
    });


    // "JOIN"
    // How would you JOIN these two Javascript arrays, using Javascript
    // "optimize" , 
    let povertyByState = {};

    data.forEach(function (d) {
            povertyByState[d.state] = {
                poverty: +d.poverty
                // females: +d.females,
                // males: +d.males
            }
        });

    stateFeature.forEach(function (d) {
        d.details = povertyByState[d.properties.NAME] ? povertyByState[d.properties.NAME] : {};
    });

    // countty-level drawing
    states.selectAll("path")
          .data(stateFeature)
          .enter()
          .append("path")
          .attr("name", function (d) {
                return d.properties.NAME;
            })
          .attr("id", function (d) {  // contry code ex. 'AFG'
                return d.properties.STATE;
            })
          .attr("d", path)
          .attr('stroke', 'brown')
          .attr('stroke-width', '1')
        //   .attr('fill', 'none')
          .style("fill", function (d) {
                return d.details && d.details.poverty ? colorScale(d.details.poverty) : undefined;
            });
    




// load the county shape data
// d3.json("us-counties.json", function(json) {
//   // create paths for each county using the json data
//   // and the geo path generator to draw the shapes
//   counties.selectAll("path")
//       .data(json.stateFeature)
//       .enter()
//       .append("path")
//       .attr('fill', 'none')
//       .attr('stroke', 'black')
//       .attr('stroke-width', '1')
//     //   .attr("class", data ? quantize : null)
//       .attr("d", path);
// });
 
// load the state shape data
// d3.json("us-states.json", function(json) {
//   // create paths for each state using the json data
//   // and the geo path generator to draw the shapes
// //   console.log(json);
// //   console.log(json.stateFeature);
//   states.selectAll("path")
//       .data(json.stateFeature)
//       .enter()
//       .append("path")
//       .attr("name", function (d) {
//             return d.properties.NAME;
//       })
//       .attr('fill', 'none')
//       .attr('stroke', 'black')
//       .attr('stroke-width', '2')
//       .attr("d", path);
// });
 
// // load the unemployment by county data
// // d3.json("unemployment.json", function(json) {
// //   data = json;
 
// //   // for each county, set the css class using the quantize function
// //   // (an external CSS file contains the css classes for each color in the scheme)
// //   counties.selectAll("path")
// //       .attr("class", quantize);
// // });
// // const unEmploymentData = Object.assign(new Map(await
// // url = "https://gist.githubusercontent.com/Fil/fa99e877a5698f5fdf0eb0246c86348b/raw/d3761d7e58f9c7f7d2b3c4679ddd65c86c6c3fdb/unemployment201907.csv"

// // const unEmploymentData = d3.csv(url, ({name, rate}) => [name, +rate]);

// // console.log(unEmploymentData);

// // const color = d3.scaleQuantize([1, 7], d3.schemeBlues[6]);
// // console.log(color);


// // const color = d3.scaleQuantize([1, 7], d3.schemeBlues[6]);



// d3.csv("data.csv", function(data) {
// //    var color = d3.scaleThreshold()
// //                  .domain(d3.extent(data, d => d.poverty))
// //                  .range(["#f7fcfd", "#e0ecf4", "#bfd3e6", "#9ebcda", "#8c96c6", "#8c6bb1", "#88419d", "#810f7c", "#4d004b"]);

// //   console.log(data);

//   data.forEach(d => {
//       d.poverty = parseFloat(d.poverty);
//   });

  
//   // for each county, set the css class using the quantize function
//   // (an external CSS file contains the css classes for each color in the scheme)
//   states.selectAll("path")
//         .data(data)
//         .style('fill', d => colorScale(d.poverty));
        
//         // .attr("class", quantize);
// });
 
// // quantize function takes a data point and returns a number
// // between 0 and 8, to indicate intensity, the prepends a 'q'
// // and appends '-9'
// // function quantize(d) {
// //   return "q" + Math.min(8, ~~(data[d.id] * 9 / 12)) + "-9";
// // }

};