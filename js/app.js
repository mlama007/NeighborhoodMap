function openFilter(){
	let mapElem = document.getElementById('map');		
	let filterElem = document.getElementById('filterMenu');		
	if (filterElem.style.display == "none") {
		filterElem.style.display = "block";
		mapElem.style.width = "70%";
		mapElem.style.float = "right";
		filterElem.style.float = "left";
	} else {
		filterElem.style.display = "none";
		mapElem.style.width = "100%";
		mapElem.style.float = "none";
	}
};

//  MAP ------------------------------------------------------------------------------------------------------------------------
var map;

// Create a new blank array for all the listing markers.
var markers = [];

function initMap() {
	// Constructor creates a new map - only center and zoom are required.
	map = new google.maps.Map(document.getElementById('map'), {
	  center: {lat: 40.7413549, lng: -73.9980244},
	  zoom: 13,
	  mapTypeControl: false
	});

	// These are the real estate listings that will be shown to the user.
	// Normally we'd have these in a database instead.
	var locations = [
		{title: 'National Museum of American History', location: {lat: 38.891296, lng: -77.029945}},
		{title: 'Smithsonian National Museum of Natural History', location: {lat: 38.891296, lng: -77.026131}},
		{title: 'Marian Koshland Science Museum', location: {lat: 38.896259, lng: -77.019745}},
		{title: 'Smithsonian National Air and Space Museum', location: {lat: 38.887562, lng: -77.019844}},
		{title: 'National Gallery of Art', location: {lat: 38.891327,lng:  -77.019974}},
		{title: 'Smithsonian American Art Museum', location: {lat: 38.897846, lng: -77.023064}}
	];

	var largeInfowindow = new google.maps.InfoWindow();
	var bounds = new google.maps.LatLngBounds();

	// Style the markers a bit. This will be our listing marker icon.
	var defaultIcon = makeMarkerIcon('7161EF');
	
	// Create a "highlighted location" marker color for when the user
	// mouses over the marker.
	var highlightedIcon = makeMarkerIcon('68efad');

	// The following group uses the location array to create an array of markers on initialize.
	for (var i = 0; i < locations.length; i++) {
		// Get the position from the location array.
		var position = locations[i].location;
		var title = locations[i].title;
		// Create a marker per location, and put into markers array.
		var marker = new google.maps.Marker({
			map: map,
			position: position,
			title: title,
			icon:  defaultIcon,
			animation: google.maps.Animation.DROP,
			id: i
		});
		// Push the marker to our array of markers.
		markers.push(marker);

		bounds.extend(markers[i].position);

		// Two event listeners - one for mouseover, one for mouseout,
		// to change the colors back and forth.
		marker.addListener('mouseover', mouseover);
		marker.addListener('mouseout', mouseout);

		// Create an onclick event to open an infowindow at each marker.
		marker.addListener('click', clicked);
	}
	// Extend the boundaries of the map for each marker
	map.fitBounds(bounds);
	
	function mouseover() {
		this.setIcon(highlightedIcon);
	}
	function mouseout() {
		this.setIcon(defaultIcon);
	}

	function clicked() {
		let self = this;
		self.setAnimation(google.maps.Animation.BOUNCE);
		setTimeout(function(){ self.setAnimation(null); }, 750);
		populateInfoWindow(this, largeInfowindow);
	}

	document.getElementById('show-listings').addEventListener('click', showListings);
	document.getElementById('hide-listings').addEventListener('click', hideListings);
}

// This function will loop through the markers array and display them all.
function showListings() {
	var bounds = new google.maps.LatLngBounds();
	// Extend the boundaries of the map for each marker and display the marker
	for (var i = 0; i < markers.length; i++) {
	  markers[i].setMap(map);
	  bounds.extend(markers[i].position);
	  markers[i].animation = google.maps.Animation.DROP;
	}
	map.fitBounds(bounds);
}

// This function will loop through the listings and hide them all.
function hideListings() {
	for (var i = 0; i < markers.length; i++) {
		markers[i].setMap(null);
	}
}

//Drop down menu hides / shows markers
function selectFunction() {
	let selected = document.getElementById("selection").selectedIndex;
	let value = document.getElementsByTagName("option")[selected].value
	if (value === "Art"){
		hideListings();
		showListingsArt();
	} if (value === "History"){
		hideListings();
		showListingsHistory();
	} if (value === "Science"){
		hideListings();
		showListingsScience();
	} 
}

//show Art Markers
function showListingsArt() {
	var bounds = new google.maps.LatLngBounds();
	// Extend the boundaries of the map for each marker and display the marker
	for (var i = 4; i < markers.length; i++) {
	  markers[i].setMap(map);
	  bounds.extend(markers[i].position);
	  markers[i].animation = google.maps.Animation.DROP;
	}
	map.fitBounds(bounds);
}

//show History Markers
function showListingsHistory() {
	var bounds = new google.maps.LatLngBounds();
	// Extend the boundaries of the map for each marker and display the marker
	for (var i = 0; i < 2 ; i++) {
	  markers[i].setMap(map);
	  bounds.extend(markers[i].position);
	  markers[i].animation = google.maps.Animation.DROP;
	}
	map.fitBounds(bounds);
}

//show Science Markers
function showListingsScience() {
	var bounds = new google.maps.LatLngBounds();
	// Extend the boundaries of the map for each marker and display the marker
	for (var i = 2; i < 4; i++) {
	  markers[i].setMap(map);
	  bounds.extend(markers[i].position);
	  markers[i].animation = google.maps.Animation.DROP;
	}
	map.fitBounds(bounds);
}


// This function populates the infowindow when the marker is clicked. We'll only allow
// one infowindow which will open at the marker that is clicked, and populate based
// on that markers position.
function populateInfoWindow(marker, infowindow) {
	// Check to make sure the infowindow is not already opened on this marker.
	if (infowindow.marker != marker) {
		infowindow.marker = marker;
		infowindow.setContent('<div>' + marker.title + '</div>');
		//add some 3rd party info
		infowindow.open(map, marker);
		// Make sure the marker property is cleared if the infowindow is closed.
		infowindow.addListener('closeclick',function(){
			infowindow.setMarker = null;				
		});
	}
}

function makeMarkerIcon(markerColor) {
	var markerImage = new google.maps.MarkerImage(
	  'http://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|'+ markerColor +
	  '|40|_|%E2%80%A2',
	  new google.maps.Size(21, 34),
	  new google.maps.Point(0, 0),
	  new google.maps.Point(10, 34),
	  new google.maps.Size(21,34));
	return markerImage;
}

function mapError(){
	alert("Map could not load.");
}