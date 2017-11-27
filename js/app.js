function AppViewModel() {
	var self = this;
	
		self.locations= [
			{title: 'Bora-Bora Pearl Beach Resort & Spa', location: {lat: -16.477894, lng: -151.771651}},
			{title: 'Conrad Bora Bora Nui', location: {lat: -16.529282, lng: -151.772837}},
			{title: 'Bora Bora Lagoonarium', location: {lat: -16.495317, lng: -151.703044}},
			{title: 'Plage Matira', location: {lat: -16.542339, lng: -151.737281}},
			{title: 'Four Seasons Resort Bora Bora', location: {lat: -16.472734, lng: -151.708089}}
		];    
	
		self.location= ko.observableArray([
			new filter(self.locations[0]),
		]);
	
	//Operations
	self.openFilter = function(){
		let mapElem = document.getElementById('map');		
		let filterElem = document.getElementById('filterMenu');		
		if (filterElem.style.display == "none") {
			filterElem.style.display = "block";
			mapElem.style.width = "81%";
			mapElem.style.float = "right";
			filterElem.style.float = "left";
		} else {
			filterElem.style.display = "none";
			mapElem.style.width = "100%";
			mapElem.style.float = "none";
		};
	};

}

ko.applyBindings(new AppViewModel());

function filter(avaliableLocations) {
	var self = this;
	self.location= ko.observable(avaliableLocations);
	
}


//MAP
var map;

// Create a new blank array for all the listing markers.
var markers = [];

function initMap() {
	// Constructor creates a new map - only center and zoom are required.
	map = new google.maps.Map(document.getElementById('map'), {
		center: {lat: -16.497280, lng: -151.740943},
		zoom: 13,
		mapTypeControl: false
	});

	// These are the real estate listings that will be shown to the user.
	// Normally we'd have these in a database instead.
	var locations = [
		{title: 'Bora-Bora Pearl Beach Resort & Spa', location: {lat: -16.477894, lng: -151.771651}},
		{title: 'Conrad Bora Bora Nui', location: {lat: -16.529282, lng: -151.772837}},
		{title: 'Bora Bora Lagoonarium', location: {lat: -16.495317, lng: -151.703044}},
		{title: 'Plage Matira', location: {lat: -16.542339, lng: -151.737281}},
		{title: 'Four Seasons Resort Bora Bora', location: {lat: -16.472734, lng: -151.708089}}
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

		// Two event listeners - one for mouseover, one for mouseout,
        // to change the colors back and forth.
		marker.addListener('mouseover', function() {
			this.setIcon(highlightedIcon);
		});
		
		marker.addListener('mouseout', function() {
			this.setIcon(defaultIcon);
		});

		// Create an onclick event to open an infowindow at each marker.
		marker.addListener('click', function() {
			populateInfoWindow(this, largeInfowindow);
		});
		bounds.extend(markers[i].position);
	}
	// Extend the boundaries of the map for each marker
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

