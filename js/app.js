let CountryModel = function(data){
    var self = this;
    self.id = ko.observable(data.id);
    self.name = ko.observable(data.name);
};

function MapModelView(){
	let self = this;

	self.locals = ko.observableArray([
		{title: 'National Museum of American History', type: "History", id: '0'},
		{title: 'Smithsonian National Museum of Natural History', type: "History", id: '1'},
		{title: 'Marian Koshland Science Museum', type: "Science", id: '2'},
		{title: 'Smithsonian National Air and Space Museum',type: "Science", id: '3'},
		{title: 'National Gallery of Art',type: "Art", id: '4'},
		{title: 'Smithsonian American Art Museum',type: "Art", id: '5'},
	]);
	
	//Drop down menu hides / shows markers
	self.selectedChoice = ko.observable();
	self.sendMe = function(){
		let selected = this.selectedChoice();
		showListings();
		if (selected === "History"){
			showHistory();
		}
		else if (selected === "Science"){
			showScience();
		}
		else if (selected === "Art"){
			showArt();
		}
	};

	//display list of museums
	self.showMe = ko.observable(true);

	//Operations
	self.openFilter = function(){
		let mapElem = document.getElementById('map');		
		let filterElem = document.getElementById('filterMenu');		
		if (filterElem.style.display == "none") {
			filterElem.style.display = "inline";		
		} else {			
			filterElem.style.display = "none";
		}
	};

	self.whenClicked = function(locals, index){
		ifClick(index.id);
	};

	self.showListings =function(){
		showListings();
	};
	
	self.hideListings =function(){
		hideListings();		
	};
}

let mmv = new MapModelView();
ko.applyBindings(mmv);


// The function to trigger the marker click, 'id' is the reference index to the 'markers' array.
function ifClick(id){
	google.maps.event.trigger(markers[id], 'click');		
}

// This function will loop through the markers array and display them all.
function showList(){
	let listedLocations = document.getElementsByClassName('listedLocations');
	for (let j = 0; j < 6; j++){
		listedLocations[j].style.visibility= 'visible';
	}
	mmv.showMe(true);	
}

function showListings() {
	showList();
	let bounds = new google.maps.LatLngBounds();
	// Extend the boundaries of the map for each marker and display the marker
	for (let i = 0; i < markers.length; i++) {
		markers[i].setMap(map);
		bounds.extend(markers[i].position);
		markers[i].animation = google.maps.Animation.DROP;
	}
	map.fitBounds(bounds);
	mmv.showMe(true);
}

// This function will loop through the listings and hide them all.
function hideListings() {
	for (let i = 0; i < markers.length; i++) {
		markers[i].setMap(null);
	}
	mmv.showMe(false);
}

function showHistory() {
	showList();
	for (let i = 2; i < markers.length; i++) {
		markers[i].setMap(null);
		document.getElementById('ul').children[i].style.visibility= 'hidden';		
	}
	mmv.showMe(true);
}

function showScience() {
	showList();
	hideListings();	
	for (let i = 3; i < 5; i++) {
		markers[i].setMap(map);
		document.getElementsByClassName('listedLocations')[0].style.visibility= 'hidden';
		document.getElementsByClassName('listedLocations')[1].style.visibility= 'hidden';
		document.getElementsByClassName('listedLocations')[4].style.visibility= 'hidden';
		document.getElementsByClassName('listedLocations')[5].style.visibility= 'hidden';	
	}
	mmv.showMe(true);	
}

function showArt() {
	showList();
	for (let i = 0; i < 4; i++) {
		markers[i].setMap(null);
		document.getElementById('ul').children[i].style.visibility= 'hidden';
	}	
	mmv.showMe(true);
}


//  MAP ------------------------------------------------------------------------------------------------------------------------
let map;
let locations = [
	{title: 'National Museum of American History', location: {lat: 38.891296, lng: -77.029945}},
	{title: 'Smithsonian National Museum of Natural History', location: {lat: 38.891296, lng: -77.026131}},
	{title: 'Marian Koshland Science Museum', location: {lat: 38.896259, lng: -77.019745}},
	{title: 'Smithsonian National Air and Space Museum', location: {lat: 38.887562, lng: -77.019844}},
	{title: 'National Gallery of Art', location: {lat: 38.891327,lng:  -77.019974}},
	{title: 'Smithsonian American Art Museum', location: {lat: 38.897846, lng: -77.023064}}
];
// Create a new blank array for all the listing markers.
let markers = [];

function initMap() {
	// Constructor creates a new map - only center and zoom are required.
	map = new google.maps.Map(document.getElementById('map'), {
	  center: {lat: 40.7413549, lng: -73.9980244},
	  zoom: 13,
	  mapTypeControl: false
	});

	let largeInfowindow = new google.maps.InfoWindow();
	let bounds = new google.maps.LatLngBounds();

	// Style the markers a bit. This will be our listing marker icon.
	let defaultIcon = makeMarkerIcon('7161EF');
	
	// Create a "highlighted location" marker color for when the user
	// mouses over the marker.
	let highlightedIcon = makeMarkerIcon('68efad');

	// The following group uses the location array to create an array of markers on initialize.
	for (let i = 0; i < locations.length; i++) {
		// Get the position from the location array.
		let position = locations[i].location;
		let title = locations[i].title;
		// Create a marker per location, and put into markers array.
		let marker = new google.maps.Marker({
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
}

// This function populates the infowindow when the marker is clicked. We'll only allow
// one infowindow which will open at the marker that is clicked, and populate based
// on that markers position.
function populateInfoWindow(marker, infowindow) {
	let self =this;
	self.pictureURL = "";

	// Check to make sure the infowindow is not already opened on this marker.
	if (infowindow.marker != marker) {
		infowindow.marker = marker;
		//add some 3rd party info
//--------------------------		
		//gets json data for img
		let flickrURL = 'https://api.flickr.com/services/rest/?method=flickr.photos.search' +
			'&api_key=4b20279d76aa23a64ef1b06509d01e09&text=' + marker.title.replace(' ', '+') +
			'&license=1%2C2%2C3%2C4%2C5%2C6%2C7&content_type=1&lat=' + marker.position.lat() +
			'&lon=' + marker.position.lng() + '&radius=1&radius_units=km&per_page=15&page=1' +
			'&format=json&nojsoncallback=1';
		let myPicture;
		$.getJSON(flickrURL)
		.done(function(data) {
			getPicture(data);
			infowindow.open(map, marker);
		})
		.fail(function(jqxhr, textStatus, error) {
			alert("Flickr unable to load");
		});
		
		function getPicture(data){
			myPicture = data.photos.photo[0];			
			self.pictureURL = 'https://farm' + myPicture.farm + '.staticflickr.com/'+ myPicture.server + '/' + 
				myPicture.id + '_' + myPicture.secret + '.jpg';
			infowindow.setContent('<div class="window"> <p>' + marker.title + '</p><img class="windowPic" src="'+self.pictureURL+'"></img> </div>');
		}		
//--------------------------
	
		// Make sure the marker property is cleared if the infowindow is closed.
		infowindow.addListener('closeclick',function(){
			infowindow.setMarker = null;				
		});
	}
}

function makeMarkerIcon(markerColor) {
	let markerImage = new google.maps.MarkerImage(
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
