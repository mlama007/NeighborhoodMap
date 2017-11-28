function AppViewModel() {
	var self = this;
	
		self.locations= [
			{title: 'Bora-Bora Pearl Beach Resort & Spa', location: "https://en.wikipedia.org/wiki/Tevairoa"},
			{title: 'Conrad Bora Bora Nui', location: "https://en.wikipedia.org/wiki/Toopua"},
			{title: 'Bora Bora Lagoonarium', location: "https://en.wikipedia.org/wiki/Tupe_(Bora_Bora)"},
			{title: 'Plage Matira', location: "https://en.wikipedia.org/wiki/Administrative_divisions_of_French_Polynesia"},
			{title: 'Four Seasons Resort Bora Bora', location: "https://en.wikipedia.org/wiki/Four_Seasons_Resort_Bora_Bora"}
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
			mapElem.style.width = "70%";
			mapElem.style.float = "right";
			filterElem.style.float = "left";
		} else {
			filterElem.style.display = "none";
			mapElem.style.width = "100%";
			mapElem.style.float = "none";
		}
	};
}

ko.applyBindings(new AppViewModel());

function filter(avaliableLocations) {
	var self = this;
	self.location= ko.observable(avaliableLocations);
}

//  MAP ------------------------------------------------------------------------------------------------------------------------
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


// WIKIPEDIA  ------------------------------------------------------------------------------------------------

//from http://okfnlabs.org/wikipediajs/?url=http%3A%2F%2Fen.wikipedia.org%2Fwiki%2FNormandy_landings

var WIKIPEDIA = function() {
	var my = {};
  
// DBPedia SPARQL endpoint
my.endpoint = 'http://dbpedia.org/sparql/';

// ### getData
//
// Return structured information (via callback) on the provided Wikipedia URL by querying
// the DBPedia SPARQL endpoint and then tidying the data up.
//
// @param: wikipediaUrlOrPageName. A wikipedia URL or pageName or an object
// with following struture:
//
//     {
//       url: wikipediaURLOrPageName,
//       raw: false // do not include the raw data in what is returned
//     }
//
// @return: Data is return in the form of the following hash:
//
//    {
//      raw: the-raw-json-from-dbpedia,
//      summary: a-cleaned-up-set-of-the-properties (see extractSummary),
//      dbpediaUrl: dbpedia-resource-url e.g. http://dbpedia.org/resource/World_War_II
//    }
//
// Function is asynchronous as we have to call out to DBPedia to get the
// info.
my.getData = function(wikipediaUrlOrPageName, callback, error) {
	var url = my._getDbpediaUrl(wikipediaUrlOrPageName);
	function onSuccess(data) {
	var out = {
		raw: data,
		dbpediaUrl: url,
		summary: null
	};
	if (data) {
		out.summary = my.extractSummary(url, data);
	} else {
		out.error = 'Failed to retrieve data. Is the URL or page name correct?';
	}
	callback(out);
	}
	my.getRawJson(url, onSuccess, error);
};

// ### _getDbpediaUrl
//
// Convert the incoming URL or page name to a DBPedia url
my._getDbpediaUrl = function(url) {
	if (url.indexOf('wikipedia')!=-1) {
	var parts = url.split('/');
	var title = parts[parts.length-1];
	url = 'http://dbpedia.org/resource/' + title;
	return url;
	} else if (url.indexOf('dbpedia.org')!=-1) {
	return url;
	} else {
	url = 'http://dbpedia.org/resource/' + url.replace(/ /g, '_');
	return url;
	}
};

// ### getRawJson
//
// get raw RDF JSON for DBPedia resource from DBPedia SPARQL endpoint
my.getRawJson = function(url, callback, error) {
	var sparqlQuery = 'DESCRIBE <{{url}}>'.replace('{{url}}', url);
	var jqxhr = $.ajax({
	url: my.endpoint,
	data: {
		query: sparqlQuery,
		// format: 'application/x-json+ld'
		format: 'application/rdf+json'
	},
	dataType: 'json',
	success: callback,
	error: error
	});
};

// Standard RDF namespace prefixes for use in lookupProperty function
my.PREFIX = {
	rdf: "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
	rdfs: "http://www.w3.org/2000/01/rdf-schema#",
	xsd: "http://www.w3.org/2001/XMLSchema#",
	owl: "http://www.w3.org/2002/07/owl#",
	dc: "http://purl.org/dc/terms/",
	foaf: "http://xmlns.com/foaf/0.1/",
	vcard: "http://www.w3.org/2006/vcard/ns#",
	dbp: "http://dbpedia.org/property/",
	dbo: "http://dbpedia.org/ontology/",
	geo: "http://www.geonames.org/ontology#",
	wgs: "http://www.w3.org/2003/01/geo/wgs84_pos#"
};

my._expandNamespacePrefix = function(uriWithPrefix) {
	for(var key in WIKIPEDIA.PREFIX) {
	if (uriWithPrefix.indexOf(key + ':') === 0) {
		uriWithPrefix = WIKIPEDIA.PREFIX[key] + uriWithPrefix.slice(key.length + 1);
	}
	}
	return uriWithPrefix;
};

// ### lookupProperty
// 
// lookup a property value given a standard RDF/JSON property dictionary
// e.g. something like ...
// 
//       ...
//       "http://dbpedia.org/property/regent": [
//              {
//                  "type": "uri",
//                  "value": "http://dbpedia.org/resource/Richard_I_of_England"
//              }
//          ],
//       ...
my._lookupProperty = function(dict, property) {
	property = my._expandNamespacePrefix(property);
	var values = dict[property];
	for (var idx in values) {
	// only take english values if lang is present
	if (!values[idx]['lang'] || values[idx].lang == 'en') {
		return values[idx].value;
	}
	}
};

// Extract a standard set of attributes (e.g. title, description, dates etc
// etc) from rdfJson and the given subject uri (url) e.g.
// 
//      extractSummary('http://dbpedia.org/resource/Rufus_Pollock', rdfJson object from dbpedia)
my.extractSummary = function(subjectUri, rdfJson) {
	var properties = rdfJson[subjectUri];
	function lkup(attribs) {
	if (attribs instanceof Array) {
		var out = [];
		for (var idx in attribs) {
		var _tmp = my._lookupProperty(properties, attribs[idx]);
		if (_tmp) {
			out.push(_tmp);
		}
		}
		return out;
	} else {
		return my._lookupProperty(properties, attribs);
	}
	}

	var summaryInfo = {
	title: lkup('rdfs:label'),
	description: lkup('dbo:abstract'),
	summary: lkup('rdfs:comment'),
	startDates: lkup(['dbo:birthDate', 'dbo:formationDate', 'dbo:foundingYear']),
	endDates: lkup('dbo:deathDate'),
	// both dbp:date and dbo:date are usually present but dbp:date is
	// frequently "bad" (e.g. just a single integer rather than a date)
	// whereas ontology value is better
	date: lkup('dbo:date'),
	place: lkup('dbp:place'),
	birthPlace: lkup('dbo:birthPlace'),
	deathPlace: lkup('dbo:deathPlace'),
	source: lkup('foaf:page'),
	images: lkup(['dbo:thumbnail', 'foaf:depiction', 'foaf:img']),
	location: {
		lat: lkup('wgs:lat'),
		lon: lkup('wgs:long')
	},
	types: [],
	type: null
	};

	// getLastPartOfUrl
	function gl(url) {
	var parts = url.split('/');
	return parts[parts.length-1];
	}

	var typeUri = my._expandNamespacePrefix('rdf:type');
	var types = [];
	var typeObjs = properties[typeUri];
	for(var idx in typeObjs) {
	var value = typeObjs[idx].value;
	// let's be selective
	// ignore yago and owl stuff
	if (value.indexOf('dbpedia.org/ontology') != -1 || value.indexOf('schema.org') != -1 || value.indexOf('foaf/0.1') != -1) {
		// TODO: ensure uniqueness (do not push same thing ...)
		summaryInfo.types.push(gl(value));
		// use schema.org value as the default
		if (value.indexOf('schema.org') != -1) {
		summaryInfo.type = gl(value);
		}
	}
	}
	if (!summaryInfo.type && summaryInfo.types.length > 0) {
	summaryInfo.type = summaryInfo.types[0];
	}

	summaryInfo.start = summaryInfo.startDates.length > 0 ? summaryInfo.startDates[0] : summaryInfo.date;
	summaryInfo.end = summaryInfo.endDates;
	if (!summaryInfo.place) {
	// death place is more likely more significant than death place
	summaryInfo.place = summaryInfo.deathPlace || summaryInfo.birthPlace;
	}
	// if place a uri clean it up ...
	if (summaryInfo.place) {
	summaryInfo.place = gl(summaryInfo.place);
	}
	summaryInfo.location.title = summaryInfo.place;
	summaryInfo.image = summaryInfo.images ? summaryInfo.images[0] : null;

	return summaryInfo;
};

return my;
}();
  
  

  //  Get Info from Wikipedia ------------------------------------------------------------------------------------------------
jQuery(function() {
var q = parseQueryString(window.location.search);
if (q.url) {
	$('input[name="url"]').val(q.url);

	$('.loading').show();

	var display = function(info) {
	$('.loading').hide();
	$('.results').show();

	rawData = info.raw;
	var summaryInfo = info.summary;
	var properties = rawData[info.dbpediaUrl];

	for (var key in summaryInfo) {
		$('.summary .' + key).text(summaryInfo[key]);
	}
	$('.summary .thumbnail').attr('src', summaryInfo.image);
	var dataAsJson = JSON.stringify(summaryInfo, null, '    ');
	$('.summary .raw').val(dataAsJson);

	// Raw Data Summary
	var count = 0;
	for (var key in properties) {
		count += 1;
		$('.data-summary .properties').append(key + '\n');
	}
	$('.data-summary .count').text(count);

	// raw JSON
	dataAsJson = JSON.stringify(rawData, null, '    ');
	$('.results-json').val(dataAsJson);

	$('html,body').animate({
		scrollTop: $('#demo').offset()
		},
		'slow'
	);
	};

	WIKIPEDIA.getData(q.url, display, function(error) {
		alert(error);
	}
	);
}

$('.js-data-summary').click(function(e) {
	$('.data-summary').show();
});
});

// TODO: search of wikipedia
// http://en.wikipedia.org/w/api.php?action=query&format=json&callback=test&list=search&srsearch=%richard%

// Parse a URL query string (?xyz=abc...) into a dictionary.
parseQueryString = function(q) {
if (!q) {
	return {};
}
var urlParams = {},
	e, d = function (s) {
	return unescape(s.replace(/\+/g, " "));
	},
	r = /([^&=]+)=?([^&]*)/g;

if (q && q.length && q[0] === '?') {
	q = q.slice(1);
}
while (e = r.exec(q)) {
	// TODO: have values be array as query string allow repetition of keys
	urlParams[d(e[1])] = d(e[2]);
}
return urlParams;
};