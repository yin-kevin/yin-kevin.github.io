//basic map config with custom fills, mercator projection
               
         var series = [];
                       
         var dataset = {};
         var time = Date.now();
         var autorotate = [39.666666666666664, -30];
         var velocity = [.015, -0];
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
                dataset[iso] = { partnerLink: value, fillColor: paletteScale(value) };
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
                 fills: {defaultFill: '#669069'},
                data: dataset,
                geographyConfig: {
                responsive: true,
                    borderColor: 'rgba(245, 251, 255, 0.1)',
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
/*
    let bubbles = [
            {
                latitude: "46",
                longitude: "79"
                fillKey: "red",
                radius: 1,
                city: "Toronto"
            },
            {
                centered: "MH",
                fillKey: "red",
                radius: 1,
                state: "Maharastra"
            },
        ]

        setTimeout(() => { // only start drawing bubbles on the map when map has rendered completely.
            map.bubbles(bubbles, {
                popupTemplate: function (geo, data) {
                    return `<div class="hoverinfo">city: ${data.state}, Slums: ${data.radius}%</div>`;
                }
            });
        }, 1000); */
