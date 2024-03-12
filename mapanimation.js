var markers = [];
var trails = {};

function init(){
	var myOptions = {
		zoom      : 14,
		center    : { lat:42.353350,lng:-71.091525},
		mapTypeId : google.maps.MapTypeId.ROADMAP
	};
	var element = document.getElementById('map');
  	map = new google.maps.Map(element, myOptions);
  	addMarkers();
}

// Add bus markers to map
async function addMarkers(){
    // get bus data
    var locations = await getBusLocations();

    // loop through data, add bus markers
    locations.forEach(function(bus){
        var marker = getMarker(bus.id);      
        if (marker){
            moveMarker(marker, bus);
            updateTrail(bus); // Add this line to update the trail
        }
        else{
            addMarker(bus);         
        }
    });

	// timer
	console.log(new Date());
	setTimeout(addMarkers,15000);
}

// Request bus data from MBTA
async function getBusLocations(){
	var url = 'https://api-v3.mbta.com/vehicles?api_key=here'; //Replace here with a reference to Your Own API key	
	var response = await fetch(url);
	var json     = await response.json();
	return json.data;
}

function addMarker(bus){
	var icon = getIcon(bus);
	var marker = new google.maps.Marker({
	    position: {
	    	lat: bus.attributes.latitude, 
	    	lng: bus.attributes.longitude
	    },
	    map: map,
	    icon: icon,
	    id: bus.id
	});

       // Add event listener to show info window on mouseover
       marker.addListener('mouseover', function () {
        showInfoWindow(marker, bus);
    });

	markers.push(marker);
}

function getIcon(bus){
	// select icon based on bus direction
	if (bus.attributes.direction_id === 0) {
		return 'imgs/red.png';
	}
	return 'imgs/blue.png';	
}

function moveMarker(marker,bus) {
	// change icon if bus has changed direction
	var icon = getIcon(bus);
	marker.setIcon(icon);

	// move icon to new lat/lon
    marker.setPosition( {
    	lat: bus.attributes.latitude, 
    	lng: bus.attributes.longitude
	});
}

function getMarker(id){
	var marker = markers.find(function(item){
		return item.id === id;
	});
	return marker;
}

//leaves trail behind bus
function updateTrail(bus) {
    // Check if trail array exists, if not, initialize it
    if (!trails[bus.id]) {
        trails[bus.id] = [];
    }

    var trail = trails[bus.id];
    trail.push({
        lat: bus.attributes.latitude,
        lng: bus.attributes.longitude
    });

    if (trail.length > 1) {
        var trailPath = new google.maps.Polyline({
            path: trail,
            geodesic: true,
            strokeColor: '#FF0000',
            strokeOpacity: 1.0,
            strokeWeight: 2
        });
        trailPath.setMap(map);
    }
}


// Show info window when hovering over the marker
function showInfoWindow(marker, bus) {
    var contentString = '<div>' +
        '<p>Bus ID: ' + bus.id + '</p>' +
        '<p>Route: ' + bus.relationships.route.data.id + '</p>' +
        '<p>Direction: ' + bus.attributes.direction_id + '</p>' +
        // Add more information about the bus as needed
        '</div>';

    var infoWindow = new google.maps.InfoWindow({
        content: contentString
    });

    infoWindow.open(map, marker);
}

window.onload = init;