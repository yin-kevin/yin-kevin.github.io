//basic map config with custom fills, mercator projection
               
               var series = [
                  ["USA"], /* US */
                  ["CAN"], /* Canada */
                  ["MEX"], /* Mexico */

                  ["CYM"], /* Cayman Islands */
                  ["JAM"], /* Jamaica */
                  ["TTO"], /* Trinidad & Tobago */
                  ["BHS"], /* Bahamas */
                  ["DOM"], /* Dominican Republic */
                  ["DMA"], /* Dominica */
                  
                  ["FRA"], /* France */
                  ["DEU"], /* Germany */
                  ["GBR"], /* UK */
                  ["BEL"], /* Belgium */
                  ["POL"], /* Poland */
                  ["AUT"], /* Austria */
                  ["NLD"], /* Netherlands */
                  ["CZE"], /* Czech Republic */
                  
                  ["CHN"], /* China */
                  
                  ["NAM"], /* Namibia */
                  ["MOZ"], /* Mozambique */
                  ["SWZ"], /* eSwatini */
                  ["ZAF"], /* South Africa */
                  ["ZMB"], /* Zambia */
                  ["ZWE"], /* Zimbabwe */
                  ["BWA"], /* Botswana */

                  ["EGY"], /* Egypt */
                  ["JOR"], /* Jordan */
                  ["LBN"], /* Lebanon */
                  ["ISR"], /* Israel */
                  ["PSE"], /* Palestine */

                  ["TUN"], /* Tunisia */

                  ["TWN"], /* Taiwan */
                  ["THA"], /* Thailand */
                  ["KHM"], /* Cambodia */
                  ["VNM"], /* Vietnam */

                  ["CUB"], /* Cuba */

                  ["SYR"], /* Syria */
                  ["IRQ"], /* Iraq */

                  ["ITA"], /* Italy */

                 /*
                  ["COL"],
                  ["VEN"],

                  ["SVK"],
                  ["HUN"],

                  ["COD"],
                  ["COG"],

                  ["JPN"],
                  ["KOR"],

                  ["MNG"],

                  ["PER"],

                  ["KEN"],
                  ["TZA"],

                  ["ARG"],
                  ["CHL"],
                  ["URY"] */

                            ];

         /*   '#6fc3df',
            '#8d82c4',
            '#ec8d81',
            '#e7b788',
            '#8ea9e8',
            '#87c5a4',
            '#a7c46f', 
            '#e5d441', 
            '#ca5a7b', 
            '#b27bba'  */
                       
         var dataset = {};
         var time = Date.now();
         var autorotate = [39.666666666666664, -30];
         var velocity = [.015, -0];
         var colorsArray = [
            /* reds */
            '#f9ebea',
            '#f2d7d5',
            '#d98880',
            '#c0392b',
            '#922b21',
            '#641e16',
            /* purples */
            '#f4ecf7',
            '#d7bde2',
            '#bb8fce',
            '#8e44ad',
            '#6c3483',
            '#4a235a',
            /* blues */
            '#eaf2f8',
            '#aed6f1',
            '#7fb3d5',
            '#2980b9',
            '#1f618d',
            '#154360',
            /* turqoises */
            '#e8f8f5',
            '#d0ece7',
            '#73c6b6',
            '#16a085',
            '#117a65',
            '#0b5345',
            /* greens */
            '#e9f7ef',
            '#d4efdf',
            '#7dcea0',
            '#27ae60',
            '#1e8449',
            '#145a32',
            /* yellows */
            '#fcf3cf',
            '#f9e79f',
            '#f7dc6f',
            '#f1c40f',
            '#b7950b',
            '#7d6608',
            /* oranges */
            '#fae5d3',
            '#edbb99',
            '#f0b27a',
            '#e67e22',
            '#af601a',
            '#784212',
                        ];

        var getColor = () => colorsArray[Math.floor(Math.random() * colorsArray.length)]; 
            // We need to colorize every country based on "partnerLink"
            // colors should be uniq for every value.
            // For this purpose we create palette(using min/max series-value)
            var onlyValues = series.map(function(obj){ return obj[1]; });
            var minValue = Math.min.apply(null, onlyValues),
                    maxValue = Math.max.apply(null, onlyValues);
            // create color palette function
            // color can be whatever you wish
            var paletteScale = d3.scale.linear()
                    .domain([minValue,maxValue])
                    .range(["#674765","#FF005E"]);  // color
            // fill dataset in appropriate format
            series.forEach(function(item){ //
                // item example value ["USA", 36.2]
                var iso = item[0],
                    value = item[1];
                dataset[iso] = { partnerLink: value, fillColor: getColor() };
            });
            
	var map;
            var globalRotation = [-19.16,-26];

function redraw() {
  d3.select("#world").html('');
  init(); 
	const buttons = document.querySelectorAll("[data-info]");}

/*
	buttons.forEach((button) => {
  button.addEventListener('click', () => {
  	var partnerLink = JSON.parse(button.getAttribute("data-info")).partnerLink;
     window.open(
  partnerLink,
  '_blank' // <- This is what makes it open in a new window.
);
  });
});
}// redraw */

function init() {

  map = new Datamap({//need global var
                scope: 'world',
                element: document.getElementById('world'),
                projection: 'orthographic',
                projectionConfig: {
                  rotation: globalRotation
                },
                 fills: {defaultFill: '#4e5577'},
                data: dataset,
                geographyConfig: {
                responsive: true,
                    borderColor: 'rgba(138, 145, 183, 0.1)',
                    highlightBorderWidth: 1,
                    highlightFillOpacity: 1,
                    // don't change color on mouse hover
                    highlightFillColor: function(geo) {
                    	 if (typeof geo.partnerLink !== "undefined") {
        return 'white';
      }
      return geo['fillColor'] || '#8cc8e5'
                        
                    },
                    // only change border
                    // show desired information in tooltip
                    popupTemplate: function(geo, data) {
                        // don't show tooltip if country don't present in dataset
                        if (!data) { return ; }
                        // tooltip content
                        return ['',
                        	'<div style="opacity:1;" class="hoverinfo">' + geo.properties.name,
                            /*    '<br>' + data.partnerLink + ' hectares', */
                                ''].join('');        
                                
                    },
                     done: function(datamap) {
           					datamap.svg.call(d3.behavior.zoom().on("zoom", redraw));

           					function redraw() {
                				datamap.svg.selectAll("g").attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
           }
        }
                }
            });
            
         
            //draw a legend for this map
            map.legend();
            
              map.graticule();

              var timer;
  
function spin() {
  timer = d3.timer(function() {
    var dt = Date.now() -time;
    
    map.projection.rotate([autorotate[0] + velocity[0] * dt, autorotate[1] + velocity[1] * dt]);
    
    redraw();
  });
};

  var drag = d3.behavior.drag().on('drag', function() {
    var dx = d3.event.dx;
            var dy = d3.event.dy;

            // var rotation = livemapScope.rotation;
            var rotation = map.projection.rotate();
            var radius = map.projection.scale();
            var scale = d3.scale.linear()
              .domain([-1 * radius, radius])
              .range([-90, 90]);
            var degX = scale(dx);
            var degY = scale(dy);
            rotation[0] += degX;
            rotation[1] -= degY;
            if (rotation[1] > 90) rotation[1] = 90;
            if (rotation[1] < -90) rotation[1] = -90;

            if (rotation[0] >= 180) rotation[0] -= 360;
    globalRotation = rotation;
    redraw();
  });

 d3.select("#world").select("svg").call(drag);

}// init

redraw()