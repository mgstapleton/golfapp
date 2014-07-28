/**
 * @author Michael Stapleton
 */
//

$(document).ready(function () {
    var locID = null;
    var locID2 = null;
    sessionStorage.clear;
    console.log("loaded index.js");
    createDb();
	addClub();
    $(logo).attr('align', 'absmiddle');
    dateFormat();
	bounds = new google.maps.LatLngBounds();
    locID = navigator.geolocation.getCurrentPosition(onSuccess, onError);
    locID2 = navigator.geolocation.getCurrentPosition(getDistsFromPhone, onError);
    
	if (typeof jQuery === "undefined") {
		alert("Jquery not present");
	}

	if (typeof jQuery !== "undefined") {
		console.log("jQuery binding initialization called");
		// Initialization that runs when each page loads for the first time

		$(document).on("pageshow", "#home_page", function (event) {
			// Do stuff now that the DOM is ready
			console.log("home pageshow triggered from document");
			console.log("event target id is: " + event.target.id);
			// $(".map_button").on('click', function (event, ui) {
			// getMap();
			// });
        });
			$(document).on("pagebeforeshow", "#map_page", function () {
				console.log("Other pagecreate for #map_page triggered");
				getMap();
			});
			$(document).on("pageshow", "#map_page", function () {
				console.log("map resize triggered");
				google.maps.event.trigger(map, 'resize');
				map.setOptions(myOptions);
			});
			$(document).on("pageshow", "#all_clubs_map_page", function () {
				console.log("map page show all triggered");
				showAllClubs();
			});
            $(document).on("pageshow", "#rad_map_page", function () {
				console.log("rad map page triggered");
                var radius = parseInt($("#rad-slider").val());
                console.log("radius " + radius);
				ShowClubsRad(radius);
			});
            $("#rad-slider").change(function() {
                var slider_value = $("#rad-slider").val();
                var slider_value_days = $("#rad-slider-days").val();
                $("#AllGolfClubRadButn").html("Show Clubs within " + slider_value + " km");
                $("#ListOpens").html("Show Open Competitions within " + slider_value + " km in the next " + slider_value_days + " days")
            });
            $("#rad-slider-days").change(function() {
                var slider_value = $("#rad-slider").val();
                var slider_value_days = $("#rad-slider-days").val();
                $("#ListOpens").html("Show Open Competitions within " + slider_value + " km in the next " + slider_value_days + " days")
            });
		//});
	} ;
});

function createDb () {
	db = null;
	//var resultJSON;
	db = window.openDatabase("golfapp_db", "1.0", "golfapp", 1000000);
	console.log("Database created");
	insertIntoDB();
}

var insertIntoDB = function () {
     console.log("insert called");
	 db.transaction(function (tx) {
		tx.executeSql('DROP TABLE IF EXISTS open_comps');
		tx.executeSql('CREATE TABLE IF NOT EXISTS open_comps (club , format, fixture, holes, start_date, cost, info)');
		$.each(fixtures, function (i, comp) {
			tx.executeSql('INSERT INTO open_comps (club, format, fixture, holes, start_date, cost, info) VALUES (?, ?, ?, ?, ?, ?, ?)', [comp.Club, comp.Format, comp.Fixture, comp.Holes, comp.Start_date, comp.Cost, comp.Info]);
		  }
		)
	},errorCB, successCB)
     $('.readyToGo').fadeIn(400).delay(2000).fadeOut(400);
     console.log("table created");
}

// to be completed to update the DB with new fixtures
var updateDB = function () {
     console.log("update called");
	 db.transaction(function (tx) {
		tx.executeSql('DROP TABLE IF EXISTS open_comps');
		tx.executeSql('CREATE TABLE IF NOT EXISTS open_comps (club , format, fixture, holes, start_date, cost, info)');
		$.each(fixtures, function (i, comp) {
			tx.executeSql('INSERT INTO open_comps (club, format, fixture, holes, start_date, cost, info) VALUES (?, ?, ?, ?, ?, ?, ?)', [comp.Club, comp.Format, comp.Fixture, comp.Holes, comp.Start_date, comp.Cost, comp.Info]);
		  }
		)
	},errorCB, successCB)
     $('.readyToGo').fadeIn(400).delay(2000).fadeOut(400);
     console.log("table created");
}

// Populate index page list with golf club locations
function addClub () {
	console.log("addclub triggered (from body onload)");
	var inx, node;
	var newId, newLink,	newPage;
	if (typeof jQuery === "undefined") {
		console.log('jQuery Mobile not defined.');
		for (inx = 0; inx < clubList.length; inx++) {
			node = document.createElement("a");
            document.getElementById("clubs").appendChild(document.createElement("li")).appendChild(node);
			node.setAttribute('href', 'HTML/Club.html');
			node.setAttribute('onclick', 'locationClicked(' + inx + ')');
			node.innerHTML = clubList[inx].club
		}
	} else {
		// Iterate through list of clubs
		$.each(clubList, function (i, item) {
            var clubName = item.club.split(" ").join('_');
			newId = '#' + clubName ;
			// Populate list of clubs
			var newLink = $("<a>").text(item.club).attr("href", newId).attr("onclick", 'locationClicked(' + i + ')');
            
			$("<li>").append(newLink).appendTo('#clubs');
            
			newPage = $("#sub_page").clone().attr("id", item.club.split(" ").join('_')).appendTo("body");
			// Clone template page and populate with club details
			$(newId + ">header>h1").html(item.club);
			$(newId + ">nav>img").attr("src", item.image).attr("align","centre");
            //$(newId + ">nav>img#image").html(item.image);
			$(newId + ">nav>p#address").html(item.address);
            var distance = parseInt(sessionStorage.getItem(item.club));
			$(newId + ">nav>p#dist").html(distance + "km");
            $(newId + ">nav>p#phone").html("<a href=tel:" + item.phone + ">" + item.phone + "</a>");
            $(newId + ">nav>a#website").attr("href", item.website).attr("alt", item.website);
            if (item.opensite !== 'none'){
            $(newId + ">nav>a#opensite").attr("href", item.opensite).attr("alt", item.opensite).html("Book Open Comp");
            }
            else
            {
                $(newId + ">nav>a#opensite").hide()
            }
            
            // Populate list items with open competitions form each club
            var clubName = item.club.replace(/"/g, "");
            
            
//            db.transaction(queryDB);
//            
//            function querySuccess(transcation, results){
//                var len = results.rows.length;
//                console.log("length " + len);
//                    if (results != null && results.rows != null) {
//                        for (var i = 0; i < results.rows.length; i++) {
//                        var row = results.rows.item(i);
//                        console.log("Club is " + row.club);
//                        var line = '<li><strong>Fixture type:</strong> ' + row.fixture + '<strong>   Start Date: </strong>' + 
//                                    row.start_date + '<strong>    Cost: </strong>' + row.cost + '</li>';
//                        listgroup+=line; 
//                        return listgroup;
//                    }
//                    $(newId + ">nav>ul#localComps1").html(item.club);
//                    console.log("litem:" + listgroup);
//                    $(newId + ">nav>ul#localComps").html(listgroup);
//                }
//                };
             clubReturn = item.club;
             getList(newId,clubReturn);       
		});
	}
};

function getList(newId,clubReturn){
     console.log("club is:" + clubReturn + newId);
     var listgroup = "";
     db.transaction(
         function(transaction) {
            transaction.executeSql(
                'SELECT * FROM open_comps where club = "' + clubReturn +'"', 
                [],
                function(transaction, results) {
                    var len = results.rows.length;
                    console.log("len" + len);
                    if (results != null && results.rows != null) {
                        for (var i = 0; i < results.rows.length; i++) {
                          var row = results.rows.item(i);
                            console.log("Club is " + row.club);
                            var line = '<li><strong>Fixture type:</strong> ' + row.fixture + '<strong>   Start Date: </strong>' + 
                                    row.start_date + '<strong>    Cost: </strong>' + row.cost + '</li>';
                            listgroup+=line;
                             console.log("litem:" + listgroup);
                             $(newId + ">nav>ul#localComps").html(listgroup);
                             $(newId + ">nav>p#localComps").listview('refresh');
                             console.log("Refreshing listview search2");     
                             $(newId + ">nav>ul#localComps").trigger('create');
                            }
                        }
                     console.log(listgroup);
                    //callback(listgroup);
                },errorHandler);
            },errorCB, successCB, nullHandler);
};

function retrieveLabels(callback) {
    var labels = [];
    var getLabelsQuery = "SELECT DISTINCT label FROM items ORDER BY label;"
    db.transaction(function(tx) {
        tx.executeSql(getLabelsQuery, [],
            function(tx, labelsResults) {
                for (var x = 0; x < labelsResults.rows.length; x++) {
                    var labelsRow = labelsResults.rows.item(x);
                    labels.push(labelsRow['label']);
                }               

                callback(labels);
            }           
        );      
    }); 
}

function refreshLists (){
    $.each(clubList, function (i, item) {
        var clubName = item.club.split(" ").join('_');
        newId2 = '#' + clubName ;
          $(newId2 + ">nav>p#localComps").listview('refresh');
          console.log("Refreshing listview search2");     
          $(newId2 + ">nav>ul#localComps").trigger('create');
 });   
}

function queryDB(transaction, club){
    transaction.executeSql('SELECT * FROM open_comps where club = "' + club +'"', [], querySuccess, errorCB);
}

function dateFormat (){
    var fullDate = new Date()
    //Thu May 19 2011 17:25:38 GMT+1000 {}
    //convert month to 2 digits
    var twoDigitMonth = ((fullDate.getMonth().length+1) === 1) ?(fullDate.getMonth()+1) : '0' + (fullDate.getMonth()+1);
    //console.log("Current Date " + fullDate.getDate());
    var day = fullDate.getDate();
    var dayString=day.toString();
    var twoDigitDate = day;
    if (day<10){twoDigitDate = "0"+day};
    //var twoDigitDate = ((fullDate.getDate().length+1) === 2) ? (fullDate.getDate()) : '0' + (fullDate.getDate());
    currentDate = twoDigitDate + "/" + twoDigitMonth + "/" + fullDate.getFullYear();
    //console.log(currentDate);
    
    days = parseInt($("#rad-slider-days").val());
    for (var i = 1; i <= days; i++) {
        var nextDay = new Date();
        nextDay.setDate(fullDate.getDate() + i);
        var twoDigitMonthi = ((nextDay.getMonth().length+1) === 1) ?(nextDay.getMonth()+1) : '0' + (nextDay.getMonth()+1);
        var dayi = nextDay.getDate();
        //parseInt(dayi);
        //console.log(dayi);
        var twoDigitDatei = dayi;
        if (dayi<10){twoDigitDatei = "0"+dayi};
        var datei = twoDigitDatei + "/" + twoDigitMonthi + "/" + nextDay.getFullYear();
        sessionStorage.setItem("day" + i, datei)
        //console.log(datei);
    }        
};

// this is called when an error happens in a transaction
function errorHandler(transaction, error) {
   alert('Error: ' + error.message + ' code: ' + error.code);
 
}

function nullHandler(){};

function searchResults() {
    var datesList = '\"' + currentDate + '\"';
    for (var i = 1; i <= days; i++) {
        var nextday = sessionStorage.getItem("day"+i);
        datesList = datesList + "," + '\"' + nextday + '\"';
    }
    var line;
     if (!window.openDatabase) {
      alert('Databases are not supported in this browser.');
      return;
     }
 
// this line clears out any content in the #searchResult element on the page so that the next few lines will show updated content and not just keep repeating lines
    $('#searchResults').html('');
    var radius = parseInt($("#rad-slider").val())
// this next section will select all the content from the comps table and then go through it row by row appending the selected cols to the  #searchResults element on the page
    db.transaction(function(transaction) {
     transaction.executeSql('SELECT * FROM open_comps where start_date in (' + datesList + ');', [],
     function(transaction, result) {
      if (result != null && result.rows != null) {
        for (var i = 0; i < result.rows.length; i++) {
          var row = result.rows.item(i);
            var distance = sessionStorage.getItem(row.club);
            console.log("Club is " + row.club);
            if (distance < radius){
            //var link = JSON.parse(localStorage.getItem(row.club.split(" ").join('_') + "_link"));
            line = '<a href=index.html#' + row.club.split(" ").join('_') + '> '+ row.club +' <p><strong>Fixture type:</strong> ' + row.fixture + '  <strong>    Start Date: </strong>' + row.start_date + '    <strong>    Cost: </strong>' + row.cost + '</p></a>';
//            var newComp = '<li>'+line+'</li>';
                $("<li>").attr('class','ui-first-child ui-last-child').append(line).appendTo('#searchResults');
            }
        }
          $("#searchResults").listview('refresh');
          console.log("Refreshing listview search");     
          $("#searchResults").trigger('create');
      }
     },errorHandler);
 },errorHandler,nullHandler);
 //return;
}

function searchResultsTable() {
    console.log("Table Called");
    // clear div
    $('#resultsTable').html('');
    var myTableDiv = document.getElementById("resultsTable")
    
    var cols = getHeaders(fixtures);
    
     if (!window.openDatabase) {
      alert('Databases are not supported in this browser.');
      return;
     }
    
     db.transaction(function(transaction) {
        transaction.executeSql('SELECT * FROM open_comps where start_date in ("'+ tomorrow + '","' + currentDate + '");', [],
     function(transaction, result) {
      if (result != null && result.rows != null) {
        $('#resultsTable').html(createTable(result, cols));  
        }
      },errorHandler);
     },errorCB, successCB,nullHandler);
    
    $("#resultsTable").table('refresh');
    $("#resultsTable").trigger('create');
 };
// return;
//};

function getHeaders(obj) {
        var cols = new Array();
        var p = obj[0];
        for (var key in p) {
            //alert(' name=' + key + ' value=' + p[key]);
            cols.push(key);
        }
    console.log(cols);
        return cols;
    };

function createTable(result, cols) {
    var table = document.createElement('TABLE')
    var tableBody = document.createElement('TBODY')
    table.border = '1'
    table.appendChild(tableBody);
    console.log("Table Created");
    console.log(result.rows);
        var table = $('<table border=1 data-role="table" data-mode="columntoggle" class="ui-responsive"></table>');
        var th = $('<tr></tr>');
        for (var i = 0; i < cols.length; i++) {
            th.append('<th>' + cols[i] + '</th>');
        }
        table.append(th);
    
    for (var j = 0; j < 40; j++) {  //result.rows.length
            
            var row = result.rows.item(j);
            
            var tr = document.createElement('TR');
                for (k = 0; k < row.length; k++) { //row[k].length
                    console.log("rowLen" + row.length);
                    var td = document.createElement('TD')
                    td.appendChild(document.createTextNode(row[k]));
                    tr.appendChild(td)
    }
    tableBody.appendChild(tr);
    }
    return table;
};

function errorCB(err) {
    alert("Error processing SQL: "+err);
    console.log("Error processing SQL: "+err);
}

function successCB() {
    console.log("Success");
}

function getDistsFromPhone(position){
    clubDists = {};
    $.each(clubList, function (i, item) {
        var lat2=item.location.lat;
        var lon2=item.location.lon;
        var dist1=getDistanceFromLatLonInKm(position.coords.latitude,position.coords.longitude,lat2,lon2);
        clubDists[item.club]=dist1;
        sessionStorage.setItem(item.club,dist1);
    });
    
}

function getDistanceFromLatLonInKm(lat1,lon1,lat2,lon2) {
  var R = 6371; // Radius of the earth in km
  var dLat = deg2rad(lat2-lat1);  // deg2rad below
  var dLon = deg2rad(lon2-lon1); 
  var a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2)
    ; 
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  var d = R * c; // Distance in km
  var dist = d.toFixed(2);
  return dist;
}

function deg2rad(deg) {
  return deg * (Math.PI/180)
}

// Save index of selected location
var locationClicked = function (locat) {
	(locat !== "") ? locator.setLocation(locat) : locator.setLocation("blank");
};

// Populate club details
var loadData = function () {
	console.log("loadData triggered (from doc)");
	var i = locator.getLocation();
	document.title = clubList[i].club + ' golf club';
	document.getElementById("header").innerHTML = clubList[i].club;
	//document.getElementById("flag").src = clubList[i].image;
	document.getElementById("address").innerHTML = clubList[i].address;
};

// Initialize and display map
var getMap = function () {
	// Get URL for previous page for non-jQuery Mobile version
	console.log("getMap triggered from document");
	if (typeof jQuery === "undefined") {
		document.getElementById('back').href = document.referrer;
	}

	// Get club coordinates and display map
	var club = clubList[locator.getLocation()];
	var clubLocation = new google.maps.LatLng(club.location.lat, club.location.lon);
	myOptions = {
		center : clubLocation,
		zoom : 12,
		mapTypeId : google.maps.MapTypeId.ROADMAP
	};
	map = new google.maps.Map(document.getElementById("map_canvas"), myOptions);

	// Display a marker on the map
	var marker = new google.maps.Marker({
			position : clubLocation,
			map : map,
			title : club.club + " golf club is here!"
		});
};

function ShowClubsRad(radius){
    var distance;
    console.log("showClubsRad triggered");
    var bounds = new google.maps.LatLngBounds();
	var myOptions = {
		zoom : 6,
		mapTypeId : google.maps.MapTypeId.ROADMAP
	}
	mapRad = new google.maps.Map(document.getElementById("map_canvas3"), myOptions);
    var infoWindow = new google.maps.InfoWindow(), marker,i;
    $.each(clubList, function (i, gc) {
    distance = sessionStorage.getItem(gc.club);
    //if distance less than radius show marker on map
    if (distance < radius){
        var position = new google.maps.LatLng(gc.location.lat, gc.location.lon);
        var radMarker = new google.maps.Marker({
				position : position,
				map : mapRad,
				title : gc.club+ " GC " + distance + "km away"
			});
        bounds.extend(position);
        var infoText = gc.club + " GC\n" + distance + "km away";
        bindInfoWindow(radMarker, mapRad, infoWindow, infoText);
    } 
});
    mapRad.fitBounds(bounds);
}

var showAllClubs = function () {
	console.log("showAllClubs triggered from document");
	var bounds = new google.maps.LatLngBounds();
	var myOptions = {
		zoom : 7,
		mapTypeId : google.maps.MapTypeId.ROADMAP
	}
	mapAll = new google.maps.Map(document.getElementById("map_canvas2"), myOptions);

	// Display multiple markers on a map
    var infoWindow = new google.maps.InfoWindow(), marker, i;
	for (i = 0; i < clubList.length; i++) {
		locator.setLocation(i);
		var club1 = clubList[locator.getLocation()];
		var position = new google.maps.LatLng(club1.location.lat, club1.location.lon);
		bounds.extend(position);
		var marker = new google.maps.Marker({
				position : position,
				map : mapAll,
				title : club1.club + " Golf Club"
			});
        
		// Allow each marker to have an info window
        var infoText=club1.club + " Golf Club";
        bindInfoWindow(marker, mapAll, infoWindow, infoText);

		// Automatically center the map fitting all markers on the screen
		mapAll.fitBounds(bounds);
	}
	// Override our map zoom level once our fitBounds function runs (Make sure it only runs once)
//	var boundsListener = google.maps.event.addListener((mapAll), 'bounds_changed', function (event) {
//			this.setZoom(5);
//			google.maps.event.removeListener(boundsListener);
//		});
}
//};

function bindInfoWindow(marker, map, infowindow, strDescription) {
    google.maps.event.addListener(marker, 'click', function() {
        infowindow.setContent(strDescription);
        infowindow.open(map, marker);
    });
}

function onSuccess(position) {
        var element = document.getElementById('geolocation');
//        element.innerHTML = 'Latitude: '           + position.coords.latitude              + '<br />' +
//                            'Longitude: '          + position.coords.longitude             + '<br />' +
//                            'Altitude: '           + position.coords.altitude              + '<br />' +
//                            'Accuracy: '           + position.coords.accuracy              + '<br />' +
//                            'Altitude Accuracy: '  + position.coords.altitudeAccuracy      + '<br />' +
//                            'Heading: '            + position.coords.heading               + '<br />' +
//                            'Speed: '              + position.coords.speed                 + '<br />' 
//                          +  'Timestamp: '          + position.timestamp          + '<br />'
//            ;
    }

    // onError Callback receives a PositionError object
    //
function onError(error) {
        alert('code: '    + error.code    + '\n' +
                'message: ' + error.message + '\n');
    }

// These functions are exposed as a module named "locator"
var locator = (function () {
	// Private members
	var setLoc = function (loc) {
		if (typeof(Storage) !== "undefined") {
			sessionStorage.location = loc;
		} else {
			alert("Can't set location - there is no local storage support on this browser.");
		}
	}

var getLoc = function () {
		if (typeof(Storage) !== "undefined") {
			return sessionStorage.location;
		} else {
			alert("Can't get location - there is no local storage support on this browser.");
		}
	}
    
var getFix = function () {
		if (typeof(Storage) !== "undefined") {
			return sessionStorage.fixtures;
		} else {
			alert("Can't get fixtures - there is no local storage support on this browser.");
		}
	}

	return {
		// Exposed functions
		setLocation : setLoc,
		getLocation : getLoc,
        getFixtures : getFix
	};
}

	());