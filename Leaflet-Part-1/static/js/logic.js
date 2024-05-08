// Store API endpoitn as queryURL

let queryURL = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"


// Define a markerSize() function that will give each point a different radius based on earthquate magnitude. 

function markerSize(magnitude) {
    return Math.max(1, magnitude * 5); // earthquate magnitude scale is small, this method was used to make sizes of marker differ visually
  };

// Define a marker Color based on earthquate depth
function markerColor(depth) {
    return depth > 90 ? '#ff3333' : // Deepest earthquakes
           depth > 70 ? '#ff9f33' : // Deep earthquakes
           depth > 50 ? '#ffce33' : // Intermediate-depth earthquakes
           depth > 30 ? '#fff033' : // Intermediate-depth to shallow earthquakes
           depth > 10 ? '#f0ff33' : // Shallow to intermediate-depth earthquakes
                        '#7aff33';  // Shallow earthquakes
};
// Perform a GET request to the query URL

d3.json(queryURL).then(function (data) {

    // sending data.features to the createFeatures function
    createFeatures(data.features);

});

function createFeatures(earthquakeData) {

// Define a function that runs once for each feature 
// Add a popup for each feature providing additonal information about the earthquake when its associated marker is clicked

    function onEachFeature(feature, layer) {
        layer.bindPopup(`<h3>${feature.properties.place}</h3><hr><p>Magnitude: ${feature.properties.mag}, Depth: ${feature.geometry.coordinates[2]} km</p>`);
    }
    let earthquakes = L.geoJSON(earthquakeData, {
        onEachFeature: onEachFeature,
        pointToLayer: function (feature, latlng) {
            return L.circleMarker(latlng, {
                radius: markerSize(feature.properties.mag),// Set the radius based on magnitude
                fillColor: markerColor(feature.geometry.coordinates[2]), // Set the color based on depth of the earthquate
                color: "#000",
                weight: 1,
                opacity: 1,
                fillOpacity: 0.8
            });
        }
    });
  // Send our earthquakes layer to the createMap function/
  createMap(earthquakes);
}

function createMap(earthquakes) {

    // creating the base layer

    let street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  });

  // Create a baseMaps object.
  let baseMaps = {
    "Street Map": street
};

    // Create an overlay object to hold our overlay.
    let overlayMaps = {
        Earthquakes: earthquakes
  };
  // Create our map, giving it the streetmap and earthquakes layers to display on load.
  let myMap = L.map("map", {
    center: [
      37.09, -95.71
    ],
    zoom: 5,
    layers: [street, earthquakes]
  });

  // As an option create a layer control.
  // Pass it our baseMaps and overlayMaps.
  // Add the layer control to the map.
  // L.control.layers(baseMaps, overlayMaps).addTo(myMap);


  // Create a legend 

  let legend = L.control({position: 'bottomright'});
  legend.onAdd = function (map) {

    let div = L.DomUtil.create('div', 'info legend');
    let grades = [0, 10, 30, 50, 70, 90];
    let labels = [];

    // Loop through the depth ranges and generate legend labels
    for (let i = 0; i < grades.length; i++) {
        labels.push(
            '<i style="background:' + markerColor(grades[i] + 1) + '"></i> ' +
            grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+')
        );
    }

    // Add legend content to the div
    div.innerHTML = labels.join('<br>');

    // Add legend content here
    return div;
};

// Adding legend to the map
legend.addTo(myMap);

  

};

